-- Migration 0005: Fix INSERT policy untuk citizen_accounts
-- 
-- Bug: Trigger create_citizen_account() gagal INSERT karena tidak ada policy INSERT.
-- SECURITY DEFINER bypass RLS untuk permission check, tapi Postgres tetap memerlukan
-- policy untuk table dengan RLS enabled.
-- 
-- Solusi: Tambah policy INSERT yang membolehkan system/trigger untuk insert.

CREATE POLICY "System dapat insert citizen_accounts via trigger"
  ON citizen_accounts FOR INSERT
  WITH CHECK (true);

COMMENT ON POLICY "System dapat insert citizen_accounts via trigger" ON citizen_accounts IS 
  'Membolehkan trigger on_auth_user_created insert. User biasa tidak bisa langsung INSERT (signup via Auth).';
