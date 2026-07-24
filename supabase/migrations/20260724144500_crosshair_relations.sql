begin;

create table if not exists public.crosshair_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  crosshair_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, crosshair_id)
);

create index if not exists crosshair_likes_crosshair_idx
  on public.crosshair_likes (crosshair_id);

create table if not exists public.crosshair_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  crosshair_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, crosshair_id)
);

create index if not exists crosshair_favorites_user_created_idx
  on public.crosshair_favorites (user_id, created_at desc);

alter table public.crosshair_likes enable row level security;
alter table public.crosshair_favorites enable row level security;

drop policy if exists "crosshair_likes_select_public" on public.crosshair_likes;
drop policy if exists "crosshair_likes_select_own" on public.crosshair_likes;
create policy "crosshair_likes_select_own"
  on public.crosshair_likes for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "crosshair_likes_insert_own" on public.crosshair_likes;
create policy "crosshair_likes_insert_own"
  on public.crosshair_likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "crosshair_likes_delete_own" on public.crosshair_likes;
create policy "crosshair_likes_delete_own"
  on public.crosshair_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "crosshair_favorites_select_own" on public.crosshair_favorites;
create policy "crosshair_favorites_select_own"
  on public.crosshair_favorites for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "crosshair_favorites_insert_own" on public.crosshair_favorites;
create policy "crosshair_favorites_insert_own"
  on public.crosshair_favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "crosshair_favorites_delete_own" on public.crosshair_favorites;
create policy "crosshair_favorites_delete_own"
  on public.crosshair_favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.get_crosshair_like_counts()
returns table (crosshair_id text, like_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select likes.crosshair_id, count(*)::bigint
  from public.crosshair_likes as likes
  group by likes.crosshair_id;
$$;

revoke all on function public.get_crosshair_like_counts() from public;
grant execute on function public.get_crosshair_like_counts() to anon, authenticated;

revoke all on public.crosshair_likes, public.crosshair_favorites from anon, authenticated;
grant select, insert, delete on public.crosshair_likes, public.crosshair_favorites to authenticated;

commit;

notify pgrst, 'reload schema';
