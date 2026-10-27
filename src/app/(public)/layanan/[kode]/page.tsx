import { notFound } from "next/navigation";
import { ScopeNotice } from "@/components/features/ScopeNotice";

const NAMA: Record<string, string> = {
  "ktp-el": "KTP-el",
  kk: "Kartu Keluarga (KK)",
  akta: "Akta",
  "pindah-datang": "Pindah / Datang",
  ikd: "Identitas Kependudukan Digital (IKD)",
};

export default async function LayananPage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const nama = NAMA[kode];
  if (!nama) notFound();
  // TODO: ambil dari modules/services-guide (hanya panduan terbit + bersumber).
  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold">{nama}</h1>
      <ScopeNotice />
      <p className="text-body-lg">Panduan untuk layanan ini belum tersedia. Silakan hubungi kanal resmi Disdukcapil Kota Semarang.</p>
    </div>
  );
}
