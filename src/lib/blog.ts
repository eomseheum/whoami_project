import { createClient } from "@/lib/supabase/server";

export type BlogPost = { id: string; title: string; url: string; publishedAt: string };

function text(value?: string) {
  return (value ?? "").replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").trim();
}

function tag(block: string, name: string) {
  return block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1];
}

function safeFeedUrl(value: string) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || host === "localhost" || host.endsWith(".local") || /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return null;
  return url.toString();
}

export async function getBlogFeed(profileId?: string) {
  if (!profileId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_feeds").select("feed_url").eq("profile_id", profileId).maybeSingle();
  if (!data?.feed_url) return null;
  let feedUrl: string | null;
  try { feedUrl = safeFeedUrl(data.feed_url); } catch { feedUrl = null; }
  if (!feedUrl) return null;
  try {
    const response = await fetch(feedUrl, { next: { revalidate: 1800 }, headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
    if (!response.ok) return null;
    const xml = await response.text();
    const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
    return blocks.slice(0, 3).flatMap((block, index) => {
      const title = text(tag(block, "title"));
      const url = text(tag(block, "link")) || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
      if (!title || !url.startsWith("https://")) return [];
      return [{ id: `${profileId}-${index}-${url}`, title, url, publishedAt: text(tag(block, "pubDate")) || text(tag(block, "published")) || text(tag(block, "updated")) }];
    }) as BlogPost[];
  } catch { return null; }
}
