"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProfileLink, ProfilePost } from "@/types/database";

const platforms = [
  ["instagram", "Instagram", "@yourname 또는 URL"],
  ["x", "X", "@yourname 또는 URL"],
  ["youtube", "YouTube", "@yourchannel 또는 URL"]
] as const;
type Platform = (typeof platforms)[number][0];

function toProfileUrl(platform: Platform, value: string) {
  const input = value.trim();
  if (/^https?:\/\//i.test(input)) return input.replace(/^http:\/\//i, "https://").replace(/\/+$/, "");
  const handle = input.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  if (!handle) return "";
  if (platform === "instagram") return `https://www.instagram.com/${handle}`;
  if (platform === "x") return `https://x.com/${handle}`;
  return `https://www.youtube.com/@${handle}`;
}

export function SocialManager({ profileId, initialLinks, initialPosts }: { profileId: string; initialLinks: ProfileLink[]; initialPosts: ProfilePost[] }) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const linkFor = (platform: Platform) => links.find((link) => link.platform === platform);

  async function saveLink(event: FormEvent<HTMLFormElement>, platform: Platform, label: string) {
    event.preventDefault(); setError(""); setNotice("");
    const url = toProfileUrl(platform, String(new FormData(event.currentTarget).get("account") ?? ""));
    if (!url) return setError("계정 아이디 또는 프로필 URL을 입력해 주세요.");
    const existing = linkFor(platform);
    const payload = { profile_id: profileId, platform, title: `${label} 프로필`, url, position: platforms.findIndex(([key]) => key === platform), is_visible: true };
    const result = existing ? await createClient().from("profile_links").update(payload).eq("id", existing.id).select().single() : await createClient().from("profile_links").insert(payload).select().single();
    if (result.error) return setError(result.error.message);
    setLinks((current) => existing ? current.map((link) => link.id === existing.id ? result.data as ProfileLink : link) : [...current, result.data as ProfileLink]);
    setNotice(`${label} 계정이 연동되었습니다. 둘러보기 피드에 표시됩니다.`);
    router.refresh();
  }

  async function addPost(event: FormEvent<HTMLFormElement>, platform: Platform) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const result = await createClient().from("profile_posts").insert({ profile_id: profileId, platform, title: String(form.get("title") ?? "").trim(), url: String(form.get("url") ?? "").trim() }).select().single();
    if (result.error) return setError(result.error.message);
    setPosts((current) => [result.data as ProfilePost, ...current]); event.currentTarget.reset(); router.refresh();
  }

  async function deletePost(id: string) {
    const { error: deleteError } = await createClient().from("profile_posts").delete().eq("id", id);
    if (deleteError) return setError(deleteError.message);
    setPosts((current) => current.filter((post) => post.id !== id)); router.refresh();
  }

  return <div className="space-y-6">
    <section className="card p-7"><h1 className="text-3xl font-bold">SNS 계정 연동</h1><p className="mt-2 text-slate-400">@아이디만 입력하면 공개 프로필 링크로 자동 변환됩니다.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">{platforms.map(([key, label, hint]) => <form key={key} onSubmit={(event) => saveLink(event, key, label)} className="rounded-xl border border-slate-700 p-4"><label className="text-sm font-bold">{label}<input name="account" type="text" required defaultValue={linkFor(key)?.url ?? ""} placeholder={hint} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" /></label><button className="mt-3 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950">저장 및 연동</button></form>)}</div>
      {notice && <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}{error && <p className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    </section>
    <section className="card p-7"><h2 className="text-2xl font-bold">최근 게시물</h2><p className="mt-2 text-sm text-slate-400">플랫폼별 최근 게시물 3개를 공개 프로필과 추천 피드에 표시합니다.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">{platforms.map(([key, label]) => { const recent = posts.filter((post) => post.platform === key).slice(0, 3); return <div key={key} className="rounded-xl border border-slate-700 p-4"><h3 className="font-bold">{label}</h3><form onSubmit={(event) => addPost(event, key)} className="mt-3 space-y-2"><input name="title" required maxLength={120} placeholder="게시물 제목" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" /><input name="url" type="url" required placeholder="게시물 URL" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" /><button className="rounded-lg border border-cyan-300 px-3 py-2 text-sm font-bold text-cyan-200">게시물 추가</button></form><ul className="mt-4 space-y-2">{recent.map((post) => <li key={post.id} className="flex gap-2 rounded-lg bg-slate-900 p-2 text-sm"><a href={post.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:text-cyan-200">{post.title}</a><button type="button" onClick={() => deletePost(post.id)} className="text-rose-300">삭제</button></li>)}</ul></div>; })}</div>
    </section>
  </div>;
}
