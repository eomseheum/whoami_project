import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Creator profile platform</p>
          <h1 className="text-5xl font-black leading-tight md:text-6xl">당신의 모든 채널을 한 페이지에.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">YouTube, Instagram, TikTok 링크를 모으고 클릭 성과를 확인하세요.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup" className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">프로필 만들기</Link>
            <Link href="/u/demo" className="rounded-xl border border-slate-700 px-5 py-3 font-bold">데모 보기</Link>
          </div>
        </div>
        <div className="card mx-auto w-full max-w-sm p-6 text-center shadow-2xl">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />
          <h2 className="mt-4 text-2xl font-bold">Demo Creator</h2>
          <p className="mt-2 text-slate-400">영상과 디자인을 만드는 크리에이터</p>
          <div className="mt-6 space-y-3">
            {["YouTube", "Instagram", "TikTok"].map((name) => (
              <div key={name} className="rounded-xl bg-slate-800 px-4 py-4 font-semibold">{name}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
