-- jojo initial schema
-- Principles enforced at the database level:
--   * only verified, active, recently-seen users are discoverable
--   * stored locations are snapped to a ~1km grid
--   * likes received are readable by the recipient (never paywalled)
--   * blocked users disappear from each other everywhere
--   * users can always read the moderation actions taken against them

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.gender as enum ('woman', 'man', 'nonbinary');
create type public.intent as enum ('long_term', 'short_term', 'casual', 'friends', 'figuring_out');
create type public.account_status as enum ('active', 'limited', 'suspended', 'banned', 'deleted');
create type public.swipe_action as enum ('like', 'superlike', 'pass');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');
create type public.report_reason as enum (
  'fake_profile', 'scam_or_money', 'external_contact_push', 'harassment',
  'sexual_content', 'underage', 'hate_speech', 'offline_safety', 'other'
);
create type public.report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');
create type public.strike_level as enum ('warning', 'limited', 'suspended', 'banned');
create type public.appeal_status as enum ('in_review', 'approved', 'denied');
create type public.match_close_reason as enum ('polite_close', 'unmatch', 'block', 'inactive', 'moderation');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 20),
  birthdate date not null check (birthdate <= (current_date - interval '19 years')),
  gender public.gender not null,
  intent public.intent not null,
  bio text check (char_length(bio) <= 500),
  job text,
  school text,
  height_cm int check (height_cm between 120 and 230),
  locale text not null default 'ko',
  location extensions.geography(point, 4326),
  status public.account_status not null default 'active',
  face_verified_at timestamptz,
  identity_verified_at timestamptz,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_location_idx on public.profiles using gist (location);
create index profiles_discovery_idx on public.profiles (status, last_active_at);

create function public.snap_profile_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.location is not null then
    new.location := extensions.st_snaptogrid(new.location::extensions.geometry, 0.01)::extensions.geography;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_snap_location
before insert or update on public.profiles
for each row execute function public.snap_profile_location();

create table public.profile_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  prompt_key text not null,
  answer text not null check (char_length(answer) between 1 and 200),
  position smallint not null check (position between 0 and 2),
  unique (user_id, position)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  storage_path text not null,
  position smallint not null check (position between 0 and 5),
  moderation_status public.moderation_status not null default 'pending',
  face_match_score real,
  created_at timestamptz not null default now(),
  unique (user_id, position)
);

create table public.preferences (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  age_min int not null default 19 check (age_min >= 19),
  age_max int not null default 45 check (age_max <= 99),
  distance_km int not null default 25,
  genders public.gender[] not null,
  intents public.intent[] not null default array['long_term', 'short_term', 'casual', 'friends', 'figuring_out']::public.intent[],
  i_message_first boolean not null default false,
  check (age_min <= age_max)
);

-- ---------------------------------------------------------------------------
-- Blocks + visibility helpers
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

create function public.is_discoverable(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = target
      and p.status = 'active'
      and p.face_verified_at is not null
      and p.last_active_at > now() - interval '14 days'
  );
$$;

-- ---------------------------------------------------------------------------
-- Swipes + matches
-- ---------------------------------------------------------------------------
create table public.swipes (
  swiper_id uuid not null references public.profiles (user_id) on delete cascade,
  target_id uuid not null references public.profiles (user_id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id),
  check (swiper_id <> target_id)
);

create index swipes_target_idx on public.swipes (target_id, action);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (user_id) on delete cascade,
  user_b uuid not null references public.profiles (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  closed_at timestamptz,
  closed_by uuid references auth.users (id),
  closed_reason public.match_close_reason,
  unique (user_a, user_b),
  check (user_a < user_b)
);

create function public.is_match_participant(m uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.matches
    where id = m and (user_a = (select auth.uid()) or user_b = (select auth.uid()))
  );
$$;

create function public.create_match_on_mutual_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.action in ('like', 'superlike') and exists (
    select 1 from public.swipes s
    where s.swiper_id = new.target_id
      and s.target_id = new.swiper_id
      and s.action in ('like', 'superlike')
  ) then
    insert into public.matches (user_a, user_b)
    values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
    on conflict (user_a, user_b) do nothing;
  end if;
  return new;
end;
$$;

create trigger swipes_create_match
after insert on public.swipes
for each row execute function public.create_match_on_mutual_like();

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text check (char_length(body) <= 2000),
  media_path text,
  risk_score real,
  created_at timestamptz not null default now(),
  check (body is not null or media_path is not null)
);

create index messages_match_idx on public.messages (match_id, created_at desc);

create function public.touch_match_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.matches set last_message_at = new.created_at where id = new.match_id;
  return new;
end;
$$;

create trigger messages_touch_match
after insert on public.messages
for each row execute function public.touch_match_last_message();

