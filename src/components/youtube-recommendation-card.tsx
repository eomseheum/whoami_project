"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import type { YouTubeVideo } from "@/lib/youtube";

export function YouTubeRecommendationCard({ videos, username, displayName, avatarUrl }: { videos: YouTubeVideo[]; username: string; displayName: string; avatarUrl: string | null }) {
  const [index, setIndex] = useState(0);
  if (!videos.length) return null;
  const video = videos[index];
  const previous = () => setIndex((current) => (current - 1 + videos.length) % videos.length);
  const next = () => setIndex((current) => (current + 1) % videos.length);
  return <article className="card overflow-hidden"><div className="relative aspect-[16/10] bg-slate-800"><a href={video.url} target="_blank" rel="noreferrer" className="block h-full"><img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" /></a><span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">YouTube</span><span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>{videos.length > 1 && <><button type="button" onClick={previous} aria-label="이전 영상" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={next} aria-label="다음 영상" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"><ChevronRight className="h-4 w-4" /></button></>}</div><div className="p-4"><a href={video.url} target="_blank" rel="noreferrer" className="block truncate font-bold hover:text-cyan-200">{video.title}</a><div className="mt-2 flex items-center justify-between gap-3"><Link href={`/u/${username}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-400 hover:text-white">{avatarUrl ? <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="h-5 w-5 rounded-full bg-cyan-300" />}<span className="truncate">{displayName}</span></Link>{videos.length > 1 && <div className="flex gap-1.5">{videos.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`${itemIndex + 1}번 영상 보기`} className={`h-1.5 w-1.5 rounded-full ${itemIndex === index ? "bg-red-500" : "bg-slate-600"}`} />)}</div>}</div></div></article>;
}
