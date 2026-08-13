import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TokenResponse = { access_token?: string; user_id?: string; error_type?: string; error_message?: string };
type LongLivedTokenResponse = { access_token?: string; expires_in?: number };
type InstagramAccount = { id?: string; username?: string };

function siteUrl(request: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

function dashboardRedirect(request: NextRequest, status: string) {
  return NextResponse.redirect(new URL(`/dashboard?instagram=${status}`, request.url));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("instagram_oauth_state")?.value;
  if (!code || !state || state !== storedState) return dashboardRedirect(request, "authorization_failed");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!user || !admin || !appId || !appSecret) return dashboardRedirect(request, "configuration_error");

  const callbackUrl = `${siteUrl(request)}/auth/instagram/callback`;
  const tokenForm = new URLSearchParams({ client_id: appId, client_secret: appSecret, grant_type: "authorization_code", redirect_uri: callbackUrl, code });
  const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: tokenForm, cache: "no-store" });
  const shortLived = await tokenResponse.json() as TokenResponse;
  if (!tokenResponse.ok || !shortLived.access_token) return dashboardRedirect(request, "authorization_failed");

  const exchangeUrl = new URL("https://graph.instagram.com/access_token");
  exchangeUrl.searchParams.set("grant_type", "ig_exchange_token");
  exchangeUrl.searchParams.set("client_secret", appSecret);
  exchangeUrl.searchParams.set("access_token", shortLived.access_token);
  const exchangeResponse = await fetch(exchangeUrl, { cache: "no-store" });
  const longLived = await exchangeResponse.json() as LongLivedTokenResponse;
  const accessToken = longLived.access_token || shortLived.access_token;
  const accountUrl = new URL("https://graph.instagram.com/me");
  accountUrl.searchParams.set("fields", "id,username");
  accountUrl.searchParams.set("access_token", accessToken);
  const accountResponse = await fetch(accountUrl, { cache: "no-store" });
  const account = await accountResponse.json() as InstagramAccount;
  if (!accountResponse.ok || !account.id || !account.username) return dashboardRedirect(request, "account_failed");

  const { data: profile } = await admin.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (!profile) return dashboardRedirect(request, "profile_missing");
  const expiry = longLived.expires_in ? new Date(Date.now() + longLived.expires_in * 1000).toISOString() : null;
  const { error } = await admin.from("instagram_connections").upsert({ profile_id: profile.id, instagram_user_id: account.id, username: account.username, access_token: accessToken, token_expires_at: expiry, updated_at: new Date().toISOString() });
  if (error) return dashboardRedirect(request, "save_failed");

  const { data: existingLink } = await admin.from("profile_links").select("id").eq("profile_id", profile.id).eq("platform", "instagram").maybeSingle();
  const link = { platform: "instagram", title: "Instagram 프로필", url: `https://www.instagram.com/${account.username}`, position: 0, is_visible: true };
  if (existingLink) await admin.from("profile_links").update(link).eq("id", existingLink.id);
  else await admin.from("profile_links").insert({ profile_id: profile.id, ...link });
  const response = dashboardRedirect(request, "connected");
  response.cookies.delete("instagram_oauth_state");
  return response;
}
