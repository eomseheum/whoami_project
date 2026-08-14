import { getBlogFeed } from "@/lib/blog";

export async function BlogFeed({ profileId, blogUrl }: { profileId: string; blogUrl?: string }) {
  const posts = await getBlogFeed(profileId);
  if (!posts?.length) return null;
  return <section className="mt-10 w-full text-left"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">블로그</h2>{blogUrl && <a href={blogUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">블로그에서 보기</a>}</div><div className="grid gap-3 sm:grid-cols-3">{posts.map((post) => <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-800 p-4 font-bold hover:text-cyan-200"><span className="mb-3 block text-xs font-semibold text-emerald-300">BLOG</span><p className="line-clamp-2">{post.title}</p></a>)}</div></section>;
}
