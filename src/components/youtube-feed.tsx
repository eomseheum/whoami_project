import { getYouTubeFeed } from "@/lib/youtube";

export async function YouTubeFeed({ channelUrl }: { channelUrl?: string }) {
  const videos = await getYouTubeFeed(channelUrl);
  if (!videos?.length || !channelUrl) return null;
  return <section className="mt-10 w-full text-left"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">YouTube</h2><a href={channelUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">YouTube에서 보기</a></div><div className="grid gap-3 sm:grid-cols-3">{videos.map((video) => <a key={video.id} href={video.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl bg-slate-800"><div className="relative aspect-video"><img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /><span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white">YouTube</span></div><p className="truncate p-3 text-sm font-bold group-hover:text-cyan-200">{video.title}</p></a>)}</div></section>;
}
