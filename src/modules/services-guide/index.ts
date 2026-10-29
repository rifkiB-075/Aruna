import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Modul services-guide: panduan layanan dari sumber aktif.
 */

export interface ServiceGuide {
  id: string;
  serviceTypeId: string;
  section: "syarat" | "alur" | "biaya" | "waktu";
  body: string;
  sourceId: string;
  status: "draft" | "in_review" | "published" | "rejected";
}

/**
 * Ambil panduan layanan published untuk service type tertentu.
 */
export async function getServiceGuides(
  supabase: SupabaseClient,
  serviceTypeId: string
): Promise<ServiceGuide[]> {
  const { data, error } = await supabase
    .from("service_guides")
    .select("*")
    .eq("service_type_id", serviceTypeId)
    .eq("status", "published")
    .order("section");

  if (error) {
    console.error("Failed to fetch service guides:", error);
    return [];
  }

  return data.map((row: {
    id: string;
    service_type_id: string;
    section: string;
    body: string;
    source_id: string;
    status: string;
  }) => ({
    id: row.id,
    serviceTypeId: row.service_type_id,
    section: row.section as ServiceGuide["section"],
    body: row.body,
    sourceId: row.source_id,
    status: row.status as ServiceGuide["status"],
  }));
}
