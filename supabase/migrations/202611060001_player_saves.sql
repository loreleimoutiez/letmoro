-- Apply to the existing Supabase project before enabling VITE_CLOUD_SAVES.
begin;
create table public.player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb,
  locale text not null check (locale in ('en', 'fr')),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint player_save_object check (payload is null or jsonb_typeof(payload) = 'object')
);
alter table public.player_saves enable row level security;
revoke all on public.player_saves from public, anon, authenticated;
grant select, insert, update on public.player_saves to authenticated;
create policy player_saves_read_own on public.player_saves for select to authenticated
  using ((select auth.uid()) = user_id);
create policy player_saves_insert_own on public.player_saves for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy player_saves_update_own on public.player_saves for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Compare-and-swap: an empty result means another device has changed the row.
-- A null payload records an explicit reset rather than deleting its revision.
create function public.save_player_progress(p_user_id uuid, p_expected_revision bigint, p_payload jsonb, p_locale text)
returns setof public.player_saves
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id or p_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_expected_revision < 0 or p_expected_revision is null then raise exception 'Invalid revision'; end if;
  if p_expected_revision = 0 then
    return query insert into public.player_saves(user_id, payload, locale)
      values (auth.uid(), p_payload, p_locale)
      on conflict (user_id) do nothing returning *;
  else
    return query update public.player_saves
      set payload = p_payload, locale = p_locale, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and revision = p_expected_revision returning *;
  end if;
end;
$$;
revoke all on function public.save_player_progress(uuid, bigint, jsonb, text) from public, anon;
grant execute on function public.save_player_progress(uuid, bigint, jsonb, text) to authenticated;
commit;
