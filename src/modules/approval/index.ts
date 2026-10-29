import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "../audit";

/**
 * Modul approval: alur persetujuan sumber dengan four-eyes dan audit log.
 * Transisi status: draft → ready_for_review → active/rejected
 * Four-eyes: uploaded_by ≠ approved_by (enforced by DB trigger).
 */

export interface ApprovalResult {
  success: boolean;
  error?: string;
  sourceId?: string;
}

/**
 * Submit source untuk review: draft → ready_for_review.
 * Hanya editor/uploader yang bisa submit.
 */
export async function submitForReview(
  supabase: SupabaseClient,
  sourceId: string,
  actorId: string
): Promise<ApprovalResult> {
  // Cek ownership
  const { data: source, error: fetchError } = await supabase
    .from("sources")
    .select("id, status, uploaded_by")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return { success: false, error: "Source tidak ditemukan" };
  }

  if (source.status !== "draft") {
    return { success: false, error: `Status source bukan draft: ${source.status}` };
  }

  if (source.uploaded_by !== actorId) {
    return { success: false, error: "Hanya uploader yang bisa submit untuk review" };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("sources")
    .update({ status: "ready_for_review" })
    .eq("id", sourceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Audit log
  await writeAudit(supabase, {
    actorId,
    action: "source.submit_review",
    objectType: "source",
    objectId: sourceId,
    summary: "Source submitted for review",
  });

  return { success: true, sourceId };
}

/**
 * Approve dan activate source: ready_for_review → active.
 * Hanya reviewer/super_admin. Four-eyes: approved_by ≠ uploaded_by (trigger check).
 */
export async function approveSource(
  supabase: SupabaseClient,
  sourceId: string,
  actorId: string,
  reviewNote?: string
): Promise<ApprovalResult> {
  // Cek source
  const { data: source, error: fetchError } = await supabase
    .from("sources")
    .select("id, status, uploaded_by")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return { success: false, error: "Source tidak ditemukan" };
  }

  if (source.status !== "ready_for_review") {
    return { success: false, error: `Status source bukan ready_for_review: ${source.status}` };
  }

  // Four-eyes check (pre-validate sebelum trigger DB)
  if (source.uploaded_by === actorId) {
    return {
      success: false,
      error: "Four-eyes violation: uploader tidak boleh approve sendiri",
    };
  }

  // Update status → active, set approved_by
  const { error: updateError } = await supabase
    .from("sources")
    .update({
      status: "active",
      approved_by: actorId,
      review_note: reviewNote,
    })
    .eq("id", sourceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Audit log
  await writeAudit(supabase, {
    actorId,
    action: "source.approve",
    objectType: "source",
    objectId: sourceId,
    summary: `Source approved: ${reviewNote ?? "(no note)"}`,
    metadata: { review_note: reviewNote },
  });

  return { success: true, sourceId };
}

/**
 * Reject source: ready_for_review → rejected.
 * Hanya reviewer/super_admin.
 */
export async function rejectSource(
  supabase: SupabaseClient,
  sourceId: string,
  actorId: string,
  reviewNote: string
): Promise<ApprovalResult> {
  const { data: source, error: fetchError } = await supabase
    .from("sources")
    .select("id, status")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return { success: false, error: "Source tidak ditemukan" };
  }

  if (source.status !== "ready_for_review") {
    return { success: false, error: `Status source bukan ready_for_review: ${source.status}` };
  }

  const { error: updateError } = await supabase
    .from("sources")
    .update({
      status: "rejected",
      approved_by: actorId,
      review_note: reviewNote,
    })
    .eq("id", sourceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await writeAudit(supabase, {
    actorId,
    action: "source.reject",
    objectType: "source",
    objectId: sourceId,
    summary: `Source rejected: ${reviewNote}`,
    metadata: { review_note: reviewNote },
  });

  return { success: true, sourceId };
}

/**
 * Deactivate source: active → inactive.
 * Hanya reviewer/super_admin.
 */
export async function deactivateSource(
  supabase: SupabaseClient,
  sourceId: string,
  actorId: string,
  reason: string
): Promise<ApprovalResult> {
  const { data: source, error: fetchError } = await supabase
    .from("sources")
    .select("id, status")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return { success: false, error: "Source tidak ditemukan" };
  }

  if (source.status !== "active") {
    return { success: false, error: `Status source bukan active: ${source.status}` };
  }

  const { error: updateError } = await supabase
    .from("sources")
    .update({ status: "inactive", review_note: reason })
    .eq("id", sourceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await writeAudit(supabase, {
    actorId,
    action: "source.deactivate",
    objectType: "source",
    objectId: sourceId,
    summary: `Source deactivated: ${reason}`,
    metadata: { reason },
  });

  return { success: true, sourceId };
}
