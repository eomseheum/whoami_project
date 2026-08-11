import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createClient } from "@/lib/supabase/server";
import { isKakaoUser } from "@/lib/supabase/profile";

export const metadata: Metadata = { title: "가입 완료" };

function safeNextPath(path?: string) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isKakaoUser(user) || user.user_metadata?.onboarding_completed === true) redirect(safeNextPath(params.next));

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-16 h-80 w-80 rounded-full bg-[#FEE500]/10 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <Link href="/" className="mb-8 block text-center text-2xl font-black tracking-tight">
          Profile<span className="text-cyan-300">Hub</span>
        </Link>
        <section className="card p-7 shadow-2xl shadow-slate-950/40 sm:p-9">
          <div>
            <span className="inline-flex rounded-full bg-[#FEE500] px-3 py-1 text-xs font-bold text-[#191919]">카카오 인증 완료</span>
            <h1 className="mt-4 text-3xl font-black">마지막 가입 정보</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">ProfileHub에서 사용할 아이디와 로그인 정보를 설정해 주세요.</p>
          </div>

          <OnboardingForm
            email={user.email ?? null}
            initialDisplayName={profile?.display_name ?? user.user_metadata?.full_name ?? ""}
            nextPath={safeNextPath(params.next)}
          />
        </section>
      </div>
    </main>
  );
}
