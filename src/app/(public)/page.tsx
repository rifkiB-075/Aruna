import { ScopeNotice } from "@/components/features/ScopeNotice";

const layanan = [
  { kode: "ktp-el", nama: "KTP-el" },
  { kode: "kk", nama: "Kartu Keluarga (KK)" },
  { kode: "akta", nama: "Akta" },
  { kode: "pindah-datang", nama: "Pindah / Datang" },
  { kode: "ikd", nama: "Identitas Kependudukan Digital (IKD)" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <ScopeNotice />
      <section>
        <h1 className="text-display font-bold">Pelajari layanan kependudukan Kota Semarang</h1>
        <p className="mt-3 text-body-lg">Lihat syarat, alur, biaya, dan waktu layanan dengan bahasa sederhana.</p>
        <a href="/chat" className="mt-4 inline-flex min-h-touch items-center rounded-md bg-primary-700 px-5 py-2 font-semibold text-white no-underline">Tanya asisten</a>
      </section>
      <section aria-labelledby="h-layanan">
        <h2 id="h-layanan" className="text-h2 font-semibold">Pilih layanan</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {layanan.map((l) => (
            <li key={l.kode} className="rounded-lg border border-neutral-200 bg-surface p-4">
              <a className="text-h3 font-semibold" href={`/layanan/${l.kode}`}>{l.nama}</a>
              <p className="text-body text-neutral-700">Lihat syarat dan alurnya</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
