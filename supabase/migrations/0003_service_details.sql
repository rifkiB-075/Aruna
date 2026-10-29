-- 0003_service_details.sql
-- Tabel detail layanan: syarat, catatan, alur, kanal resmi.
-- Mengikuti struktur aruna_data_layanan_draf.xlsx sheet Syarat/Catatan/Alur/Kanal_Resmi.

-- ---------- Requirements ----------
create table service_requirements (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid not null references service_types (id) on delete cascade,
  sub_category text not null,                 -- Sub-Kategori Pemohon (mis. "Pencatatan Kelahiran WNI Dalam Wilayah NKRI")
  item_label text,                            -- Nomor urut (a, b, c, -, dll)
  requirement_text text not null,             -- Jenis Data Dukung
  condition_text text,                        -- Keterangan / Kondisi
  origin text not null check (origin in ('dataset', 'keterangan_petugas')),
  verification_status text not null default 'draft' check (verification_status in ('draft', 'verified', 'needs_update')),
  source_id uuid references sources (id) on delete set null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on service_requirements (service_type_id, verification_status);
create index on service_requirements (source_id);

-- ---------- Notes ----------
create table service_notes (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid not null references service_types (id) on delete cascade,
  note_type text not null,                    -- Jenis Catatan (mis. "Catatan - Pelapor adalah", "Catatan Tambahan", "Catatan Umum")
  item_label text,                            -- Nomor urut (1, 2, -, dll)
  note_text text not null,                    -- Isi Catatan
  condition_text text,                        -- Keterangan
  origin text not null check (origin in ('dataset', 'keterangan_petugas')),
  verification_status text not null default 'draft' check (verification_status in ('draft', 'verified', 'needs_update')),
  source_id uuid references sources (id) on delete set null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on service_notes (service_type_id, verification_status);
create index on service_notes (source_id);

-- ---------- Flow Steps ----------
create table service_flow_steps (
  id uuid primary key default gen_random_uuid(),
  flow_code text not null check (flow_code in ('SIDNOK', 'IKD', 'KANTOR')),
  step_number integer not null check (step_number > 0),
  step_title text not null,
  step_description text not null,
  origin text not null check (origin in ('dataset', 'keterangan_petugas')),
  verification_status text not null default 'draft' check (verification_status in ('draft', 'verified', 'needs_update')),
  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (flow_code, step_number)
);
create index on service_flow_steps (flow_code, step_number);
create index on service_flow_steps (source_id);

-- ---------- Official Channels ----------
create table official_channels (
  id uuid primary key default gen_random_uuid(),
  channel_name text not null,                 -- mis. "Sidnok (situs)", "Call Center (WhatsApp)"
  channel_type text not null check (channel_type in ('web', 'play_store', 'browser', 'telepon', 'whatsapp')),
  channel_value text not null,                -- URL atau nomor
  origin text not null check (origin in ('halaman_resmi', 'keterangan_petugas')),
  verification_status text not null default 'draft' check (verification_status in ('draft', 'verified', 'needs_update')),
  source_id uuid references sources (id) on delete set null,
  accessed_at date,                           -- Tanggal halaman diakses/dicek terakhir
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_name)
);
create index on official_channels (verification_status);
create index on official_channels (source_id);

-- ---------- RLS ----------
alter table service_requirements enable row level security;
alter table service_notes enable row level security;
alter table service_flow_steps enable row level security;
alter table official_channels enable row level security;

-- Publik: hanya verified
create policy requirements_public_read on service_requirements for select using (verification_status = 'verified');
create policy notes_public_read on service_notes for select using (verification_status = 'verified');
create policy flow_steps_public_read on service_flow_steps for select using (verification_status = 'verified');
create policy channels_public_read on official_channels for select using (verification_status = 'verified');

-- Admin: editor dan reviewer read all, write all
create policy requirements_admin_all on service_requirements for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy notes_admin_all on service_notes for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy flow_steps_admin_all on service_flow_steps for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
create policy channels_admin_all on official_channels for all using (public.current_role_name() in ('editor', 'reviewer')) with check (public.current_role_name() in ('editor', 'reviewer'));
