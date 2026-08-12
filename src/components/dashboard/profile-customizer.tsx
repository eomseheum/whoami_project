"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const themes = [
  ["default", "오로라", "from-fuchsia-400 to-cyan-300"],
  ["sunset", "선셋", "from-orange-400 to-rose-500"],
  ["forest", "포레스트", "from-emerald-400 to-lime-300"],
  ["ocean", "오션", "from-blue-500 to-cyan-300"],
  ["midnight", "미드나이트", "from-slate-500 to-indigo-400"]
] as const;

export function ProfileCustomizer({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const gradient = themes.find(([key]) => key === profile.theme)?.[2] ?? themes[0][2];

  function change(field: keyof Profile, value: string | boolean) { setProfile((current) => ({ ...current, [field]: value })); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    const username = profile.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) return setError("사용자명은 영문 소문자, 숫자, 밑줄로 3~30자만 사용할 수 있습니다.");
    if (!profile.display_name.trim()) return setError("표시 이름을 입력해 주세요.");
    if (profile.avatar_url && !/^https:\/\//.test(profile.avatar_url)) return setError("아바타 URL은 https:// 주소여야 합니다.");
    setSaving(true);
    const { data, error: updateError } = await createClient().from("profiles").update({ username, display_name: profile.display_name.trim(), bio: profile.bio?.trim() || null, avatar_url: profile.avatar_url?.trim() || null, theme: profile.theme, is_public: profile.is_public, updated_at: new Date().toISOString() }).eq("id", profile.id).select().single();
    setSaving(false);
    if (updateError) return setError(updateError.code === "23505" ? "이미 사용 중인 사용자명입니다." : updateError.message);
    setProfile(data as Profile); setNotice("프로필이 저장되었습니다."); router.refresh();
  }

  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
    <form onSubmit={save} className="card p-7"><div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black">내 프로필 꾸미기</h1><p className="mt-2 text-slate-400">둘러보기와 공개 프로필에 보일 정보를 설정하세요.</p></div><Link href={`/u/${profile.username}`} target="_blank" className="shrink-0 rounded-lg border border-cyan-300 px-3 py-2 text-sm font-bold text-cyan-200">공개 페이지</Link></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">표시 이름<input value={profile.display_name} onChange={(e) => change("display_name", e.target.value)} maxLength={50} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal outline-none focus:border-cyan-300" /></label><label className="text-sm font-bold">사용자명<input value={profile.username} onChange={(e) => change("username", e.target.value)} maxLength={30} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal outline-none focus:border-cyan-300" /><span className="mt-1 block text-xs font-normal text-slate-500">profilehub/u/{profile.username || "username"}</span></label></div>
      <label className="mt-5 block text-sm font-bold">한 줄 소개<textarea value={profile.bio ?? ""} onChange={(e) => change("bio", e.target.value)} maxLength={160} rows={3} placeholder="나를 소개하는 문장을 작성해 보세요." className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal outline-none focus:border-cyan-300" /><span className="mt-1 block text-right text-xs font-normal text-slate-500">{profile.bio?.length ?? 0}/160</span></label>
      <label className="mt-5 block text-sm font-bold">프로필 이미지 URL<input value={profile.avatar_url ?? ""} onChange={(e) => change("avatar_url", e.target.value)} type="url" placeholder="https://example.com/avatar.jpg" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal outline-none focus:border-cyan-300" /><span className="mt-1 block text-xs font-normal text-slate-500">이미지 업로드 기능은 추후 추가됩니다. 현재는 HTTPS 이미지 주소를 사용할 수 있습니다.</span></label>
      <fieldset className="mt-6"><legend className="text-sm font-bold">프로필 테마</legend><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{themes.map(([key, label, colors]) => <button key={key} type="button" onClick={() => change("theme", key)} className={`rounded-xl border p-3 text-left ${profile.theme === key ? "border-cyan-300 ring-2 ring-cyan-300/20" : "border-slate-700"}`}><span className={`block h-9 rounded-lg bg-gradient-to-br ${colors}`} /><span className="mt-2 block text-xs font-bold">{label}</span></button>)}</div></fieldset>
      <label className="mt-6 flex items-center justify-between rounded-xl border border-slate-700 p-4"><span><span className="block font-bold">공개 프로필</span><span className="mt-1 block text-sm text-slate-400">끄면 둘러보기와 공개 URL에서 숨겨집니다.</span></span><input type="checkbox" checked={profile.is_public} onChange={(e) => change("is_public", e.target.checked)} className="h-5 w-5 accent-cyan-300" /></label>
      {error && <p className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}{notice && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
      <button disabled={saving} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-60">{saving ? "저장 중…" : "프로필 저장"}</button>
    </form>
    <aside className="card h-fit p-6"><p className="text-sm font-bold text-cyan-300">LIVE PREVIEW</p><div className="mt-6 text-center"><div className={`mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${gradient}`}>{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" /> : <span className="text-2xl font-black text-slate-950">{profile.display_name.slice(0, 1) || "P"}</span>}</div><h2 className="mt-4 text-2xl font-black">{profile.display_name || "표시 이름"}</h2><p className="mt-1 text-slate-400">@{profile.username || "username"}</p><p className="mt-4 text-sm leading-6 text-slate-300">{profile.bio || "소개 문구가 여기에 표시됩니다."}</p></div><div className="mt-6 rounded-xl border border-slate-700 p-4 text-sm text-slate-400">{profile.is_public ? "이 프로필은 공개 상태입니다." : "이 프로필은 비공개 상태입니다."}</div></aside>
  </div>;
}
