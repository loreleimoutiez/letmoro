-- Run against an isolated test Supabase/Postgres database after the migration.
-- Fixtures and updates are rolled back. Never use real player data here.
begin;
insert into auth.users(id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');
set local role anon;
do $$ begin
  begin
    perform * from public.player_saves;
    raise exception 'Anonymous table read must fail';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.save_player_progress('11111111-1111-4111-8111-111111111111', 0, null, 'en');
    raise exception 'Anonymous RPC must fail';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ declare affected integer; begin
  select count(*) into affected from public.save_player_progress(auth.uid(), 0, '{"schema":1}'::jsonb, 'en');
  if affected <> 1 then raise exception 'First save must insert'; end if;
  select count(*) into affected from public.save_player_progress(auth.uid(), 0, null, 'fr');
  if affected <> 0 then raise exception 'Stale insert must not overwrite'; end if;
  select count(*) into affected from public.save_player_progress(auth.uid(), 1, '{"schema":1,"test":true}'::jsonb, 'fr');
  if affected <> 1 then raise exception 'Matching revision must update'; end if;
  select count(*) into affected from public.save_player_progress(auth.uid(), 1, null, 'en');
  if affected <> 0 then raise exception 'Stale update must not overwrite'; end if;
  select count(*) into affected from public.save_player_progress(auth.uid(), 2, null, 'fr');
  if affected <> 1 then raise exception 'Reset must save a tombstone'; end if;
  if not exists(select 1 from public.player_saves where revision = 3 and payload is null and locale = 'fr') then raise exception 'Reset must retain revision'; end if;
  begin
    perform * from public.save_player_progress('22222222-2222-4222-8222-222222222222', 0, null, 'en');
    raise exception 'Foreign owner parameter must fail';
  exception when invalid_authorization_specification then null; end;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ declare affected integer; begin
  if exists(select 1 from public.player_saves) then raise exception 'Other account must not read first account'; end if;
  update public.player_saves set locale = 'en' where user_id = '11111111-1111-4111-8111-111111111111';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Other account must not update first account'; end if;
  begin
    insert into public.player_saves(user_id, payload, locale) values ('11111111-1111-4111-8111-111111111111', null, 'en');
    raise exception 'Other account must not insert under foreign ownership';
  exception when insufficient_privilege then null; end;
  select count(*) into affected from public.save_player_progress(auth.uid(), 0, null, 'en');
  if affected <> 1 then raise exception 'Second account must have independent save'; end if;
end $$;
rollback;
