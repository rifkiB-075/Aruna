import { scanAndRedact } from "@/lib/privacy";
import type { ChatStatus } from "@/types";

export interface ChatResult {
  status: ChatStatus;
  answer?: string;
  piiWarning: boolean;
}

/**
 * Orkestrasi RAG chatbot (docs/03-ARCHITECTURE.md 6.2). Kerangka: langkah 1 (PII) sudah ada;
 * langkah 2-9 (intent, retrieval, ambang, LLM, validasi, pencatatan) belum diimplementasikan.
 * Selama belum lengkap, selalu FALLBACK; jangan pernah menebak.
 */
export async function handleChat(question: string, _simpleLanguage = false): Promise<ChatResult> {
  const scan = scanAndRedact(question);
  // Hanya scan.redacted yang boleh diproses lebih lanjut. Isi mentah tidak dicatat.
  return { status: "fallback", piiWarning: scan.hasPii };
}

// Export modul chat baru
export { processChat } from "./orchestrator";
export type { ChatResponse, ChatStatus as ChatResponseStatus } from "./orchestrator";
