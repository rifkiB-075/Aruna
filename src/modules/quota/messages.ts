/**
 * Pesan kuota habis (tidak memanggil model).
 * Template sesuai AGENTS B4c.
 */
export function getQuotaExhaustedMessage(isAuthenticated: boolean): string {
  if (!isAuthenticated) {
    return "Kuota tanya hari ini sudah habis. Anda masih bisa membaca Panduan Layanan dan memakai Cek Kebutuhanku. Masuk untuk mendapat kuota lebih banyak.";
  }
  return "Kuota tanya hari ini sudah habis. Coba lagi besok, atau baca Panduan Layanan.";
}
