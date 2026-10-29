import type { QuotaSubject, QuotaDecision, QuotaStore } from "./index";
import { getServerEnv } from "@/lib/config/env";

/**
 * In-memory quota store untuk MVP.
 * ponytail: ganti dengan Redis/Valkey untuk production (multi-instance, persistence).
 * Key: hash harian (anonim) atau user_id. Value: jumlah konsumsi hari ini.
 * TTL otomatis karena key berubah setiap hari.
 */
export class MemoryQuotaStore implements QuotaStore {
  private counts = new Map<string, number>();
  private lastCleanup = Date.now();
  private anonLimit: number;
  private userLimit: number;

  constructor(anonLimit?: number, userLimit?: number) {
    // Lazy load env hanya jika limit tidak disediakan
    this.anonLimit = anonLimit ?? (typeof process !== "undefined" ? getServerEnv().QUOTA_ANON_PER_DAY : 5);
    this.userLimit = userLimit ?? (typeof process !== "undefined" ? getServerEnv().QUOTA_USER_PER_DAY : 20);
  }

  async consume(subject: QuotaSubject): Promise<QuotaDecision> {
    this.cleanup();

    const key = subject.kind === "anonymous" ? subject.key : `user:${subject.userId}`;
    const limit = subject.kind === "anonymous" ? this.anonLimit : this.userLimit;

    const current = this.counts.get(key) || 0;

    if (current >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    this.counts.set(key, current + 1);
    return { allowed: true, remaining: limit - current - 1, limit };
  }

  /** Cleanup entries older than 25h (buffer untuk zona waktu) */
  private cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > 3600_000) {
      // Cleanup tiap jam
      // ponytail: Map tanpa TTL per-key; hapus semua jika > 25 jam sejak midnight UTC
      const midnightUTC = new Date().setUTCHours(0, 0, 0, 0);
      if (now - midnightUTC > 25 * 3600_000) {
        this.counts.clear();
      }
      this.lastCleanup = now;
    }
  }
}

let _quotaStore: QuotaStore | undefined;

export function getQuotaStore(): QuotaStore {
  if (!_quotaStore) {
    _quotaStore = new MemoryQuotaStore();
  }
  return _quotaStore;
}
