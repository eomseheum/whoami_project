import { redirect } from "next/navigation";
import { SocialManager } from "@/components/dashboard/social-manager";
import { createClient } from "@/lib/supabase/server";
import type { ProfileLink, ProfilePost } from "@/types/database";

export default async function LinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/links");
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) redirect("/dashboard/profile");
  const [{ data: links }, { data: posts }] = await Promise.all([supabase.from("profile_links").select("*").eq("profile_id", profile.id).order("position"), supabase.from("profile_posts").select("*").eq("profile_id", profile.id).order("published_at", { ascending: false })]);
  return <SocialManager profileId={profile.id} initialLinks={(links ?? []) as ProfileLink[]} initialPosts={(posts ?? []) as ProfilePost[]} />;
}
