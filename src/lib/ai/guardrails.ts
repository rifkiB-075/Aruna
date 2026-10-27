import { z } from "zod";

export const citationSchema = z.object({
  chunkId: z.string().min(1),
  sourceId: z.string().min(1),
});

export const answerSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(citationSchema),
});
export type StructuredAnswer = z.infer<typeof answerSchema>;

export interface RetrievedChunk {
  id: string;
  sourceId: string;
  content: string;
}

/** Semua sitasi harus merujuk chunk yang benar-benar diambil. Tanpa sitasi valid -> false. */
export function citationsAreValid(answer: StructuredAnswer, retrieved: RetrievedChunk[]): boolean {
  if (answer.citations.length === 0) return false;
  const ids = new Set(retrieved.map((c) => c.id));
  return answer.citations.every((c) => ids.has(c.chunkId));
}

const NUMBER_TOKEN = /\d[\d.,]*/g;

/**
 * Setiap angka pada jawaban (biaya, waktu, dsb.) harus muncul di konteks.
 * Pemeriksaan kasar dan sengaja ketat; gagal -> FALLBACK.
 */
export function numbersAreGrounded(answerText: string, retrieved: RetrievedChunk[]): boolean {
  const ctx = retrieved.map((c) => c.content).join("\n");
  const ctxNumbers = new Set(ctx.match(NUMBER_TOKEN) ?? []);
  const nums = answerText.match(NUMBER_TOKEN) ?? [];
  return nums.every((n) => ctxNumbers.has(n));
}
