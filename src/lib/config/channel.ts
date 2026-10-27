import { z } from "zod";

const schema = z.object({
  OFFICIAL_CHANNEL_TEXT: z.string().trim().min(1).optional(),
  OFFICIAL_CHANNEL_URL: z.string().url().optional(),
});

/** Kanal resmi untuk fallback. Dibaca dari konfigurasi, bukan dari pengetahuan model. */
export function getOfficialChannel(): { text: string; url?: string } {
  const parsed = schema.safeParse(process.env);
  const text = parsed.success && parsed.data.OFFICIAL_CHANNEL_TEXT ? parsed.data.OFFICIAL_CHANNEL_TEXT : "kanal resmi Disdukcapil Kota Semarang";
  return { text, url: parsed.success ? parsed.data.OFFICIAL_CHANNEL_URL : undefined };
}
