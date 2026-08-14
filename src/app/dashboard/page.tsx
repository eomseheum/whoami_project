import Link from "next/link";
import { CreatorRecommendationCard, type RecommendationItem } from "@/components/creator-recommendation-card";
import { InstagramConnectionNotice } from "@/components/instagram-connection-notice";
import { createClient } from "@/lib/supabase/server";
import { getInstagramFeedForProfile } from "@/lib/instagram";
import { getYouTubeFeed } from "@/lib/youtube";
import { getBlogFeed } from "@/lib/blog";
import type { Profile, ProfileLink, ProfilePost } from "@/types/database";

const names: Record<string, string> = { instagram: "Instagram", x: "X", youtube: "YouTube", blog: "블로그" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profileRows }, { data: ownProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(24),
    user ? supabase.from("profiles").select("id, username, display_name, avatar_url").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null })
  ]);
  const profiles = (profileRows ?? []) as Profile[];
  const ids = [...new Set([...profiles.map((profile) => profile.id), ownProfile?.id].filter(Boolean))] as string[];
  const [linksResponse, postsResponse] = await Promise.all([
    ids.length ? supabase.from("profile_links").select("*").in("profile_id", ids).eq("is_visible", true).order("position") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("profile_posts").select("*").in("profile_id", ids).order("published_at", { ascending: false }) : Promise.resolve({ data: [] })
  ]);
  const links = (linksResponse.data ?? []) as ProfileLink[];
  const posts = (postsResponse.data ?? []) as ProfilePost[];
  const instagramPosts = (await getInstagramFeedForProfile(ownProfile?.id))?.slice(0, 3) ?? [];
  const ownYouTubeUrl = links.find((link) => link.profile_id === ownProfile?.id && link.platform === "youtube")?.url;
  const youtubeVideos = (await getYouTubeFeed(ownYouTubeUrl)) ?? [];
  const blogPosts = (await getBlogFeed(ownProfile?.id)) ?? [];
  const creators = new Map<string, Profile>(profiles.map((profile) => [profile.id, profile]));
  if (ownProfile) creators.set(ownProfile.id, { ...ownProfile, user_id: user?.id ?? "", bio: null, theme: "", is_public: true, is_demo: false, created_at: "", updated_at: "" });
  const itemsByProfile = new Map<string, RecommendationItem[]>();
  const addItem = (profileId: string, item: RecommendationItem) => itemsByProfile.set(profileId, [...(itemsByProfile.get(profileId) ?? []), item]);

  posts.forEach((post) => addItem(post.profile_id, { id: post.id, platform: post.platform, title: post.title, url: post.url }));
  if (ownProfile) {
    instagramPosts.forEach((post) => {
      const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
      if (imageUrl) addItem(ownProfile.id, { id: `instagram-${post.id}`, platform: "instagram", title: post.caption?.split("\n")[0]?.trim() || "Instagram 게시물", url: post.permalink, imageUrl, isVideo: post.media_type === "VIDEO" });
    });
    youtubeVideos.forEach((video) => addItem(ownProfile.id, { id: `youtube-${video.id}`, platform: "youtube", title: video.title, url: video.url, imageUrl: video.thumbnailUrl, isVideo: true }));
    blogPosts.forEach((post) => addItem(ownProfile.id, { id: `blog-${post.id}`, platform: "blog", title: post.title, url: post.url }));
  }
  const recommendationGroups = [...itemsByProfile.entries()].map(([profileId, items]) => ({ profile: creators.get(profileId), items, links: links.filter((link) => link.profile_id === profileId) })).filter((group) => group.profile && group.items.length);

  return <div className="space-y-7">
    <section className="card overflow-hidden p-7"><p className="text-sm font-bold tracking-[0.2em] text-cyan-300">FOR YOU</p><h1 className="mt-2 text-3xl font-black">새로운 크리에이터를 만나보세요</h1><p className="mt-3 text-slate-400">공개된 SNS 활동을 바탕으로 최신 게시물을 추천합니다.</p></section>
    <InstagramConnectionNotice />
    {ownProfile && <div><Link href="/auth/instagram/start" className="inline-flex rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-300/10">Instagram 피드 연결</Link></div>}
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">추천 게시물</h2><span className="text-sm text-slate-500">크리에이터별 모아보기</span></div>{recommendationGroups.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recommendationGroups.map(({ profile, items, links: creatorLinks }) => profile && <CreatorRecommendationCard key={profile.id} items={items} links={creatorLinks} username={profile.username} displayName={profile.display_name} avatarUrl={profile.avatar_url} />)}</div> : <div className="card p-8 text-slate-400">아직 추천할 게시물이 없습니다.</div>}</section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">인기 크리에이터</h2><span className="text-sm text-slate-500">새로 가입한 순</span></div>{profiles.length ? <div className="grid gap-4 md:grid-cols-2">{profiles.map((profile) => { const userLinks = links.filter((link) => link.profile_id === profile.id); return <article key={profile.id} className="card p-5"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />}<div className="min-w-0"><Link href={`/u/${profile.username}`} className="block truncate font-bold hover:text-cyan-200">{profile.display_name}</Link><p className="text-sm text-slate-400">@{profile.username}</p></div></div><Link href={`/u/${profile.username}`} className="text-sm font-bold text-cyan-300">보기</Link></div>{profile.bio && <p className="mt-4 line-clamp-2 text-sm text-slate-300">{profile.bio}</p>}<div className="mt-4 flex flex-wrap gap-2">{userLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600 px-3 py-1 text-xs hover:border-cyan-300">{names[link.platform] ?? link.title}</a>)}</div></article>; })}</div> : <div className="card p-8 text-slate-400">아직 다른 공개 프로필이 없습니다.</div>}</section>
  </div>;
}
