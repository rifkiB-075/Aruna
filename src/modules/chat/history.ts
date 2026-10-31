import { createClient } from "@/lib/supabase/server";
import { scanAndRedact } from "@/lib/privacy";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  account_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Simpan pesan user dan assistant ke riwayat (hanya bila lolos PII scan).
 * User message harus sudah lewat scanAndRedact() sebelum dipanggil.
 */
export async function saveMessages(
  sessionId: string,
  accountId: string,
  userMessage: string,
  assistantMessage: string,
  metadata?: { citations?: unknown[]; model?: string }
): Promise<void> {
  const supabase = await createClient();

  // Scan user message (double-check)
  const scanResult = scanAndRedact(userMessage);
  
  if (!scanResult.safeToStore) {
    // Jangan simpan bila ada PII atau ragu
    return;
  }

  const messages = [
    {
      session_id: sessionId,
      account_id: accountId,
      role: "user" as const,
      content: scanResult.redacted, // gunakan versi redacted
      metadata: {},
    },
    {
      session_id: sessionId,
      account_id: accountId,
      role: "assistant" as const,
      content: assistantMessage,
      metadata: metadata || {},
    },
  ];

  await supabase.from("chat_messages").insert(messages);

  // Update session.updated_at
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

/**
 * Load riwayat pesan dari session (RLS enforce: hanya milik user).
 */
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ChatMessage[];
}

/**
 * Buat session baru untuk user.
 */
export async function createSession(accountId: string, title?: string): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ account_id: accountId, title })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Gagal membuat session");
  }

  return data.id;
}

/**
 * List session milik user (RLS enforce).
 */
export async function getUserSessions(accountId: string): Promise<ChatSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("account_id", accountId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ChatSession[];
}

/**
 * Soft delete session (set deleted_at).
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("chat_sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sessionId);
}
