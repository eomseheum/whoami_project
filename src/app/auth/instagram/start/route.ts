import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function siteUrl(request: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/dashboard", request.url));

  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) return NextResponse.redirect(new URL("/dashboard?instagram=configuration_error", request.url));

  const state = crypto.randomUUID();
  const callbackUrl = `${siteUrl(request)}/auth/instagram/callback`;
  const authorizationUrl = new URL("https://www.instagram.com/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "instagram_business_basic");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("enable_fb_login", "0");

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set("instagram_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
