-- 0002_test_helpers.sql
-- RPC untuk mock auth.uid() di integration test.
-- Hanya boleh dipakai di lokal dev/test, JANGAN di produksi.

create or replace function public.set_test_user(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Set JWT claims untuk mock auth.uid()
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id::text, 'role', 'authenticated')::text,
    false
  );
end;
$$;

create or replace function public.clear_test_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('request.jwt.claims', '', false);
end;
$$;

comment on function public.set_test_user is 'Test helper: mock auth.uid(). Lokal dev only.';
comment on function public.clear_test_user is 'Test helper: clear mocked user.';
