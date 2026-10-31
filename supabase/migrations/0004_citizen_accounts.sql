-- Migration 0004: Akun warga fase 2
-- ADR 0005: citizen_accounts, usage_counters, chat_sessions, chat_messages
-- RLS per user, cascade delete, no PII storage

-- ============================================================================
-- 1. Tabel citizen_accounts (metadata akun warga, 1:1 dengan auth.users)
-- ============================================================================

CREATE TABLE citizen_accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz,
  CONSTRAINT citizen_accounts_email_check CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE citizen_accounts IS 'Metadata akun warga (tidak menyimpan nama, NIK, alamat, telepon)';
COMMENT ON COLUMN citizen_accounts.email IS 'Email dari auth.users, disimpan untuk audit';
COMMENT ON COLUMN citizen_accounts.last_active_at IS 'Timestamp terakhir aktivitas (untuk cleanup akun tidak aktif di masa depan)';

-- RLS: user hanya bisa read/update miliknya
ALTER TABLE citizen_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warga dapat melihat akunnya sendiri"
  ON citizen_accounts FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Warga dapat update last_active sendiri"
  ON citizen_accounts FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin (service_role) bypass RLS untuk operasi sistem
-- Tidak ada policy INSERT karena signup dilakukan via trigger auth

-- ============================================================================
-- 2. Tabel usage_counters (kuota chat per akun)
-- ============================================================================

CREATE TABLE usage_counters (
  account_id uuid PRIMARY KEY REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  chat_count_today int NOT NULL DEFAULT 0 CHECK (chat_count_today >= 0),
  reset_date date NOT NULL DEFAULT CURRENT_DATE,
  total_chats int NOT NULL DEFAULT 0 CHECK (total_chats >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE usage_counters IS 'Kuota chat per akun (reset harian, atomik via RPC)';
COMMENT ON COLUMN usage_counters.chat_count_today IS 'Jumlah chat hari ini (reset midnight UTC)';
COMMENT ON COLUMN usage_counters.total_chats IS 'Total chat sepanjang waktu (metrik)';

-- RLS: user read miliknya, sistem update via RPC service_role
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warga dapat melihat kuotanya sendiri"
  ON usage_counters FOR SELECT
  USING (auth.uid() = account_id);

-- Tidak ada policy UPDATE/INSERT karena via RPC SECURITY DEFINER

-- RPC untuk increment atomik
CREATE OR REPLACE FUNCTION increment_chat_count(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Reset bila hari berbeda
  UPDATE usage_counters
  SET 
    chat_count_today = CASE 
      WHEN reset_date = CURRENT_DATE THEN chat_count_today + 1
      ELSE 1
    END,
    total_chats = total_chats + 1,
    reset_date = CURRENT_DATE,
    updated_at = now()
  WHERE account_id = user_id;

  -- Buat baris baru bila belum ada (first chat)
  IF NOT FOUND THEN
    INSERT INTO usage_counters (account_id, chat_count_today, total_chats)
    VALUES (user_id, 1, 1);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_chat_count IS 'Atomik increment kuota (reset otomatis bila hari berbeda)';

-- ============================================================================
-- 3. Tabel chat_sessions (grouping percakapan)
-- ============================================================================

CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title text,
  deleted_at timestamptz,
  CONSTRAINT chat_sessions_title_length CHECK (char_length(title) <= 200)
);

COMMENT ON TABLE chat_sessions IS 'Sesi chat warga (grouping pesan, soft delete)';
COMMENT ON COLUMN chat_sessions.title IS 'Judul sesi (auto-generated atau user-set)';
COMMENT ON COLUMN chat_sessions.deleted_at IS 'Soft delete (user hapus riwayat)';

CREATE INDEX idx_chat_sessions_account ON chat_sessions(account_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_sessions_cleanup ON chat_sessions(created_at) WHERE deleted_at IS NULL;

-- RLS: user CRUD miliknya (kecuali yang sudah deleted)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warga dapat melihat sesinya sendiri"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = account_id AND deleted_at IS NULL);

CREATE POLICY "Warga dapat membuat sesi baru"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Warga dapat update sesinya sendiri"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);

-- Soft delete via UPDATE deleted_at, bukan DELETE
-- Hard delete hanya via cascade dari citizen_accounts atau cleanup cron

-- ============================================================================
-- 4. Tabel chat_messages (riwayat pesan, hanya yang lolos PII scan)
-- ============================================================================

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_content_not_empty CHECK (char_length(content) > 0),
  CONSTRAINT chat_messages_content_max CHECK (char_length(content) <= 10000)
);

COMMENT ON TABLE chat_messages IS 'Riwayat pesan chat (hanya yang lolos PII scan dan tersamarkan)';
COMMENT ON COLUMN chat_messages.role IS 'user (warga, sudah disamarkan) | assistant (Aruna) | system (fallback/error)';
COMMENT ON COLUMN chat_messages.content IS 'Isi pesan (TIDAK PERNAH berisi NIK/telepon/data pribadi mentah)';
COMMENT ON COLUMN chat_messages.metadata IS 'Citations, model, tokens, confidence (JSONB)';

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX idx_chat_messages_account ON chat_messages(account_id, created_at DESC);

-- RLS: user read/insert miliknya via session yang belum deleted
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warga dapat melihat pesannya sendiri"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() = account_id 
    AND EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE id = session_id AND deleted_at IS NULL
    )
  );

CREATE POLICY "Warga dapat insert pesan baru"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = account_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE id = session_id AND account_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Tidak ada UPDATE/DELETE policy (immutable setelah insert)

-- ============================================================================
-- 5. Trigger auto-create citizen_account saat signup
-- ============================================================================

CREATE OR REPLACE FUNCTION create_citizen_account()
RETURNS trigger AS $$
BEGIN
  -- Hanya untuk user baru yang bukan admin (admin punya profiles)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO citizen_accounts (id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_citizen_account();

COMMENT ON FUNCTION create_citizen_account IS 'Auto-create citizen_account untuk user baru (non-admin)';

-- ============================================================================
-- 6. Cleanup function untuk retensi (dijalankan cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions(retention_days int DEFAULT 90)
RETURNS int AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM chat_sessions
  WHERE created_at < now() - (retention_days || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_chat_sessions IS 'Hapus sesi dan pesan lebih tua dari retention_days (default 90)';

-- ponytail: Schedule dengan pg_cron atau Supabase Edge Function cron
-- SELECT cron.schedule('cleanup-chats', '0 3 * * *', $$SELECT cleanup_old_chat_sessions()$$);
