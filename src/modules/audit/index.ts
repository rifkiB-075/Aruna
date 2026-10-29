import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "source.upload"
  | "source.submit_review"
  | "source.approve"
  | "source.reject"
  | "source.activate"
  | "source.deactivate"
  | "content.approve"
  | "content.reject"
  | "role.change"
  | "admin.login";

export interface AuditEntry {
  actorId: string;
  action: AuditAction;
  objectType: string;
  objectId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit log append-only ke tabel audit_logs.
 */
export async function writeAudit(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    object_type: entry.objectType,
    object_id: entry.objectId,
    summary: entry.summary,
    metadata: entry.metadata,
  });

  if (error) {
    console.error("Failed to write audit log:", error);
    // Tidak throw error agar tidak blokir operasi utama
  }
}
