import { createClient } from "@/lib/supabase/server";
import { getCitizenAccount } from "@/modules/auth/citizen";
import { NextResponse } from "next/server";

/**
 * DELETE /api/account
 * Hapus akun warga (cascade ke semua riwayat).
 */
export async function DELETE() {
  const account = await getCitizenAccount();
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Hapus citizen_account (cascade ke usage_counters, chat_sessions, chat_messages)
  const { error } = await supabase
    .from("citizen_accounts")
    .delete()
    .eq("id", account.id);

  if (error) {
    return NextResponse.json(
      { error: "Gagal menghapus akun" },
      { status: 500 }
    );
  }

  // Hapus dari auth.users (butuh service_role)
  // ponytail: call edge function atau admin API
  // await supabaseAdmin.auth.admin.deleteUser(account.id);

  // Logout
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
