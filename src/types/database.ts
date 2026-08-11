export type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileLink = {
  id: string;
  profile_id: string;
  platform: string;
  title: string;
  url: string;
  position: number;
  is_visible: boolean;
  created_at: string;
};
