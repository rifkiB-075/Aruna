"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "aruna-consent-acknowledged";

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check localStorage consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-neutral-900/50" />

      {/* Banner */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-300 bg-white p-6 shadow-lg sm:bottom-4 sm:left-1/2 sm:right-auto sm:max-w-2xl sm:-translate-x-1/2 sm:rounded-lg sm:border">
        <div className="space-y-4">
          <h2 className="text-h3 font-semibold">Pemberitahuan Privasi</h2>
          <p className="text-body">
            Aruna adalah portal edukasi layanan Disdukcapil Kota Semarang. Dengan menggunakan layanan ini, Anda menyetujui:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-body-sm">
            <li>Pertanyaan Anda disimpan <strong>secara anonim</strong> untuk peningkatan layanan (90 hari, lalu otomatis dihapus)</li>
            <li>
              Kami <strong>TIDAK</strong> menyimpan NIK, alamat, nomor telepon, atau dokumen kependudukan
            </li>
            <li>
              Alamat IP Anda di-<em>hash</em> satu arah untuk pembatasan kuota harian (tidak dapat dibalik, kedaluwarsa 24 jam)
            </li>
            <li>Data terenkripsi dan dilindungi sesuai UU No. 27/2022 tentang Perlindungan Data Pribadi</li>
          </ul>
          <p className="text-body-sm text-neutral-600">
            Untuk informasi lengkap, baca{" "}
            <Link href="/privacy" className="font-medium text-primary-700 underline">
              Kebijakan Privasi
            </Link>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleAccept} className="flex-1">
              Saya Mengerti & Setuju
            </Button>
            <Link href="/privacy" className="flex-1">
              <Button variant="secondary" className="w-full">
                Baca Kebijakan Lengkap
              </Button>
            </Link>
          </div>
          <p className="text-body-xs text-neutral-500">
            💡 Dengan menekan &ldquo;Saya Mengerti & Setuju&rdquo;, Anda memberikan persetujuan (consent) untuk pemrosesan data sesuai UU PDP Pasal 20 ayat 1 huruf a.
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Hook untuk cek consent status (untuk disable chat form)
 */
export function useConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    setHasConsent(!!consent);
  }, []);

  return hasConsent;
}
