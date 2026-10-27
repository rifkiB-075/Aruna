-- Seed hanya data referensi dan data uji SINTETIS. Jangan masukkan data warga nyata.
-- Sumber: sheet Layanan di data/import/aruna_data_layanan_draf.xlsx. Semua layanan berstatus draft/unavailable.
insert into service_types (code, name, category, channel, portal_status) values
  ('AKL', 'Akta Kelahiran', 'Pencatatan Sipil', 'sidnok', 'draft'),
  ('AKM', 'Akta Kematian', 'Pencatatan Sipil', 'sidnok', 'draft'),
  ('KTPEL', 'KTP-EL', 'Kependudukan', 'kantor', 'draft'),
  ('KIA', 'Kartu Identitas Anak', 'Kependudukan', 'sidnok', 'draft'),
  ('BIODATA', 'Perubahan Biodata Kartu Keluarga', 'Kependudukan', 'sidnok', 'draft'),
  ('PINDAH', 'Perpindahan Keluar', 'Kependudukan', 'sidnok', 'draft'),
  ('DATANG', 'Kedatangan', 'Kependudukan', 'sidnok', 'draft'),
  ('SINKRON', 'Sinkronisasi Data (Online)', 'Kependudukan', 'kantor', 'draft'),
  ('CERAIKAWIN', 'Akta Perceraian & Akta Perkawinan', 'Pencatatan Sipil', 'sidnok', 'draft'),
  ('LEGALISIR', 'Legalisir', 'Pencatatan Sipil', null, 'unavailable'),
  ('EPAKEM', 'e-PAKEM', 'Pencatatan Sipil', null, 'unavailable'),
  ('KUTIPAN2', 'Kutipan Kedua', 'Pencatatan Sipil', null, 'unavailable'),
  ('IKD', 'Identitas Kependudukan Digital (IKD)', 'Kependudukan', 'campuran', 'draft')
on conflict (code) do nothing;
