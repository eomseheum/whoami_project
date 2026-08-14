export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
};

type YouTubeChannel = {
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};

type YouTubePlaylistItem = {
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
  snippet?: { title?: string; publishedAt?: string; resourceId?: { videoId?: string }; thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } } };
};

function channelQuery(channelUrl: string): Record<string, string> | null {
  try {
    const url = new URL(channelUrl);
    if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0]?.startsWith("@")) return { forHandle: segments[0] };
    if (segments[0] === "channel" && segments[1]) return { id: segments[1] };
    return null;
  } catch { return null; }
}

async function youtubeRequest<T>(path: string, params: Record<string, string>) {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return null;
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...params, key }).forEach(([name, value]) => url.searchParams.set(name, value));
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch { return null; }
}

export async function getYouTubeFeed(channelUrl?: string) {
  if (!channelUrl) return null;
  const query = channelQuery(channelUrl);
  if (!query) return null;
  const channels = await youtubeRequest<{ items?: YouTubeChannel[] }>("channels", { part: "contentDetails", ...query });
  const uploadsPlaylistId = channels?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return null;
  const playlist = await youtubeRequest<{ items?: YouTubePlaylistItem[] }>("playlistItems", { part: "snippet,contentDetails", playlistId: uploadsPlaylistId, maxResults: "3" });
  return (playlist?.items ?? []).flatMap((item) => {
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const thumbnailUrl = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url;
    if (!videoId || !thumbnailUrl) return [];
    return [{ id: videoId, title: item.snippet?.title || "YouTube 영상", thumbnailUrl, publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || "", url: `https://www.youtube.com/watch?v=${videoId}` }];
  });
}
