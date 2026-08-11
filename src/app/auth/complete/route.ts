import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/profile";

function safeNextPath(path: string | null) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { error } = await ensureUserProfile(supabase, user);
  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "기본 프로필을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url));
}
