import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileLink } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");
  const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("user_id", user.id).single();
  const { data: links } = profile ? await supabase.from("profile_links").select("*").eq("profile_id", (await supabase.from("profiles").select("id").eq("user_id", user.id).single()).data?.id ?? "") : { data: [] };
  const socialLinks = (links ?? []) as ProfileLink[];
  return <div className="space-y-6"><section className="card p-7"><h1 className="text-3xl font-black">계정 설정</h1><dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between border-b border-slate-700 pb-3"><dt className="text-slate-400">이메일</dt><dd>{user.email}</dd></div><div className="flex justify-between border-b border-slate-700 pb-3"><dt className="text-slate-400">공개 사용자명</dt><dd>@{profile?.username}</dd></div></dl></section><section className="card p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">SNS 계정 연동</h2><p className="mt-2 text-sm text-slate-400">연결한 링크와 최신 게시물을 관리합니다.</p></div><Link href="/dashboard/links" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">관리하기</Link></div><div className="mt-5 flex flex-wrap gap-2">{socialLinks.length ? socialLinks.map((link) => <span key={link.id} className="rounded-full border border-cyan-300/50 px-3 py-1 text-sm text-cyan-100">{link.platform}</span>) : <p className="text-sm text-slate-500">아직 연결된 SNS가 없습니다.</p>}</div></section></div>;
}
