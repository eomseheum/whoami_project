"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

export type RecommendationItem = {
  id: string;
  platform: "instagram" | "youtube" | "x" | "blog";
  title: string;
  url: string;
  imageUrl?: string;
  isVideo?: boolean;
};

type PlatformLink = { id: string; platform: string; title: string; url: string };

const labels: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", x: "X", blog: "블로그" };
const colors: Record<string, string> = { instagram: "bg-fuchsia-600", youtube: "bg-red-600", x: "bg-slate-700", blog: "bg-emerald-600" };

export function CreatorRecommendationCard({ items, links, username, displayName, avatarUrl }: { items: RecommendationItem[]; links: PlatformLink[]; username: string; displayName: string; avatarUrl: string | null }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const item = items[index];
  const previous = () => setIndex((current) => (current - 1 + items.length) % items.length);
  const next = () => setIndex((current) => (current + 1) % items.length);

  return <article className="card overflow-hidden">
    <div className="relative aspect-[16/10] bg-gradient-to-br from-fuchsia-500/40 via-slate-800 to-cyan-400/30">
      <a href={item.url} target="_blank" rel="noreferrer" className="block h-full">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-8 text-center text-lg font-bold text-slate-200">{item.title}</div>}
      </a>
      <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white ${colors[item.platform]}`}>{labels[item.platform]}</span>
      {(item.platform === "youtube" || item.isVideo) && <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>}
      {items.length > 1 && <><button type="button" onClick={previous} aria-label="이전 콘텐츠" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={next} aria-label="다음 콘텐츠" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"><ChevronRight className="h-4 w-4" /></button></>}
    </div>
    <div className="p-4"><a href={item.url} target="_blank" rel="noreferrer" className="block truncate font-bold hover:text-cyan-200">{item.title}</a><Link href={`/u/${username}`} className="mt-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white">{avatarUrl ? <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="h-5 w-5 rounded-full bg-cyan-300" />}<span className="truncate">{displayName}</span></Link><div className="mt-3 flex flex-wrap gap-2">{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-cyan-300 hover:text-cyan-200">{labels[link.platform] ?? link.title}</a>)}</div>{items.length > 1 && <div className="mt-3 flex gap-1.5" aria-label={`콘텐츠 ${index + 1} / ${items.length}`}>{items.map((entry, itemIndex) => <button key={entry.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`${itemIndex + 1}번 콘텐츠 보기`} className={`h-1.5 w-1.5 rounded-full ${itemIndex === index ? "bg-cyan-300" : "bg-slate-600"}`} />)}</div>}</div>
  </article>;
}
