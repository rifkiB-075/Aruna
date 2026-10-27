/**
 * Pembatas laju sederhana di memori (per kunci). Cukup untuk dev/instance tunggal.
 * Untuk produksi multi-instance, ganti dengan penyimpanan terpusat (mis. Redis/Upstash).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
