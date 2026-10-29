import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER: z.string().min(1),
  AI_MODEL: z.string().min(1),
  AI_API_KEY: z.string().min(1),
  EMBEDDING_PROVIDER: z.string().min(1),
  EMBEDDING_MODEL: z.string().min(1),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive(),
  RAG_RELEVANCE_THRESHOLD: z.coerce.number().min(0).max(1),
  RAG_TOP_K: z.coerce.number().int().positive().default(5),
  OFFICIAL_CHANNEL_TEXT: z.string().min(1),
  OFFICIAL_CHANNEL_URL: z.string().url().optional(),
  CHAT_MAX_INPUT_CHARS: z.coerce.number().int().positive().default(1000),
  CHAT_RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(10),
  RETENTION_DAYS_CHAT_EVENTS: z.coerce.number().int().positive().default(90),
  QUOTA_ANON_PER_DAY: z.coerce.number().int().positive().default(5),
  QUOTA_USER_PER_DAY: z.coerce.number().int().positive().default(20),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

/** Satu-satunya tempat membaca process.env. Hanya untuk kode server. */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv tidak boleh dipanggil di klien");
  }
  if (!cached) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
      // Jangan cetak nilai env; hanya nama kolom yang bermasalah.
      const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Konfigurasi env tidak valid: ${keys}`);
    }
    cached = parsed.data;
  }
  return cached;
}
