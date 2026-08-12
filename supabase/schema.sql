create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null,
  bio text check (char_length(bio) <= 160),
  avatar_url text,
  theme text not null default 'default',
  is_public boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null default 'other',
  title text not null,
  url text not null check (url ~ '^https://'),
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profile_views (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  visitor_hash text,
  referrer text,
  device_type text,
  viewed_at timestamptz not null default now()
);

create table public.link_clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.profile_links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  visitor_hash text,
  referrer text,
  device_type text,
  clicked_at timestamptz not null default now()
);

create table public.profile_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'instagram', 'x')),
  title text not null check (char_length(title) <= 120),
  url text not null check (url ~ '^https://'),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index profile_links_profile_position_idx on public.profile_links(profile_id, position);
create index profile_views_profile_viewed_idx on public.profile_views(profile_id, viewed_at desc);
create index link_clicks_profile_clicked_idx on public.link_clicks(profile_id, clicked_at desc);
create index profile_posts_profile_platform_published_idx on public.profile_posts(profile_id, platform, published_at desc);

alter table public.profiles enable row level security;
alter table public.profile_links enable row level security;
alter table public.profile_views enable row level security;
alter table public.link_clicks enable row level security;
alter table public.profile_posts enable row level security;

create policy "public profiles are readable" on public.profiles for select using (is_public = true or auth.uid() = user_id);
create policy "users manage own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public links are readable" on public.profile_links for select using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public = true or p.user_id = auth.uid())));
create policy "users manage own links" on public.profile_links for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
create policy "owners read views" on public.profile_views for select using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
create policy "owners read clicks" on public.link_clicks for select using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
create policy "public posts are readable" on public.profile_posts for select using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public = true or p.user_id = auth.uid())));
create policy "users manage own posts" on public.profile_posts for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
