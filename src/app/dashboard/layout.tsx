import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ensureUserProfile, isKakaoUser } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

const items = [
  ["프로필", "/dashboard/profile"],
  ["링크", "/dashboard/links"],
  ["디자인", "/dashboard/design"],
  ["분석", "/dashboard/analytics"]
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");
  await ensureUserProfile(supabase, user);
  if (isKakaoUser(user) && user.user_metadata?.onboarding_completed !== true) {
    redirect("/onboarding?next=/dashboard");
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-4">
        <Link href="/" className="mb-6 block text-xl font-bold">ProfileHub</Link>
        <nav className="space-y-2">
          {items.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 hover:bg-slate-800">{label}</Link>)}
        </nav>
        <LogoutButton />
      </aside>
      <section>{children}</section>
    </div>
  );
}
