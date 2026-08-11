import { notFound } from "next/navigation";

const demoLinks = [
  { id: "youtube", title: "YouTube 채널", url: "https://youtube.com" },
  { id: "instagram", title: "Instagram", url: "https://instagram.com" },
  { id: "tiktok", title: "TikTok", url: "https://tiktok.com" }
];

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!username) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-16 text-center">
      <div className="h-28 w-28 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />
      <h1 className="mt-5 text-3xl font-black">@{username}</h1>
      <p className="mt-3 text-slate-400">크리에이터의 모든 링크를 한 곳에서 만나보세요.</p>
      <div className="mt-8 w-full space-y-3">
        {demoLinks.map((link) => <a key={link.id} href={`/go/${link.id}`} className="card block w-full px-5 py-4 font-bold transition hover:-translate-y-0.5">{link.title}</a>)}
      </div>
    </main>
  );
}
