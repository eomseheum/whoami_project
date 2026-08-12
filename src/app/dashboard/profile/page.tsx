import { redirect } from "next/navigation";
import { ProfileCustomizer } from "@/components/dashboard/profile-customizer";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/profile");
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
  if (!profile) redirect("/dashboard");
  return <ProfileCustomizer initialProfile={profile as Profile} />;
}
