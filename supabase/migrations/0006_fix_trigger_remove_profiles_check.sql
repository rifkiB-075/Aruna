-- Migration 0006: Fix trigger create_citizen_account - hapus check profiles
-- 
-- Bug: Trigger gagal karena query `SELECT 1 FROM profiles WHERE id = NEW.id` 
-- tidak bisa akses tabel profiles atau abort transaction saat profiles kosong.
-- 
-- Root cause dari log: "ERROR: relation \"profiles\" does not exist (SQLSTATE 42P01)"
-- 
-- Solusi: Hapus check profiles. Admin signup flow terpisah (manual createUser + insert profiles).
-- Trigger ini hanya untuk citizen signup via Auth.signUp biasa.

CREATE OR REPLACE FUNCTION create_citizen_account()
RETURNS trigger AS $$
BEGIN
  -- Insert citizen_account untuk setiap user baru (idempotent)
  INSERT INTO citizen_accounts (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_citizen_account IS 
  'Auto-create citizen_account untuk user baru. Admin dibuat manual via different flow.';
