import { requireRole } from "@/modules/auth";

// Endpoint admin: ingestion dokumen sumber. Fail-closed sampai RBAC tersambung.
export async function POST() {
  await requireRole(["editor"]);
  return Response.json({ error: "Belum tersedia" }, { status: 501 });
}
