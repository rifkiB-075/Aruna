import { createClient } from "@/lib/supabase/server";

export interface CitizenAccount {
  id: string;
  email: string;
  created_at: string;
  last_active_at: string | null;
}

/**
 * Get akun warga (citizen) yang sedang login.
 * Return null bila tidak login atau user adalah admin.
 */
export async function getCitizenAccount(): Promise<CitizenAccount | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Pastikan bukan admin (admin punya profile)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profile) return null; // ini admin, bukan warga

  // Ambil citizen_account
  const { data: account } = await supabase
    .from("citizen_accounts")
    .select("*")
    .eq("id", user.id)
    .single();

  return account;
}

/**
 * Check apakah user saat ini adalah warga (bukan admin, bukan anonim).
 */
export async function isCitizen(): Promise<boolean> {
  const account = await getCitizenAccount();
  return account !== null;
}

/**
 * Update last_active_at untuk tracking aktivitas.
 */
export async function updateLastActive(accountId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("citizen_accounts")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", accountId);
}
