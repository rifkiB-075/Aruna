import type { QuotaSubject, QuotaDecision, QuotaStore } from "./index";
import { createClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/config/env";

/**
 * Database-backed quota store untuk user accounts (fase 2).
 * Menggunakan usage_counters table dengan RPC atomik.
 */
export class DatabaseQuotaStore implements QuotaStore {
  private userLimit: number;

  constructor(userLimit?: number) {
    this.userLimit = userLimit ?? getServerEnv().QUOTA_USER_PER_DAY;
  }

  async consume(subject: QuotaSubject): Promise<QuotaDecision> {
    if (subject.kind !== "user") {
      throw new Error("DatabaseQuotaStore hanya untuk user accounts");
    }

    const supabase = await createClient();

    // Ambil counter saat ini
    const { data: counter } = await supabase
      .from("usage_counters")
      .select("chat_count_today, reset_date")
      .eq("account_id", subject.userId)
      .single();

    const today = new Date().toISOString().split("T")[0];

    // Cek apakah sudah melewati batas
    const currentCount = counter?.reset_date === today ? (counter?.chat_count_today ?? 0) : 0;

    if (currentCount >= this.userLimit) {
      return { allowed: false, remaining: 0, limit: this.userLimit };
    }

    // Increment via RPC atomik
    const { error } = await supabase.rpc("increment_chat_count", {
      user_id: subject.userId,
    });

    if (error) {
      // Fallback: deny bila RPC gagal (fail-closed)
      return { allowed: false, remaining: 0, limit: this.userLimit };
    }

    return {
      allowed: true,
      remaining: this.userLimit - currentCount - 1,
      limit: this.userLimit,
    };
  }
}
