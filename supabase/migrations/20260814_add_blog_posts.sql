alter table public.profile_posts
  drop constraint if exists profile_posts_platform_check;

alter table public.profile_posts
  add constraint profile_posts_platform_check
  check (platform in ('youtube', 'instagram', 'x', 'blog'));
