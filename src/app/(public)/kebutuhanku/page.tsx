'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ServiceType = 'ktp' | null;
type Scenario = 'baru' | 'hilang' | 'rusak' | 'perubahan' | null;

interface Checklist {
  service: string;
  scenario: string;
  items: string[];
  steps: string[];
}

const CHECKLISTS: Record<string, Checklist> = {
  'ktp-baru': {
    service: 'KTP Elektronik',
    scenario: 'Membuat KTP-el baru (pertama kali, usia 17 tahun)',
    items: [
      'Kartu Keluarga (KK) asli',
      'Akta Kelahiran asli',
      'Surat Keterangan dari RT/RW (jika diperlukan daerah setempat)',
      'Fotokopi dokumen pendukung (jika diminta)',
    ],
    steps: [
      'Datang ke Disdukcapil Kota Semarang dengan membawa berkas di atas',
      'Isi formulir permohonan KTP-el',
      'Foto dan rekam sidik jari',
      'Tunggu proses cetak (biasanya selesai hari itu atau beberapa hari kerja)',
      'Ambil KTP-el yang sudah jadi',
    ],
  },
  'ktp-hilang': {
    service: 'KTP Elektronik',
    scenario: 'KTP-el hilang',
    items: [
      'Kartu Keluarga (KK) asli',
      'Surat Keterangan Kehilangan dari Kepolisian',
      'Fotokopi KTP-el lama (jika masih ada salinan)',
    ],
    steps: [
      'Buat Surat Keterangan Kehilangan di kantor polisi terdekat',
      'Datang ke Disdukcapil Kota Semarang dengan membawa berkas',
      'Isi formulir permohonan penggantian KTP-el',
      'Foto dan rekam sidik jari ulang',
      'Tunggu proses cetak',
      'Ambil KTP-el pengganti',
    ],
  },
  'ktp-rusak': {
    service: 'KTP Elektronik',
    scenario: 'KTP-el rusak (tidak terbaca chip/fisik rusak)',
    items: [
      'Kartu Keluarga (KK) asli',
      'KTP-el lama yang rusak (bawa untuk ditunjukkan)',
      'Fotokopi KTP-el lama (jika masih terbaca sebagian)',
    ],
    steps: [
      'Datang ke Disdukcapil Kota Semarang dengan membawa KTP lama yang rusak',
      'Isi formulir permohonan penggantian KTP-el',
      'Foto dan rekam sidik jari ulang (jika diperlukan)',
      'Serahkan KTP-el rusak kepada petugas',
      'Tunggu proses cetak',
      'Ambil KTP-el baru',
    ],
  },
  'ktp-perubahan': {
    service: 'KTP Elektronik',
    scenario: 'Perubahan data (pindah alamat, ganti status perkawinan, dll.)',
    items: [
      'Kartu Keluarga (KK) asli yang sudah diperbarui',
      'KTP-el lama',
      'Dokumen pendukung perubahan (mis. Akta Perkawinan, Surat Keterangan Pindah, Akta Cerai, dll.)',
      'Fotokopi dokumen pendukung',
    ],
    steps: [
      'Perbarui Kartu Keluarga (KK) terlebih dahulu jika perubahan menyangkut data keluarga',
      'Datang ke Disdukcapil Kota Semarang dengan membawa berkas',
      'Isi formulir permohonan perubahan data KTP-el',
      'Foto dan rekam sidik jari ulang',
      'Serahkan KTP-el lama',
      'Tunggu proses cetak',
      'Ambil KTP-el baru dengan data yang sudah diperbarui',
    ],
  },
};

