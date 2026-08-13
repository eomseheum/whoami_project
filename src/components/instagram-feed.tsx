import { getInstagramFeedForProfile } from "@/lib/instagram";

export async function InstagramFeed({ profileId, instagramUrl }: { profileId: string; instagramUrl?: string }) {
  const media = await getInstagramFeedForProfile(profileId);
  if (!media?.length) return null;
  return <section className="mt-10 w-full text-left">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Instagram</h2><a href={instagramUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Instagram에서 보기</a></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{media.map((post) => {
      const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
      if (!imageUrl) return null;
      return <a key={post.id} href={post.permalink} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800"><img src={imageUrl} alt={post.caption?.slice(0, 120) || "Instagram 게시물"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />{post.media_type === "VIDEO" && <span className="absolute right-2 top-2 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-bold">REEL</span>}</a>;
    })}</div>
  </section>;
}
