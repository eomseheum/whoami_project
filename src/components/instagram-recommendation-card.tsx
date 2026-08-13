"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Post = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

type InstagramRecommendationCardProps = {
  posts: Post[];
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export function InstagramRecommendationCard({ posts, username, displayName, avatarUrl }: InstagramRecommendationCardProps) {
  const visiblePosts = posts.filter((post) => post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url);
  const [index, setIndex] = useState(0);
  if (!visiblePosts.length) return null;

  const post = visiblePosts[index];
  const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
  const title = post.caption?.split("\n")[0]?.trim() || "Instagram 게시물";
  const previous = () => setIndex((current) => (current - 1 + visiblePosts.length) % visiblePosts.length);
  const next = () => setIndex((current) => (current + 1) % visiblePosts.length);

  return <article className="card overflow-hidden">
    <div className="group relative aspect-[16/10] bg-slate-800">
      <a href={post.permalink} target="_blank" rel="noreferrer" className="block h-full"><img src={imageUrl} alt={title} className="h-full w-full object-cover" /></a>
      <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold">Instagram</span>
      {post.media_type === "VIDEO" && <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-bold">REEL</span>}
      {visiblePosts.length > 1 && <><button type="button" onClick={previous} aria-label="이전 게시물" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white transition hover:bg-slate-950"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={next} aria-label="다음 게시물" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white transition hover:bg-slate-950"><ChevronRight className="h-4 w-4" /></button></>}
    </div>
    <div className="p-4"><a href={post.permalink} target="_blank" rel="noreferrer" className="block truncate font-bold hover:text-cyan-200">{title}</a><div className="mt-2 flex items-center justify-between gap-3"><Link href={`/u/${username}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-400 hover:text-white">{avatarUrl ? <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="h-5 w-5 rounded-full bg-cyan-300" />}<span className="truncate">{displayName}</span></Link>{visiblePosts.length > 1 && <div className="flex gap-1.5" aria-label={`게시물 ${index + 1} / ${visiblePosts.length}`}>{visiblePosts.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`${itemIndex + 1}번 게시물 보기`} className={`h-1.5 w-1.5 rounded-full ${itemIndex === index ? "bg-cyan-300" : "bg-slate-600"}`} />)}</div>}</div></div>
  </article>;
}
