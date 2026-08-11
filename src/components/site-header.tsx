import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-xl font-bold">ProfileHub</Link>
      <nav className="flex items-center gap-4 text-sm text-slate-300">
        <Link href="/u/demo">데모</Link>
        <Link href="/login">로그인</Link>
        <Link href="/signup" className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950">무료 시작</Link>
      </nav>
    </header>
  );
}
