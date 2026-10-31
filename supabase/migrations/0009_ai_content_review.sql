-- AI-generated content review workflow (US-09)
-- Konten AI (FAQ, quiz, summary) berstatus draft sampai admin setujui

CREATE TABLE ai_content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('faq', 'quiz', 'summary')),
  title text NOT NULL,
  content jsonb NOT NULL, -- struktur tergantung content_type
  source_reference text, -- referensi sumber dokumen
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_note text
);

CREATE INDEX idx_ai_content_status ON ai_content_drafts(status);
CREATE INDEX idx_ai_content_type ON ai_content_drafts(content_type);

-- RLS: hanya admin yang bisa akses
ALTER TABLE ai_content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin dapat melihat semua draft" ON ai_content_drafts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'reviewer', 'editor')
    )
  );

CREATE POLICY "Reviewer dapat approve/reject" ON ai_content_drafts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'reviewer')
    )
  );

-- Audit log untuk review decisions
CREATE TABLE ai_content_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES ai_content_drafts(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'edited')),
  actor_id uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_audit_content ON ai_content_audit(content_id);

-- RLS: audit log hanya admin
ALTER TABLE ai_content_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin dapat melihat audit log" ON ai_content_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'reviewer', 'editor')
    )
  );

-- Function untuk approve/reject dengan audit
CREATE OR REPLACE FUNCTION review_ai_content(
  p_content_id uuid,
  p_action text,
  p_note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_status text;
BEGIN
  -- Validasi action
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  v_new_status := CASE p_action WHEN 'approve' THEN 'approved' ELSE 'rejected' END;

  -- Update content status
  UPDATE ai_content_drafts
  SET
    status = v_new_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_note = p_note
  WHERE id = p_content_id;

  -- Catat di audit log
  INSERT INTO ai_content_audit (content_id, action, actor_id, note)
  VALUES (p_content_id, v_new_status, auth.uid(), p_note);
END;
$$;
