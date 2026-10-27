import type { EmbeddingProvider, LLMProvider } from "./types";

/**
 * AI Gateway: satu-satunya pintu ke provider model.
 * Modul fitur TIDAK boleh mengimpor SDK provider langsung (AGENTS A8).
 * Adapter ditaruh di ./providers/<nama>.ts dan dipilih lewat env AI_PROVIDER / EMBEDDING_PROVIDER.
 */
export function getLLM(): LLMProvider {
  throw new Error("Belum ada adapter LLM. Implementasikan di src/lib/ai/providers dan daftarkan di sini.");
}

export function getEmbedder(): EmbeddingProvider {
  throw new Error("Belum ada adapter embedding. Implementasikan di src/lib/ai/providers dan daftarkan di sini.");
}