export default function CekKebutuhanku() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<ServiceType>(null);
  const [result, setResult] = useState<Checklist | null>(null);

  function reset() {
    setStep(1);
    setService(null);
    setResult(null);
  }

  function selectService(s: ServiceType) {
    setService(s);
    setStep(2);
  }

  function selectScenario(sc: Scenario) {
    const key = `ktp-${sc}`;
    setResult(CHECKLISTS[key] || null);
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-h1 font-bold">Cek Kebutuhanku</h1>
        <p className="mt-2 text-body text-neutral-600">
          Jawab beberapa pertanyaan untuk mendapat daftar berkas dan langkah yang sesuai situasi Anda.
        </p>
      </div>

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold">1. Layanan apa yang ingin Anda urus?</h2>
          <div className="space-y-3">
            <button
              onClick={() => selectService('ktp')}
              className="block w-full rounded-md border border-neutral-300 bg-surface p-4 text-left hover:border-primary-600 hover:bg-primary-50"
            >
              <p className="font-semibold text-primary-700">KTP Elektronik (KTP-el)</p>
              <p className="text-body-sm text-neutral-600">Membuat, mengganti, atau memperbarui KTP-el</p>
            </button>
            <p className="text-body-sm text-neutral-600">
              Layanan lain (KK, Akta Kelahiran, Pindah, dll.) akan ditambahkan bertahap.
            </p>
          </div>
        </section>
      )}

      {step === 2 && service === 'ktp' && (
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold">2. Situasi Anda saat ini?</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => selectScenario('baru')}
              className="rounded-md border border-neutral-300 bg-surface p-4 text-left hover:border-primary-600 hover:bg-primary-50"
            >
              <p className="font-semibold text-primary-700">Baru (pertama kali)</p>
              <p className="text-body-sm text-neutral-600">Saya belum punya KTP-el, baru usia 17 tahun atau lebih</p>
            </button>
            <button
              onClick={() => selectScenario('hilang')}
              className="rounded-md border border-neutral-300 bg-surface p-4 text-left hover:border-primary-600 hover:bg-primary-50"
            >
              <p className="font-semibold text-primary-700">Hilang</p>
              <p className="text-body-sm text-neutral-600">KTP-el saya hilang dan perlu bikin baru</p>
            </button>
            <button
              onClick={() => selectScenario('rusak')}
              className="rounded-md border border-neutral-300 bg-surface p-4 text-left hover:border-primary-600 hover:bg-primary-50"
            >
              <p className="font-semibold text-primary-700">Rusak</p>
              <p className="text-body-sm text-neutral-600">KTP-el rusak (chip tidak terbaca atau fisik rusak)</p>
            </button>
            <button
              onClick={() => selectScenario('perubahan')}
              className="rounded-md border border-neutral-300 bg-surface p-4 text-left hover:border-primary-600 hover:bg-primary-50"
            >
              <p className="font-semibold text-primary-700">Perubahan Data</p>
              <p className="text-body-sm text-neutral-600">Pindah alamat, ganti status, atau ubah data lain</p>
            </button>
          </div>
          <Button variant="secondary" onClick={reset}>
            ← Kembali
          </Button>
        </section>
      )}

      {step === 3 && result && (
        <section className="space-y-6">
          <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
            <h2 className="text-h2 font-semibold text-primary-900">{result.service}</h2>
            <p className="text-body text-primary-800">{result.scenario}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3 font-semibold">Berkas yang Perlu Dibawa</h3>
            <ul className="space-y-2">
              {result.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-primary-600">✓</span>
                  <span className="flex-1 text-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3 font-semibold">Langkah-langkah</h3>
            <ol className="space-y-3">
              {result.steps.map((st, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-semibold text-neutral-700">{i + 1}.</span>
                  <span className="flex-1 text-body">{st}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-md bg-muted p-4 text-body-sm text-muted-foreground">
            <p className="font-semibold">Catatan Penting:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Checklist ini alat bantu persiapan, bukan pengganti informasi resmi terbaru.</li>
              <li>Syarat dapat berubah. Konfirmasi ke Disdukcapil Kota Semarang sebelum datang.</li>
              <li>Portal ini hanya memberi informasi. Pengurusan dilakukan di kantor Disdukcapil atau kanal resmi.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.print()}>🖨️ Cetak Checklist</Button>
            <Button variant="secondary" onClick={reset}>
              Cek Kebutuhan Lain
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
