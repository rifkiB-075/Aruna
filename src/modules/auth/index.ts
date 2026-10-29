import { notFound, redirect } from "next/navigation";
import type { AdminRole } from "@/types";
import { createClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email?: string;
  role: AdminRole;
}

/**
 * Get current authenticated user + role dari profiles.
 * Return null bila tidak autentikasi atau tidak punya role (bukan admin).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ambil role dari profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email,
    role: profile.role as AdminRole,
  };
}

/**
 * Require authenticated admin dengan role tertentu.
 * Fail-closed: redirect ke /login bila tidak autentikasi, notFound bila role tidak cocok.
 * ponytail: custom error page, audit log login attempt.
 */
export async function requireRole(allowed: AdminRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    // Tidak autentikasi → redirect ke login
    redirect("/login");
  }

  if (!allowed.includes(user.role)) {
    // Role tidak diizinkan → 404 (fail-closed, tidak expose info)
    notFound();
  }

  return user;
}

/**
 * Check apakah user punya salah satu role.
 */
export async function hasRole(allowed: AdminRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && allowed.includes(user.role);
}
