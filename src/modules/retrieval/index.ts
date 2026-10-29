import type { SupabaseClient } from "@supabase/supabase-js";
import { getEmbedder } from "@/lib/ai/gateway";
import { getServerEnv } from "@/lib/config/env";

/**
 * Retrieval: filter sumber aktif + berlaku, ambang relevansi.
 * RPC match_chunks sudah filter status=active, effective_date, review_due_date (0001_init.sql).
 */

export interface RetrievalChunk {
  id: string;
  sourceId: string;
  content: string;
  sectionRef?: string;
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievalChunk[];
  sourceIds: string[];
}

/**
 * Retrieve chunks relevan untuk query.
 * Filter: status=active, effective_date <= today, review_due_date >= today (atau null).
 * Ambang: RAG_RELEVANCE_THRESHOLD dari env.
 */
export async function retrieveChunks(
  supabase: SupabaseClient,
  query: string
): Promise<RetrievalResult> {
  const env = getServerEnv();
  const embedder = getEmbedder();

  // 1. Embed query
  const [queryEmbedding] = await embedder.embed([query]);

  // 2. Call RPC match_chunks (sudah filter aktif + berlaku)
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: env.RAG_TOP_K,
    min_score: env.RAG_RELEVANCE_THRESHOLD,
  });

  if (error) {
    console.error("Retrieval error:", error);
    return { chunks: [], sourceIds: [] };
  }

  if (!data || data.length === 0) {
    return { chunks: [], sourceIds: [] };
  }

  // 3. Map hasil
  const chunks: RetrievalChunk[] = data.map((row: {
    id: string;
    source_id: string;
    content: string;
    section_ref?: string;
    score: number;
  }) => ({
    id: row.id,
    sourceId: row.source_id,
    content: row.content,
    sectionRef: row.section_ref,
    score: row.score,
  }));

  const sourceIds = [...new Set(chunks.map((c) => c.sourceId))];

  return { chunks, sourceIds };
}

/**
 * Build konteks untuk LLM dari chunks.
 */
export function buildContext(chunks: RetrievalChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((chunk, idx) => {
      const ref = chunk.sectionRef ? ` [${chunk.sectionRef}]` : "";
      return `[${idx + 1}]${ref} ${chunk.content}`;
    })
    .join("\n\n");
}
