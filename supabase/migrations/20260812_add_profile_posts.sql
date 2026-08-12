create table if not exists public.profile_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'instagram', 'x')),
  title text not null check (char_length(title) <= 120),
  url text not null check (url ~ '^https://'),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists profile_posts_profile_platform_published_idx on public.profile_posts(profile_id, platform, published_at desc);
alter table public.profile_posts enable row level security;

drop policy if exists "public posts are readable" on public.profile_posts;
create policy "public posts are readable" on public.profile_posts for select using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public = true or p.user_id = auth.uid())));
drop policy if exists "users manage own posts" on public.profile_posts;
create policy "users manage own posts" on public.profile_posts for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
