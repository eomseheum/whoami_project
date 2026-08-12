-- Lets the discovery page contain curated, fictional demo creators.
alter table public.profiles alter column user_id drop not null;
alter table public.profiles add column if not exists is_demo boolean not null default false;

with seed(username, display_name, bio, theme) as (
  values
    ('minseo_daily', '민서 데일리', '서울의 일상과 감성 카페를 기록해요.', 'rose'),
    ('june_codes', '준 코드랩', 'AI와 개발 이야기를 쉽게 전합니다.', 'cyan'),
    ('soyeon_trip', '소연 트립', '주말마다 떠나는 가까운 여행.', 'violet'),
    ('dodo_kitchen', '도도 키친', '집에서 만드는 간단한 한 끼.', 'orange'),
    ('milo_fit', '마일로 핏', '꾸준함을 위한 홈트 루틴.', 'lime'),
    ('haeun_book', '하은의 책장', '좋은 문장과 조용한 취향.', 'amber'),
    ('neo_gaming', '네오 게임룸', '매일 한 판, 새로운 게임 이야기.', 'indigo'),
    ('yuri_draws', '유리 드로잉', '그림으로 남기는 작은 순간들.', 'pink'),
    ('seoul_noise', '서울 노이즈', '서울의 음악, 전시, 새로운 공간.', 'slate'),
    ('nabi_style', '나비 스타일', '편안하지만 선명한 데일리 룩.', 'fuchsia'),
    ('tae_photo', '태 포토로그', '빛과 풍경 사이를 걷습니다.', 'sky'),
    ('bomi_pets', '보미와 친구들', '반려동물과 함께하는 느린 하루.', 'emerald'),
    ('orbit_review', '오빗 리뷰', '새로운 기기와 앱을 솔직하게 리뷰.', 'blue'),
    ('roro_bake', '로로 베이크', '달콤한 베이킹의 모든 과정.', 'yellow'),
    ('hana_plant', '하나 플랜트', '초록을 키우는 집의 기록.', 'green'),
    ('woody_run', '우디 런', '러닝으로 도시를 탐험합니다.', 'red'),
    ('lumi_studio', '루미 스튜디오', '영상과 사진을 만드는 사람.', 'purple'),
    ('momo_language', '모모 랭귀지', '매일 한 문장, 즐거운 언어 공부.', 'teal'),
    ('dan_note', '단 노트', '생산성과 기록에 관한 생각.', 'zinc'),
    ('coco_weekend', '코코 위켄드', '주말에만 열리는 취향 가게.', 'stone')
), inserted as (
  insert into public.profiles (user_id, username, display_name, bio, theme, is_public, is_demo)
  select null, username, display_name, bio, theme, true, true from seed
  where not exists (select 1 from public.profiles p where p.username = seed.username)
  returning id
), demos as (
  select p.id, p.username, p.display_name from public.profiles p join seed s on s.username = p.username
)
insert into public.profile_links (profile_id, platform, title, url, position)
select d.id, platform, label || ' 프로필',
  case platform
    when 'instagram' then 'https://instagram.com/' || d.username
    when 'x' then 'https://x.com/' || d.username
    else 'https://youtube.com/@' || d.username
  end,
  position
from demos d
cross join (values ('instagram', 'Instagram', 0), ('x', 'X', 1), ('youtube', 'YouTube', 2)) as platforms(platform, label, position)
where not exists (select 1 from public.profile_links l where l.profile_id = d.id and l.platform = platforms.platform);

with seed(username) as (
  values ('minseo_daily'), ('june_codes'), ('soyeon_trip'), ('dodo_kitchen'), ('milo_fit'),
         ('haeun_book'), ('neo_gaming'), ('yuri_draws'), ('seoul_noise'), ('nabi_style'),
         ('tae_photo'), ('bomi_pets'), ('orbit_review'), ('roro_bake'), ('hana_plant'),
         ('woody_run'), ('lumi_studio'), ('momo_language'), ('dan_note'), ('coco_weekend')
), demos as (
  select p.id, p.username, p.display_name from public.profiles p join seed s on s.username = p.username
), generated_posts as (
  select d.id as profile_id, d.username, platform,
    d.display_name || '의 ' || label || ' 새 게시물 #' || sequence as title,
    sequence
  from demos d
  cross join (values ('instagram', 'Instagram'), ('x', 'X'), ('youtube', 'YouTube')) as platforms(platform, label)
  cross join generate_series(1, 3) as sequence
)
insert into public.profile_posts (profile_id, platform, title, url, published_at)
select profile_id, platform, title,
  case platform
    when 'instagram' then 'https://instagram.com/' || username
    when 'x' then 'https://x.com/' || username
    else 'https://youtube.com/@' || username
  end,
  now() - (sequence || ' days')::interval
from generated_posts
where not exists (select 1 from public.profile_posts pp where pp.profile_id = generated_posts.profile_id and pp.platform = generated_posts.platform and pp.title = generated_posts.title);
