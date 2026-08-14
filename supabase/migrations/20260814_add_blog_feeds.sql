create table public.blog_feeds (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  feed_url text not null check (feed_url ~ '^https://'),
  updated_at timestamptz not null default now()
);

alter table public.blog_feeds enable row level security;

create policy "public blog feeds are readable" on public.blog_feeds
  for select using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public = true or p.user_id = auth.uid())));

create policy "users manage own blog feeds" on public.blog_feeds
  for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));
