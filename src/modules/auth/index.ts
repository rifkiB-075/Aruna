import { notFound } from "next/navigation";
import type { AdminRole } from "@/types";

/**
 * Fail-closed: sebelum Supabase Auth + RBAC tersambung, semua akses admin DITOLAK.
 * Ganti isi fungsi ini dengan pengecekan sesi + peran di server (bukan di klien).
 */
export async function requireRole(_allowed: AdminRole[]): Promise<never> {
  void _allowed;
  notFound();
}
