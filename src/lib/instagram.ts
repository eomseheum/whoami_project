type InstagramAccount = { id: string; username: string };

export type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type InstagramResponse<T> = T & { error?: { message?: string } };
const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

async function requestInstagram<T>(path: string) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return null;
  const url = new URL(`https://graph.instagram.com/${path}`);
  url.searchParams.set("access_token", token);
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;
    const payload = await response.json() as InstagramResponse<T>;
    return payload.error ? null : payload;
  } catch { return null; }
}

function instagramHandle(url: string) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)instagram\.com$/i.test(parsed.hostname)) return null;
    return parsed.pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? null;
  } catch { return null; }
}

export async function getInstagramFeedForProfile(instagramUrl?: string) {
  const expectedHandle = instagramUrl ? instagramHandle(instagramUrl) : null;
  if (!expectedHandle) return null;
  const account = await requestInstagram<InstagramAccount>("me?fields=id,username");
  if (!account || account.username.toLowerCase() !== expectedHandle) return null;
  const result = await requestInstagram<{ data?: InstagramMedia[] }>(`me/media?fields=${fields}&limit=6`);
  return result?.data ?? null;
}
