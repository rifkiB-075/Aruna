-- 0001_init.sql
-- Skema awal. Mengikuti docs/03-ARCHITECTURE.md bagian 5 dan docs/05-SECURITY.md.
-- Tidak ada kolom NIK / nama / alamat warga. "sources" = dokumen sumber resmi (peraturan/SOP), bukan dokumen warga.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------- Enum ----------
create type admin_role as enum ('editor', 'reviewer', 'super_admin');
-- Siklus dokumen sumber (PRD 7.5): Draf -> Siap Ditinjau -> Aktif/Nonaktif
create type source_status as enum ('draft', 'ready_for_review', 'active', 'inactive', 'rejected');
create type processing_status as enum ('pending', 'processing', 'ready', 'failed');
create type content_status as enum ('draft', 'in_review', 'published', 'rejected');
create type chat_status as enum ('answered', 'fallback', 'out_of_scope');
create type report_status as enum ('new', 'reviewing', 'done');
-- Kanal pengurusan layanan (ADR 0003): Sidnok online, datang ke kantor, atau campuran (mis. IKD)
create type service_channel as enum ('sidnok', 'kantor', 'campuran');

-- ---------- Admin ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role admin_role not null,
  created_at timestamptz not null default now()
);

create or replace function public.current_role_name() returns admin_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

-- ---------- Referensi ----------
-- Kode mengikuti dataset data dukung Sidnok (AKL, AKM, KTPEL, KIA, BIODATA, PINDAH, DATANG, SINKRON, CERAIKAWIN, IKD, ...)
create table service_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]+$'),
  name text not null,
  category text not null,
  channel service_channel,                    -- null bila belum ada informasi kanal
  portal_status text not null default 'draft' check (portal_status in ('draft', 'published', 'unavailable'))
);

-- ---------- Sumber pengetahuan ----------
create table sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  service_type_id uuid not null references service_types (id),
  effective_date date not null,
  review_due_date date,                      -- masa tinjau (usulan 90 hari)
  document_number text,                      -- bukti asal: nomor dokumen asli
  document_date date,                        -- bukti asal: tanggal dokumen asli
  source_url text,                           -- bukti asal untuk sumber berbasis halaman web (mis. Sidnok)
  accessed_at date,                          -- tanggal halaman diakses
  status source_status not null default 'draft',
  processing processing_status not null default 'pending',
  version integer not null default 1,
  file_path text not null,
  checksum text not null,
  uploaded_by uuid not null references profiles (id),
  uploaded_at timestamptz not null default now(),
  approved_by uuid references profiles (id),
  review_note text
);
create index on sources (service_type_id, status);

-- Dimensi embedding (1536) hanyalah nilai awal; ubah lewat migrasi + re-embed bila model diganti.
create table source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources (id) on delete cascade,
  content text not null,
  embedding vector(1536),
  embedding_model text not null,
  section_ref text,
  page_ref integer,
  token_count integer
);
create index source_chunks_embedding_idx on source_chunks using hnsw (embedding vector_cosine_ops);

-- Retrieval: hanya sumber aktif dan berlaku (status + tanggal berlaku + belum lewat masa tinjau).
create or replace function match_chunks(query_embedding vector(1536), match_count int, min_score float)
returns table (id uuid, source_id uuid, content text, section_ref text, score float)
language sql stable as $$
  select c.id, c.source_id, c.content, c.section_ref, 1 - (c.embedding <=> query_embedding) as score
  from source_chunks c
  join sources s on s.id = c.source_id
  where s.status = 'active'
    and s.effective_date <= current_date
    and (s.review_due_date is null or s.review_due_date >= current_date)
    and 1 - (c.embedding <=> query_embedding) >= min_score
  order by c.embedding <=> query_embedding
  limit match_count
$$;

-- ---------- Konten ----------
create table service_guides (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid not null references service_types (id),
  section text not null check (section in ('syarat', 'alur', 'biaya', 'waktu')),
  body text not null,
  source_id uuid not null references sources (id),
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table contents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('artikel', 'infografik', 'video')),
  title text not null,
  body text not null,
  status content_status not null default 'draft',
  generated_by_ai boolean not null default false,
  created_by uuid references profiles (id),
  reviewed_by uuid references profiles (id)
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status content_status not null default 'in_review'
);
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  question text not null,
  options jsonb not null,
  answer_key text not null,
  explanation text not null,
  source_id uuid not null references sources (id)
);

