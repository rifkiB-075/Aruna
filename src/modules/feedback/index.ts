// Laporan jawaban keliru: tanpa PII dan tanpa identitas pelapor.
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Modul feedback: laporan jawaban keliru dari pengguna.
 */

export interface ReportInput {
  chatEventId?: string;
  reasonRedacted: string;
}

export interface ReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

/**
 * Submit laporan jawaban keliru.
 * Reason di-redact untuk PII sebelum disimpan.
 */
export async function reportAnswer(
  supabase: SupabaseClient,
  input: ReportInput
): Promise<ReportResult> {
  const { data, error } = await supabase
    .from("answer_reports")
    .insert({
      chat_event_id: input.chatEventId,
      reason_redacted: input.reasonRedacted,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to submit report:", error);
    return { success: false, error: error.message };
  }

  return { success: true, reportId: data.id };
}

/**
 * Dashboard minimal: statistik laporan.
 */
export interface ReportStats {
  total: number;
  new: number;
  reviewing: number;
  done: number;
}

export async function getReportStats(supabase: SupabaseClient): Promise<ReportStats> {
  const { data, error } = await supabase
    .from("answer_reports")
    .select("status");

  if (error) {
    console.error("Failed to fetch report stats:", error);
    return { total: 0, new: 0, reviewing: 0, done: 0 };
  }

  const stats = {
    total: data.length,
    new: data.filter((r: { status: string }) => r.status === "new").length,
    reviewing: data.filter((r: { status: string }) => r.status === "reviewing").length,
    done: data.filter((r: { status: string }) => r.status === "done").length,
  };

  return stats;
}
