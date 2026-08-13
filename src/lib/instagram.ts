import { createAdminClient } from "@/lib/supabase/admin";

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

async function requestInstagram<T>(path: string, token: string) {
  const url = new URL(`https://graph.instagram.com/${path}`);
  url.searchParams.set("access_token", token);
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;
    const payload = await response.json() as InstagramResponse<T>;
    return payload.error ? null : payload;
  } catch { return null; }
}

export async function getInstagramFeedForProfile(profileId?: string) {
  if (!profileId) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data: connection } = await admin
    .from("instagram_connections")
    .select("access_token")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!connection?.access_token) return null;
  const result = await requestInstagram<{ data?: InstagramMedia[] }>(`me/media?fields=${fields}&limit=6`, connection.access_token);
  return result?.data ?? null;
}
