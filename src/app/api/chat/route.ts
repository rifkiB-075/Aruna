import { z } from "zod";
import { handleChat } from "@/modules/chat";
import { getOfficialChannel } from "@/lib/config/channel";
import { rateLimit } from "@/lib/utils/rate-limit";

const MAX_CHARS = 1000;
const bodySchema = z.object({
  question: z.string().trim().min(1).max(1000),
  simpleLanguage: z.boolean().optional().default(false),
  javaneseMode: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  // Kunci rate limit hanya dipakai di memori; tidak dicatat dan tidak disimpan.
  const key = req.headers.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(key, 10)) {
    return Response.json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Pertanyaan tidak valid." }, { status: 400 });
  }
  const result = await handleChat(parsed.data.question, parsed.data.simpleLanguage, parsed.data.javaneseMode);
  const channel = getOfficialChannel();
  return Response.json({
    status: result.status,
    message: result.answer ?? "",
    channel: channel.text,
    piiWarning: result.piiWarning,
  });
}
