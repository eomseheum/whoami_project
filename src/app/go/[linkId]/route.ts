import { NextRequest, NextResponse } from "next/server";

const demoTargets: Record<string, string> = {
  youtube: "https://youtube.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com"
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const target = demoTargets[linkId];
  if (!target) return NextResponse.redirect(new URL("/", _request.url));
  // TODO: Supabase에 click event 저장
  return NextResponse.redirect(target);
}
