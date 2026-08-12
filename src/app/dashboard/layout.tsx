import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ensureUserProfile, isKakaoUser } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  await ensureUserProfile(supabase, user);
  if (isKakaoUser(user) && user.user_metadata?.onboarding_completed !== true) redirect("/onboarding?next=/dashboard");
  const { data: profile } = await supabase.from("profiles").select("display_name, username, avatar_url").eq("user_id", user.id).maybeSingle();

  return <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
    <header className="mb-8 flex items-center justify-between"><Link href="/dashboard" className="text-xl font-bold">ProfileHub</Link><div className="flex items-center gap-3"><details className="relative"><summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 hover:border-cyan-300"><span className="hidden text-right sm:block"><span className="block text-sm font-bold">{profile?.display_name ?? "내 계정"}</span><span className="block text-xs text-slate-400">@{profile?.username ?? "user"}</span></span>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />}</summary><div className="card absolute right-0 z-10 mt-2 w-52 p-2"><Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-800">내 프로필</Link><Link href="/dashboard/links" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-800">SNS 계정 연동</Link><Link href="/dashboard/settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-800">계정 설정</Link><div className="border-t border-slate-700 pt-1"><LogoutButton /></div></div></details></div></header>
    <main>{children}</main>
  </div>;
}
