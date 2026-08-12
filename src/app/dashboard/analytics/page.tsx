export default function AnalyticsPage() {
  return <div className="card p-8"><h1 className="text-3xl font-bold">분석</h1><div className="mt-6 grid gap-4 sm:grid-cols-3">{[["조회수","0"],["클릭수","0"],["CTR","0%"]].map(([k,v])=><div key={k} className="rounded-xl bg-slate-900 p-5"><p className="text-slate-400">{k}</p><p className="mt-2 text-3xl font-bold">{v}</p></div>)}</div></div>;
}
