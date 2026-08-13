create table public.instagram_connections (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  instagram_user_id text not null unique,
  username text not null,
  access_token text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instagram_connections enable row level security;

-- Tokens are accessed only by the server with the Supabase service-role key.
-- No client-side policies are intentionally created for this table.
