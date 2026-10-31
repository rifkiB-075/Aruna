import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-h1 font-bold">Kebijakan Privasi Aruna</h1>
        <p className="text-body-sm text-neutral-600">
          Berlaku sejak: 31 Oktober 2026 | Terakhir diperbarui: 31 Oktober 2026
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">1. Siapa Kami</h2>
        <p className="text-body">
          Aruna adalah portal edukasi layanan Disdukcapil Kota Semarang yang membantu warga memahami syarat, alur, dan prosedur layanan administrasi kependudukan. Portal ini dikelola oleh Dinas Kependudukan dan Pencatatan Sipil Kota Semarang.
        </p>
        <p className="text-body">
          <strong>Kontak:</strong><br />
          Email: disdukcapil@semarangkota.go.id<br />
          Telepon: (024) 123-4567<br />
          Alamat: Jl. Pemuda No. 148, Semarang
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">2. Data yang Kami Kumpulkan</h2>
        
        <h3 className="text-h3 font-medium">2.1 Pengguna Tanpa Akun (Anonim)</h3>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Pertanyaan chat:</strong> Teks pertanyaan yang Anda kirim ke chatbot (tidak menyimpan NIK, nama, alamat, atau data pribadi sensitif)</li>
          <li><strong>Jawaban & sitasi:</strong> Jawaban yang diberikan sistem beserta nomor sumber yang dikutip</li>
          <li><strong>Laporan keliru:</strong> Bila Anda melaporkan jawaban keliru, kami menyimpan teks laporan dan timestamp</li>
          <li><strong>Metadata teknis:</strong> Waktu akses, skor relevansi retrieval, status jawaban (answered/fallback)</li>
          <li><strong>Hash IP:</strong> Hash satu arah (SHA-256 dengan salt harian) dari alamat IP Anda untuk pembatasan kuota harian. Hash ini <strong>tidak dapat dibalik</strong> menjadi IP asli dan otomatis kedaluwarsa setiap 24 jam</li>
        </ul>
        <p className="text-body-sm italic text-neutral-600">
          ⚠️ Kami <strong>tidak menyimpan</strong> alamat IP asli, cookies tracking, atau identifier permanen untuk pengguna anonim.
        </p>

        <h3 className="text-h3 font-medium">2.2 Pengguna dengan Akun (Opsional)</h3>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Email:</strong> Alamat email yang Anda daftarkan (melalui email/password atau Google Sign-In)</li>
          <li><strong>ID akun:</strong> Pengenal unik yang dibuat sistem untuk autentikasi (UUID, bukan data pribadi)</li>
          <li><strong>Riwayat chat:</strong> Pertanyaan dan jawaban Anda tersimpan terenkripsi di database, hanya dapat diakses oleh Anda sendiri (RLS policy)</li>
          <li><strong>Multi-Factor Authentication (MFA):</strong> Bila Anda aktifkan, kami simpan konfigurasi MFA (TOTP secret terenkripsi) untuk verifikasi login</li>
        </ul>
        <p className="text-body-sm italic text-neutral-600">
          ℹ️ Akun bersifat <strong>opsional</strong>. Anda dapat menggunakan Aruna tanpa membuat akun.
        </p>

        <h3 className="text-h3 font-medium">2.3 Data yang TIDAK Kami Kumpulkan</h3>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li>NIK (Nomor Induk Kependudukan)</li>
          <li>Nomor KK (Kartu Keluarga)</li>
          <li>Alamat tempat tinggal</li>
          <li>Nomor telepon</li>
          <li>Data biometrik (foto, sidik jari)</li>
          <li>Dokumen kependudukan (KTP, KK, Akta)</li>
        </ul>
        <p className="text-body font-semibold text-warning-700">
          🚨 Bila Anda mengetik NIK/alamat/telepon di chat, sistem otomatis menghapus data tersebut sebelum diproses dan menampilkan peringatan. Kami <strong>TIDAK PERNAH</strong> menyimpan data pribadi sensitif.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">3. Dasar Hukum Pemrosesan Data</h2>
        <p className="text-body">
          Sesuai UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP), kami memproses data Anda berdasarkan:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Persetujuan (Pasal 20 ayat 1 huruf a):</strong> Dengan menggunakan Aruna, Anda menyetujui pemrosesan data sesuai kebijakan ini</li>
          <li><strong>Pelaksanaan tugas pemerintahan (Pasal 20 ayat 1 huruf d):</strong> Memberikan informasi layanan publik kependudukan kepada warga</li>
          <li><strong>Kepentingan vital (Pasal 20 ayat 1 huruf e):</strong> Mencegah penyebaran hoaks dan melindungi warga dari penipuan calo/pungutan liar</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">4. Tujuan Penggunaan Data</h2>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li>Menjawab pertanyaan Anda tentang layanan Disdukcapil dengan akurat (RAG retrieval + LLM)</li>
          <li>Membatasi kuota chat harian untuk mencegah penyalahgunaan (hash IP 24 jam)</li>
          <li>Menyimpan riwayat chat (hanya untuk pengguna berakun, terenkripsi, self-service hapus)</li>
          <li>Menampilkan laporan keliru ke admin untuk perbaikan konten</li>
          <li>Analitik agregat untuk evaluasi kualitas jawaban (tidak mengidentifikasi individu)</li>
        </ul>
        <p className="text-body-sm italic text-neutral-600">
          ℹ️ Kami <strong>TIDAK</strong> menggunakan data Anda untuk iklan, profiling komersial, atau dijual ke pihak ketiga.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibmed">5. Berapa Lama Data Disimpan</h2>
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="p-3 text-left">Jenis Data</th>
              <th className="p-3 text-left">Retensi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="p-3">Hash IP (anonim)</td>
              <td className="p-3">24 jam (otomatis kedaluwarsa)</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="p-3">Chat events (anonim)</td>
              <td className="p-3">90 hari, lalu otomatis dihapus</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="p-3">Laporan keliru (anonim)</td>
              <td className="p-3">90 hari, lalu otomatis dihapus</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="p-3">Riwayat chat (akun)</td>
              <td className="p-3">Sampai Anda hapus sendiri atau hapus akun</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="p-3">Akun (email, ID)</td>
              <td className="p-3">Sampai Anda hapus akun</td>
            </tr>
            <tr>
              <td className="p-3">Audit log admin</td>
              <td className="p-3">1 tahun (kepatuhan operasional)</td>
            </tr>
          </tbody>
        </table>
        <p className="text-body-sm italic text-neutral-600">
          ⚙️ Cleanup otomatis dijadwalkan setiap hari (scheduled job Supabase).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">6. Keamanan Data</h2>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Enkripsi:</strong> Data transit (HTTPS/TLS 1.3), data at-rest (PostgreSQL encryption)</li>
          <li><strong>Row-Level Security (RLS):</strong> Anda hanya dapat melihat riwayat chat Anda sendiri, admin tidak dapat mengakses chat pengguna tanpa otorisasi</li>
          <li><strong>PII Scan:</strong> Sistem otomatis menghapus NIK/alamat/telepon sebelum diproses</li>
          <li><strong>Four-eyes approval:</strong> Dokumen sumber harus disetujui dua pihak terpisah (Editor ≠ Reviewer) sebelum aktif</li>
          <li><strong>Audit log:</strong> Semua aksi admin tercatat (siapa, kapan, apa) untuk transparansi</li>
          <li><strong>Backup terenkripsi:</strong> Backup harian otomatis Supabase dengan enkripsi AES-256</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">7. Transfer Data Lintas Negara</h2>
        <p className="text-body">
          Data Anda disimpan di server Supabase (region: Singapore atau Jakarta, tergantung konfigurasi deployment). Pemrosesan AI menggunakan provider OpenAI-compatible yang mungkin berlokasi di luar Indonesia.
        </p>
        <p className="text-body font-semibold text-warning-700">
          ⚠️ Sesuai Pasal 56 UU PDP, transfer lintas negara memerlukan Data Processing Agreement (DPA) dengan provider AI. Status DPA saat ini: <strong>[pending konfirmasi Hua H-09]</strong>.
        </p>
        <p className="text-body-sm italic text-neutral-600">
          ℹ️ Kami hanya mengirim teks pertanyaan (tanpa PII) ke AI. Dokumen sumber resmi tetap tersimpan lokal di database Supabase Indonesia.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">8. Hak Anda (UU PDP Pasal 5)</h2>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Akses:</strong> Melihat riwayat chat Anda (menu Profil → Riwayat)</li>
          <li><strong>Koreksi:</strong> Tidak berlaku (chat history read-only untuk integritas audit)</li>
          <li><strong>Hapus:</strong> Hapus riwayat chat sendiri kapan saja (button &ldquo;Hapus Riwayat&rdquo;), atau hapus akun lengkap (menu Profil → Hapus Akun)</li>
          <li><strong>Portabilitas:</strong> Export riwayat chat format JSON (menu Profil → Export Data) [fitur: ponytail]</li>
          <li><strong>Penarikan persetujuan:</strong> Berhenti menggunakan Aruna atau hapus akun</li>
          <li><strong>Pengaduan:</strong> Hubungi disdukcapil@semarangkota.go.id atau Kominfo Kota Semarang</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">9. Notifikasi Pelanggaran Data</h2>
        <p className="text-body">
          Sesuai Pasal 62 UU PDP, bila terjadi pelanggaran data (data breach), kami akan:
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-body">
          <li>Memberitahu Anda melalui email (untuk pengguna berakun) atau pengumuman di portal (untuk anonim) dalam <strong>3x24 jam</strong></li>
          <li>Melaporkan ke Kementerian Komunikasi dan Informatika</li>
          <li>Mengungkap: jenis data terpengaruh, penyebab, langkah mitigasi, cara Anda melindungi diri</li>
        </ol>
        <p className="text-body-sm italic text-neutral-600">
          📋 Prosedur lengkap: lihat <code>docs/08-RUNBOOK-BACKUP-RESTORE.md</code> § Disaster Recovery.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">10. Cookies & Tracking</h2>
        <p className="text-body">
          Aruna menggunakan <strong>cookies teknis minimal</strong> untuk autentikasi (bila Anda login):
        </p>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><code>sb-access-token</code> & <code>sb-refresh-token</code> (Supabase Auth, HttpOnly, Secure, SameSite=Lax, expires 1 jam/7 hari)</li>
          <li><code>consent-acknowledged</code> (localStorage, menyimpan status Anda sudah membaca consent notice)</li>
        </ul>
        <p className="text-body-sm italic text-neutral-600">
          ℹ️ Kami <strong>TIDAK</strong> menggunakan Google Analytics, Facebook Pixel, atau tracking pihak ketiga.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">11. Perubahan Kebijakan</h2>
        <p className="text-body">
          Kami dapat memperbarui kebijakan ini untuk kepatuhan hukum atau perbaikan layanan. Perubahan material akan diberitahu melalui:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li>Banner notifikasi di portal (wajib dibaca sebelum melanjutkan)</li>
          <li>Email (untuk pengguna berakun)</li>
        </ul>
        <p className="text-body">
          Tanggal &ldquo;Terakhir diperbarui&rdquo; di atas selalu menunjukkan versi terbaru.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">12. Kontak & Pengaduan</h2>
        <p className="text-body">
          Untuk pertanyaan tentang privasi atau mengajukan hak akses/hapus data:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-body">
          <li><strong>Email:</strong> disdukcapil@semarangkota.go.id (Cc: petugas PDP [pending Hua H-14])</li>
          <li><strong>Telepon:</strong> (024) 123-4567</li>
          <li><strong>Alamat:</strong> Dinas Kependudukan dan Pencatatan Sipil Kota Semarang, Jl. Pemuda No. 148, Semarang 50132</li>
        </ul>
        <p className="text-body">
          Kami akan merespons dalam <strong>14 hari kerja</strong> sesuai SLA layanan publik.
        </p>
      </section>

      <section className="rounded-md border border-info-300 bg-info-50 p-4">
        <h3 className="text-h3 font-semibold text-info-900">Ringkasan Singkat</h3>
        <ul className="mt-2 space-y-1 text-body-sm text-info-800">
          <li>✅ Kami TIDAK menyimpan NIK, alamat, telepon, atau dokumen kependudukan</li>
          <li>✅ Pengguna anonim: hanya hash IP 24 jam + pertanyaan/jawaban 90 hari</li>
          <li>✅ Akun opsional: email + riwayat chat (dapat dihapus kapan saja)</li>
          <li>✅ Data terenkripsi (HTTPS + RLS + backup AES-256)</li>
          <li>✅ Hak hapus akun & riwayat tersedia self-service</li>
          <li>⚠️ AI provider mungkin di luar Indonesia (DPA pending)</li>
        </ul>
      </section>

      <footer className="mt-8 border-t border-neutral-300 pt-6 text-body-sm text-neutral-600">
        <p>
          Portal Aruna dikelola oleh Dinas Kependudukan dan Pencatatan Sipil Kota Semarang.
          Kebijakan privasi ini mematuhi UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.
        </p>
        <p className="mt-2">
          <Link href="/" className="text-primary-700 underline">
            Kembali ke Beranda
          </Link>
        </p>
      </footer>
    </div>
  );
}
