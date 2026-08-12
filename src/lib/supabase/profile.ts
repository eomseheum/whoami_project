import type { SupabaseClient, User } from "@supabase/supabase-js";

export function isKakaoUser(user: User) {
  const providers = Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [];
  return user.app_metadata?.provider === "kakao" || providers.includes("kakao");
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    user.email?.split("@")[0]
  ];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? "새 사용자";
}

export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) return { error: selectError };
  if (existing) return { error: null };

  const username = `user_${user.id.replaceAll("-", "").slice(0, 12)}`;
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string"
    ? user.user_metadata.avatar_url
    : typeof user.user_metadata?.picture === "string"
      ? user.user_metadata.picture
      : null;

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    username,
    display_name: getDisplayName(user),
    avatar_url: avatarUrl
  });

  if (error?.code === "23505") {
    const { data: racedProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (racedProfile) return { error: null };
  }

  return { error };
}
