import { createClient } from "@/lib/supabase/server";
import { getCitizenAccount } from "@/modules/auth/citizen";
import { NextResponse } from "next/server";
import { getSessionMessages, getUserSessions } from "@/modules/chat/history";

/**
 * GET /api/chat/history?session_id=...
 * Load pesan dari session atau list semua session.
 */
export async function GET(request: Request) {
  const account = await getCitizenAccount();
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (sessionId) {
    // Load messages dari session
    const messages = await getSessionMessages(sessionId);
    return NextResponse.json({ messages });
  } else {
    // List semua session user
    const sessions = await getUserSessions(account.id);
    return NextResponse.json({ sessions });
  }
}

/**
 * DELETE /api/chat/history
 * Soft delete session atau hapus semua riwayat.
 */
export async function DELETE(request: Request) {
  const account = await getCitizenAccount();
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session_id } = await request.json();
  const supabase = await createClient();

  if (session_id) {
    // Soft delete session tertentu
    await supabase
      .from("chat_sessions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", session_id)
      .eq("account_id", account.id); // RLS double-check
  } else {
    // Hapus semua session (hard delete)
    await supabase
      .from("chat_sessions")
      .delete()
      .eq("account_id", account.id);
  }

  return NextResponse.json({ success: true });
}
