import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile, isKakaoUser } from "@/lib/supabase/profile";

function safeNextPath(path: string | null) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error_description");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (oauthError) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", oauthError);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "인증 코드가 없습니다. 다시 시도해 주세요.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "로그인 세션을 만들지 못했습니다. 다시 시도해 주세요.");
    return NextResponse.redirect(loginUrl);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { error: profileError } = await ensureUserProfile(supabase, user);
  if (profileError) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "기본 프로필을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return NextResponse.redirect(loginUrl);
  }

  if (isKakaoUser(user) && user.user_metadata?.onboarding_completed !== true) {
    const onboardingUrl = new URL("/onboarding", request.url);
    onboardingUrl.searchParams.set("next", next);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
