import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileLink, ProfilePost } from "@/types/database";

const platformName: Record<string, string> = { instagram: "Instagram", x: "X", youtube: "YouTube" };

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id, username, display_name, bio, avatar_url").eq("username", username).eq("is_public", true).maybeSingle();
  if (!profile) notFound();
  const [{ data: links }, { data: posts }] = await Promise.all([supabase.from("profile_links").select("*").eq("profile_id", profile.id).eq("is_visible", true).order("position"), supabase.from("profile_posts").select("*").eq("profile_id", profile.id).order("published_at", { ascending: false })]);
  const recentPosts = (posts ?? []) as ProfilePost[];

  return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-16 text-center">
    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-28 w-28 rounded-full object-cover" /> : <div className="h-28 w-28 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />}
    <h1 className="mt-5 text-3xl font-black">{profile.display_name}</h1><p className="mt-1 text-slate-400">@{profile.username}</p>{profile.bio && <p className="mt-4 text-slate-300">{profile.bio}</p>}
    <div className="mt-8 w-full space-y-3">{((links ?? []) as ProfileLink[]).map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="card block w-full px-5 py-4 font-bold transition hover:-translate-y-0.5">{platformName[link.platform] ?? link.title}</a>)}</div>
    <section className="mt-10 w-full text-left"><h2 className="text-xl font-bold">최근 게시물</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{["instagram", "x", "youtube"].map((platform) => { const items = recentPosts.filter((post) => post.platform === platform).slice(0, 3); return <div key={platform} className="rounded-xl border border-slate-700 p-3"><p className="text-sm font-semibold text-cyan-200">{platformName[platform]}</p><div className="mt-2 space-y-2">{items.length ? items.map((post) => <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="block truncate text-sm hover:text-cyan-200">{post.title}</a>) : <p className="text-sm text-slate-500">등록된 게시물이 없습니다.</p>}</div></div>; })}</div></section>
  </main>;
}
