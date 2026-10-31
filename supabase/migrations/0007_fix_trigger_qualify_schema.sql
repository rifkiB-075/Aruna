-- Migration 0007: Fix trigger - qualify schema public.citizen_accounts
-- 
-- Bug: Auth trigger tidak bisa akses citizen_accounts karena search_path 
-- tidak include public schema di context trigger (auth.users schema=auth).
-- 
-- Solusi: Qualify table name dengan schema: public.citizen_accounts

CREATE OR REPLACE FUNCTION create_citizen_account()
RETURNS trigger AS $$
BEGIN
  -- Insert citizen_account untuk setiap user baru (idempotent)
  INSERT INTO public.citizen_accounts (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_citizen_account IS 
  'Auto-create citizen_account untuk user baru via Auth.signUp.';
