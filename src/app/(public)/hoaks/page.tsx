'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type VerificationResult = 'sesuai' | 'bertentangan' | 'tidak_pasti';

interface VerificationResponse {
  result: VerificationResult;
  explanation: string;
  sources: string[];
  tips: string[];
}

export default function CekHoaks() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (claim.trim().length < 10) {
      setError('Klaim minimal 10 karakter');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error || 'Gagal memverifikasi');
      }

      const data = (await res.json()) as VerificationResponse;
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setClaim('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-h1 font-bold">Cek Hoaks/Penipuan</h1>
        <p className="mt-2 text-body text-neutral-600">
          Paste klaim atau pesan yang Anda terima untuk dicek kesesuaiannya dengan informasi resmi.
        </p>
      </div>

      {!result && (
        <section className="space-y-4">
          <div>
            <label htmlFor="claim" className="mb-2 block text-body-lg font-semibold">
              Klaim/Pesan yang Ingin Dicek
            </label>
            <textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="min-h-40 w-full rounded-md border border-neutral-700 p-3 text-body"
              maxLength={2000}
              placeholder='Contoh: "Bikin KTP harus bayar 500 ribu" atau "Layanan KIA bisa online lewat WhatsApp"'
            />
            <p className="mt-1 text-body-sm text-neutral-600">
              {claim.length}/2000 karakter • Jangan sertakan NIK atau data pribadi
            </p>
          </div>

          <Button onClick={handleVerify} disabled={loading || claim.trim().length < 10}>
            {loading ? 'Memverifikasi...' : 'Cek Klaim'}
          </Button>

          {error && <p className="text-danger-700">{error}</p>}
        </section>
      )}

      {result && (
        <section className="space-y-6">
          <div
            className={`rounded-md border p-4 ${
              result.result === 'sesuai'
                ? 'border-success-200 bg-success-50'
                : result.result === 'bertentangan'
                  ? 'border-danger-200 bg-danger-50'
                  : 'border-neutral-200 bg-neutral-50'
            }`}
          >
            <h2 className="text-h2 font-bold">
              {result.result === 'sesuai' && '✓ Sesuai Sumber Resmi'}
              {result.result === 'bertentangan' && '✗ Bertentangan dengan Sumber Resmi'}
              {result.result === 'tidak_pasti' && '? Tidak Dapat Dipastikan'}
            </h2>
            <p className="mt-2 text-body">{result.explanation}</p>
          </div>

          {result.sources.length > 0 && (
            <div className="rounded-md border border-neutral-200 bg-surface p-4">
              <h3 className="font-semibold">Sumber Referensi:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-body-sm text-neutral-700">
                {result.sources.map((src, i) => (
                  <li key={i}>{src}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
            <h3 className="font-semibold text-primary-900">Tips Mengenali Calo dan Penipuan:</h3>
            <ul className="mt-2 space-y-2 text-body-sm text-primary-800">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary-600">•</span>
                  <span className="flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md bg-muted p-4 text-body-sm text-muted-foreground">
            <p className="font-semibold">Catatan Penting:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Hasil verifikasi berdasarkan sumber resmi yang tersedia saat ini.</li>
              <li>Untuk kepastian, selalu konfirmasi ke Disdukcapil Kota Semarang langsung.</li>
              <li>Laporkan penipuan atau calo ke pihak berwenang.</li>
            </ul>
          </div>

          <Button onClick={reset}>Cek Klaim Lain</Button>
        </section>
      )}
    </div>
  );
}
