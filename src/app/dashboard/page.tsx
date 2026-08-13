import Link from "next/link";
import { InstagramRecommendationCard } from "@/components/instagram-recommendation-card";
import { createClient } from "@/lib/supabase/server";
import { getInstagramFeedForProfile } from "@/lib/instagram";
import type { Profile, ProfileLink, ProfilePost } from "@/types/database";

const names: Record<string, string> = { instagram: "Instagram", x: "X", youtube: "YouTube" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profileRows }, { data: ownProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(24),
    user ? supabase.from("profiles").select("id, username, display_name, avatar_url").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null })
  ]);
  const profiles = (profileRows ?? []) as Profile[];
  const ids = profiles.map((profile) => profile.id);
  const [linksResponse, postsResponse, ownInstagramResponse] = await Promise.all([
    ids.length ? supabase.from("profile_links").select("*").in("profile_id", ids).eq("is_visible", true).order("position") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("profile_posts").select("*").in("profile_id", ids).order("published_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ownProfile ? supabase.from("profile_links").select("url").eq("profile_id", ownProfile.id).eq("platform", "instagram").eq("is_visible", true).maybeSingle() : Promise.resolve({ data: null })
  ]);
  const links = (linksResponse.data ?? []) as ProfileLink[];
  const posts = (postsResponse.data ?? []) as ProfilePost[];
  const ownInstagramUrl = ownInstagramResponse.data?.url;
  const instagramPosts = (await getInstagramFeedForProfile(ownInstagramUrl))?.slice(0, 3) ?? [];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const recommendations = posts.slice(0, 9);

  return <div className="space-y-7">
    <section className="card overflow-hidden p-7">
      <p className="text-sm font-bold tracking-[0.2em] text-cyan-300">FOR YOU</p>
      <h1 className="mt-2 text-3xl font-black">새로운 크리에이터를 만나보세요</h1>
      <p className="mt-3 text-slate-400">공개된 SNS 활동을 바탕으로 최신 게시물을 추천합니다.</p>
    </section>

    <section>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">추천 게시물</h2><span className="text-sm text-slate-500">최신순</span></div>
      {instagramPosts.length || recommendations.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {instagramPosts.length > 0 && ownProfile && <InstagramRecommendationCard posts={instagramPosts} username={ownProfile.username} displayName={ownProfile.display_name} avatarUrl={ownProfile.avatar_url} />}
        {recommendations.map((post) => {
          const owner = profileById.get(post.profile_id);
          if (!owner) return null;
          return <article key={post.id} className="card overflow-hidden"><div className="flex aspect-[16/10] items-end bg-gradient-to-br from-fuchsia-500/40 via-slate-800 to-cyan-400/30 p-4"><span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold">{names[post.platform]}</span></div><div className="p-4"><a href={post.url} target="_blank" rel="noreferrer" className="block truncate font-bold hover:text-cyan-200">{post.title}</a><Link href={`/u/${owner.username}`} className="mt-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white">{owner.avatar_url ? <img src={owner.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="h-5 w-5 rounded-full bg-cyan-300" />}{owner.display_name}</Link></div></article>;
        })}
      </div> : <div className="card p-8 text-slate-400">아직 추천할 게시물이 없습니다.</div>}
    </section>

    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">인기 크리에이터</h2><span className="text-sm text-slate-500">새로 가입한 순</span></div>{profiles.length ? <div className="grid gap-4 md:grid-cols-2">{profiles.map((profile) => { const userLinks = links.filter((link) => link.profile_id === profile.id); return <article key={profile.id} className="card p-5"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />}<div className="min-w-0"><Link href={`/u/${profile.username}`} className="block truncate font-bold hover:text-cyan-200">{profile.display_name}</Link><p className="text-sm text-slate-400">@{profile.username}</p></div></div><Link href={`/u/${profile.username}`} className="text-sm font-bold text-cyan-300">보기</Link></div>{profile.bio && <p className="mt-4 line-clamp-2 text-sm text-slate-300">{profile.bio}</p>}<div className="mt-4 flex flex-wrap gap-2">{userLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600 px-3 py-1 text-xs hover:border-cyan-300">{names[link.platform] ?? link.title}</a>)}</div></article>; })}</div> : <div className="card p-8 text-slate-400">아직 다른 공개 프로필이 없습니다.</div>}</section>
  </div>;
}