-- ---------------------------------------------------------------------------
-- Trust & safety
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_id uuid not null references auth.users (id) on delete cascade,
  reason public.report_reason not null,
  message_id uuid references public.messages (id) on delete set null,
  photo_id uuid references public.photos (id) on delete set null,
  note text check (char_length(note) <= 1000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  check (reporter_id <> target_id)
);

create index reports_queue_idx on public.reports (status, created_at);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level public.strike_level not null,
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  report_id uuid references public.reports (id) on delete set null,
  reviewer_id uuid references auth.users (id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.appeals (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null unique references public.moderation_actions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 10 and 2000),
  status public.appeal_status not null default 'in_review',
  decision_note text,
  due_at timestamptz not null default (now() + interval '72 hours'),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Subscriptions (written only by payment webhooks via service role)
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('apple', 'google', 'stripe', 'portone')),
  product_id text not null,
  status text not null,
  will_renew boolean not null default true,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profile_prompts enable row level security;
alter table public.photos enable row level security;
alter table public.preferences enable row level security;
alter table public.blocks enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.appeals enable row level security;
alter table public.subscriptions enable row level security;

-- profiles
create policy "read own or discoverable profiles" on public.profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (public.is_discoverable(user_id) and not public.is_blocked_between((select auth.uid()), user_id))
  );
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- prompts
create policy "read prompts of visible profiles" on public.profile_prompts
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (public.is_discoverable(user_id) and not public.is_blocked_between((select auth.uid()), user_id))
  );
create policy "manage own prompts" on public.profile_prompts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- photos
create policy "read approved photos of visible profiles" on public.photos
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (
      moderation_status = 'approved'
      and public.is_discoverable(user_id)
      and not public.is_blocked_between((select auth.uid()), user_id)
    )
  );
create policy "insert own photos" on public.photos
  for insert to authenticated
  with check (user_id = (select auth.uid()) and moderation_status = 'pending');
create policy "delete own photos" on public.photos
  for delete to authenticated using (user_id = (select auth.uid()));

-- preferences
create policy "manage own preferences" on public.preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- blocks
create policy "manage own blocks" on public.blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

-- swipes: likes received are visible to the recipient for free
create policy "read own swipes and likes received" on public.swipes
  for select to authenticated
  using (
    swiper_id = (select auth.uid())
    or (
      target_id = (select auth.uid())
      and action in ('like', 'superlike')
      and not public.is_blocked_between((select auth.uid()), swiper_id)
    )
  );
create policy "swipe on discoverable profiles" on public.swipes
  for insert to authenticated
  with check (
    swiper_id = (select auth.uid())
    and public.is_discoverable(target_id)
    and not public.is_blocked_between(swiper_id, target_id)
  );

-- matches
create policy "participants read matches" on public.matches
  for select to authenticated
  using (user_a = (select auth.uid()) or user_b = (select auth.uid()));
create policy "participants close matches" on public.matches
  for update to authenticated
  using (user_a = (select auth.uid()) or user_b = (select auth.uid()))
  with check (closed_by = (select auth.uid()));

-- messages
create policy "participants read messages" on public.messages
  for select to authenticated using (public.is_match_participant(match_id));
create policy "participants send messages to open matches" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.closed_at is null
        and (m.user_a = (select auth.uid()) or m.user_b = (select auth.uid()))
    )
  );

-- reports
create policy "file reports" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "read own reports" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));

-- moderation transparency: users always see actions taken against them
create policy "read own moderation actions" on public.moderation_actions
  for select to authenticated using (user_id = (select auth.uid()));

-- appeals
create policy "read own appeals" on public.appeals
  for select to authenticated using (user_id = (select auth.uid()));
create policy "appeal own actions" on public.appeals
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'in_review'
    and exists (
      select 1 from public.moderation_actions a
      where a.id = action_id and a.user_id = (select auth.uid())
    )
  );

-- subscriptions
create policy "read own subscription" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Column privileges: verification, status, scores and moderation state are
-- server-owned and must never be writable by clients.
-- ---------------------------------------------------------------------------
revoke insert, update on public.profiles from authenticated;
grant insert (user_id, display_name, birthdate, gender, intent, bio, job, school, height_cm, locale, location)
  on public.profiles to authenticated;
grant update (display_name, bio, job, school, height_cm, locale, location, last_active_at)
  on public.profiles to authenticated;

revoke insert, update on public.photos from authenticated;
grant insert (user_id, storage_path, position) on public.photos to authenticated;

revoke update on public.matches from authenticated;
grant update (closed_at, closed_by, closed_reason) on public.matches to authenticated;

revoke insert, update on public.messages from authenticated;
grant insert (match_id, sender_id, body, media_path) on public.messages to authenticated;

revoke insert, update on public.reports from authenticated;
grant insert (reporter_id, target_id, reason, message_id, photo_id, note) on public.reports to authenticated;

revoke insert, update on public.appeals from authenticated;
grant insert (action_id, user_id, message) on public.appeals to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime + storage
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages, public.matches;

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

create policy "owners upload to their folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners delete their files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
