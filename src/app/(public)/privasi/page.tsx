import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - Aruna',
  description: 'Kebijakan privasi dan perlindungan data pribadi Portal Aruna',
};

export default function PrivasiPage() {
  return (
    <main className="container max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: 31 Oktober 2026
          </p>
          <p className="mt-4">
            Portal Aruna (&quot;Kami&quot;) adalah layanan edukasi dan informasi publik yang dikelola oleh 
            Dinas Kependudukan dan Pencatatan Sipil Kota Semarang. Kami berkomitmen melindungi 
            privasi Anda sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Data yang Kami Kumpulkan</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-3">1.1 Pengguna Tanpa Akun</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Pertanyaan chatbot yang tersamarkan:</strong> Kami menyimpan teks pertanyaan 
              Anda setelah memindai dan menyamarkan data pribadi (NIK, nama, alamat, telepon). 
              Pesan yang mengandung data pribadi tidak disimpan sama sekali.
            </li>
            <li>
              <strong>Hash alamat IP:</strong> Untuk kuota harian, IP Anda di-hash (SHA-256 dengan 
              salt harian) dan otomatis terhapus setelah 24 jam. Kami tidak dapat menelusuri IP asli 
              Anda dari hash ini.
            </li>
            <li>
              <strong>Laporan jawaban keliru:</strong> Jika Anda melaporkan jawaban chatbot, kami 
              menyimpan pertanyaan, jawaban, dan sumber rujukan tanpa identitas Anda.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">1.2 Pengguna dengan Akun</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Email:</strong> Untuk login dan verifikasi akun. Kami tidak meminta atau 
              menyimpan nama, NIK, nomor KK, alamat, atau nomor telepon.
            </li>
            <li>
              <strong>Riwayat chat:</strong> Hanya pesan yang lolos pemindaian data pribadi dan 
              sudah disamarkan yang disimpan. Riwayat terhapus otomatis setelah 90 hari.
            </li>
            <li>
              <strong>Penghitung kuota:</strong> Jumlah pertanyaan yang Anda gunakan hari ini, 
              direset setiap 24 jam.
            </li>
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Kami tidak pernah meminta:</strong> NIK, nomor KK, kata sandi Sidnok/IKD, 
            OTP, PIN, atau dokumen kependudukan Anda. Portal Aruna hanya memberikan informasi; 
            pengurusan dokumen dilakukan di Sidnok atau kantor Disdukcapil.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Tujuan Pemrosesan Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Memberikan jawaban chatbot berdasarkan dokumen resmi Disdukcapil</li>
            <li>Membatasi kuota pertanyaan untuk mencegah penyalahgunaan</li>
            <li>Meningkatkan kualitas jawaban dengan menganalisis pertanyaan anonim agregat</li>
            <li>Menyimpan riwayat chat Anda (untuk pengguna dengan akun)</li>
            <li>Mendeteksi dan mencegah jawaban keliru yang dilaporkan warga</li>
          </ul>
          <p className="mt-4">
            Kami tidak menjual, membagikan, atau menggunakan data Anda untuk iklan atau tujuan 
            komersial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Dasar Hukum Pemrosesan</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Kepentingan sah:</strong> Portal Aruna adalah layanan publik untuk sosialisasi 
              dan edukasi administrasi kependudukan Kota Semarang.
            </li>
            <li>
              <strong>Persetujuan (consent):</strong> Dengan mengirim pertanyaan atau membuat akun, 
              Anda menyetujui pemrosesan data sesuai kebijakan ini.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Penyimpanan dan Keamanan Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Lokasi:</strong> Data disimpan di server Supabase (USA) dengan enkripsi 
              at-rest dan in-transit (TLS). Supabase patuh SOC 2 Type II dan GDPR.
            </li>
            <li>
              <strong>Retensi:</strong> Riwayat chat terhapus otomatis setelah 90 hari. Hash IP 
              terhapus setelah 24 jam. Laporan jawaban keliru disimpan sampai ditinjau admin.
            </li>
            <li>
              <strong>Kontrol teknis:</strong> Row-Level Security (RLS) memastikan Anda hanya dapat 
              melihat riwayat Anda sendiri. Admin Disdukcapil memerlukan autentikasi multi-faktor 
              dan tidak dapat mengakses riwayat chat warga tanpa alasan sah.
            </li>
            <li>
              <strong>Pemindaian data pribadi:</strong> Sistem kami memindai dan menyamarkan NIK, 
              nama, alamat, telepon sebelum menyimpan atau mengirim ke model AI. Pesan yang gagal 
              lolos pemindaian tidak disimpan.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Hak Anda</h2>
          <p className="mb-4">
            Sesuai UU No. 27/2022, Anda berhak:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Hak akses:</strong> Melihat data apa yang kami simpan tentang Anda (pengguna 
              dengan akun dapat melihat riwayat di dashboard).
            </li>
            <li>
              <strong>Hak penghapusan:</strong> Menghapus riwayat chat atau akun Anda kapan saja. 
              Hapus akun akan menghapus email, riwayat, dan penghitung kuota Anda secara permanen.
            </li>
            <li>
              <strong>Hak portabilitas:</strong> Mengekspor riwayat chat Anda dalam format JSON 
              (tersedia di pengaturan akun).
            </li>
            <li>
              <strong>Hak menolak pemrosesan:</strong> Anda dapat berhenti menggunakan chatbot atau 
              menghapus akun kapan saja.
            </li>
          </ul>
          <p className="mt-4">
            Untuk menggunakan hak Anda, hubungi kami di email kontak di bawah.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Pihak Ketiga</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Provider AI:</strong> Pertanyaan yang sudah disamarkan dikirim ke model AI 
              eksternal (OpenAI/xAI/OpenRouter) untuk menghasilkan jawaban. Provider tidak menerima 
              data pribadi Anda.
            </li>
            <li>
              <strong>Supabase:</strong> Penyedia database dan autentikasi. Data Processing Agreement 
              (DPA) aktif untuk kepatuhan privasi.
            </li>
          </ul>
          <p className="mt-4">
            Kami tidak menggunakan cookie pelacak, fingerprinting, atau analitik pihak ketiga yang 
            mengidentifikasi Anda.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui kebijakan ini untuk mencerminkan perubahan layanan atau regulasi. 
            Perubahan material akan diberitahukan lewat notice di portal atau email (untuk pengguna 
            dengan akun).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Kontak</h2>
          <p className="mb-4">
            Untuk pertanyaan atau permintaan privasi:
          </p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:disdukcapil@semarangkota.go.id" className="text-primary hover:underline">
                disdukcapil@semarangkota.go.id
              </a>
            </li>
            <li>
              <strong>Alamat:</strong> Dinas Kependudukan dan Pencatatan Sipil Kota Semarang, 
              Jl. Dr. Cipto No. 35, Semarang
            </li>
            <li>
              <strong>Telepon:</strong> (024) 3515015
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Petugas Pelindungan Data Pribadi: [Akan diumumkan setelah penunjukan resmi]
          </p>
        </section>

        <section className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Catatan Penting:</strong> Portal Aruna hanya memberikan informasi dan edukasi. 
            Pengurusan dokumen kependudukan (KTP, KK, akta, dll.) dilakukan di layanan online Sidnok 
            atau datang ke kantor Disdukcapil. Kami tidak pernah meminta NIK, kata sandi, OTP, atau 
            dokumen pribadi Anda.
          </p>
        </section>
      </div>
    </main>
  );
}