-- ---------- Telemetri anonim (tanpa isi percakapan mentah) ----------
create table chat_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text,
  status chat_status not null,
  retrieval_score float,
  source_ids uuid[] not null default '{}',
  model_version text,
  prompt_version text
);
create table unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  redacted_question text not null,       -- hanya yang lolos pindai PII dan sudah disamarkan
  topic text,
  count integer not null default 1,
  follow_up report_status not null default 'new',
  created_at timestamptz not null default now()
);
create table answer_reports (
  id uuid primary key default gen_random_uuid(),
  chat_event_id uuid references chat_events (id) on delete set null,
  reason_redacted text,
  status report_status not null default 'new',
  handling_note text,
  created_at timestamptz not null default now()
);

-- ---------- Audit log (append-only) ----------
create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  object_type text not null,
  object_id text not null,
  summary jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
create or replace function audit_logs_immutable() returns trigger language plpgsql as $$
begin raise exception 'audit_logs bersifat append-only'; end $$;
create trigger audit_logs_no_update before update or delete on audit_logs
  for each row execute function audit_logs_immutable();

-- ---------- Four-eyes untuk aktivasi sumber ----------
create or replace function enforce_source_activation() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' and old.status is distinct from 'active' then
    if public.current_role_name() is distinct from 'reviewer' then
      raise exception 'Hanya penyetuju (reviewer) yang dapat mengaktifkan sumber';
    end if;
    if new.uploaded_by = auth.uid() then
      raise exception 'Pengunggah tidak boleh menyetujui dokumennya sendiri';
    end if;
    new.approved_by := auth.uid();
  end if;
  return new;
end $$;
create trigger sources_activation before update on sources
  for each row execute function enforce_source_activation();

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table service_types enable row level security;
alter table sources enable row level security;
alter table source_chunks enable row level security;
alter table service_guides enable row level security;
alter table contents enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table chat_events enable row level security;
alter table unanswered_questions enable row level security;
alter table answer_reports enable row level security;
alter table audit_logs enable row level security;

-- Publik: hanya baca konten terbit. Tidak ada akses anon ke tabel lain.
create policy service_types_public_read on service_types for select using (true);
create policy guides_public_read on service_guides for select using (status = 'published');
create policy contents_public_read on contents for select using (status = 'published');

-- Admin
create policy profiles_self_read on profiles for select using (id = auth.uid() or public.current_role_name() = 'super_admin');
create policy profiles_super_write on profiles for all using (public.current_role_name() = 'super_admin') with check (public.current_role_name() = 'super_admin');

create policy sources_admin_read on sources for select using (public.current_role_name() is not null);
create policy sources_editor_insert on sources for insert with check (public.current_role_name() = 'editor' and status = 'draft' and uploaded_by = auth.uid());
create policy sources_reviewer_update on sources for update using (public.current_role_name() = 'reviewer') with check (public.current_role_name() = 'reviewer');

create policy chunks_admin_read on source_chunks for select using (public.current_role_name() is not null);

create policy guides_admin_all on service_guides for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy contents_admin_all on contents for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy quizzes_admin_all on quizzes for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy quiz_q_admin_all on quiz_questions for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));

create policy chat_events_admin_read on chat_events for select using (public.current_role_name() is not null);
create policy unanswered_admin_read on unanswered_questions for select using (public.current_role_name() is not null);
create policy reports_admin_read on answer_reports for select using (public.current_role_name() is not null);
create policy reports_reviewer_update on answer_reports for update using (public.current_role_name() = 'reviewer') with check (public.current_role_name() = 'reviewer');
create policy audit_super_read on audit_logs for select using (public.current_role_name() = 'super_admin');
-- Penulisan chat_events / unanswered_questions / answer_reports / audit_logs dilakukan server (service_role), bukan klien.
