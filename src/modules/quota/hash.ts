import { createHash } from "crypto";

/**
 * Hash IP dengan garam harian (YYYY-MM-DD) untuk kunci kuota anonim.
 * Kedaluwarsa otomatis setelah hari berganti (TTL 24 jam).
 */
export function hashIpDaily(ip: string): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD UTC
  const salt = process.env.QUOTA_SALT || "aruna-quota-salt-2026"; // ponytail: ganti dengan secret dari env
  const raw = `${ip}:${today}:${salt}`;
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
