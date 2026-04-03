-- ============================================================
-- DJ POOL — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ARTISTS ────────────────────────────────────────────────
create table public.artists (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz default now()
);

alter table public.artists enable row level security;

create policy "Anyone authenticated can read artists"
  on public.artists for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert artists"
  on public.artists for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update artists"
  on public.artists for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── GENRES ─────────────────────────────────────────────────
create table public.genres (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz default now()
);

alter table public.genres enable row level security;

create policy "Anyone authenticated can read genres"
  on public.genres for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert genres"
  on public.genres for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── TRACKS ─────────────────────────────────────────────────
create table public.tracks (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  artist_id    uuid references public.artists(id) on delete set null,
  genre_id     uuid references public.genres(id) on delete set null,
  bpm          integer,
  musical_key  text,
  track_type   text not null check (track_type in ('extended', 'edit', 'remix', 'original')),
  file_url     text not null,   -- storage path (private)
  preview_url  text not null,   -- public preview URL
  created_at   timestamptz default now()
);

alter table public.tracks enable row level security;

create policy "Authenticated users can read tracks"
  on public.tracks for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert tracks"
  on public.tracks for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update tracks"
  on public.tracks for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete tracks"
  on public.tracks for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── DOWNLOADS ──────────────────────────────────────────────
create table public.downloads (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade,
  track_id   uuid references public.tracks(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.downloads enable row level security;

create policy "Users can insert own downloads"
  on public.downloads for insert
  with check (auth.uid() = user_id);

create policy "Users can read own downloads"
  on public.downloads for select
  using (auth.uid() = user_id);

create policy "Admins can read all downloads"
  on public.downloads for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── VIEWS ──────────────────────────────────────────────────
-- Tracks with joined artist/genre names (for easier queries)
create or replace view public.tracks_view as
  select
    t.id,
    t.title,
    t.bpm,
    t.musical_key,
    t.track_type,
    t.preview_url,
    t.file_url,
    t.created_at,
    a.id   as artist_id,
    a.name as artist_name,
    g.id   as genre_id,
    g.name as genre_name,
    (select count(*) from public.downloads d where d.track_id = t.id) as download_count
  from public.tracks t
  left join public.artists a on a.id = t.artist_id
  left join public.genres  g on g.id = t.genre_id;

-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Run after creating buckets in the dashboard:
-- Bucket 1: "tracks" (private) — for full tracks
-- Bucket 2: "previews" (public) — for previews

insert into storage.buckets (id, name, public) values ('tracks', 'tracks', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('previews', 'previews', true) on conflict do nothing;

-- Storage policies for "tracks" (private, authenticated download only)
create policy "Admins can upload full tracks"
  on storage.objects for insert
  with check (
    bucket_id = 'tracks' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can download full tracks"
  on storage.objects for select
  using (
    bucket_id = 'tracks' and auth.role() = 'authenticated'
  );

-- Storage policies for "previews" (public)
create policy "Admins can upload previews"
  on storage.objects for insert
  with check (
    bucket_id = 'previews' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can read previews"
  on storage.objects for select
  using (bucket_id = 'previews');

-- ─── SEED DATA ──────────────────────────────────────────────
insert into public.genres (name) values
  ('House'), ('Tech House'), ('Deep House'), ('Afro House'),
  ('Techno'), ('Melodic Techno'), ('Progressive House'),
  ('Hip-Hop'), ('R&B'), ('Reggaeton'), ('Latin'),
  ('Drum & Bass'), ('Dubstep'), ('Trance'), ('Electro')
on conflict do nothing;
