# Adapter provider

Satu file per provider (mis. anthropic.ts, openai.ts, google.ts, openai-compatible.ts).
Setiap adapter mengimplementasikan LLMProvider dan/atau EmbeddingProvider dari ../types.
Fitur wajib per adapter: timeout, retry terbatas, batas token. Jangan hardcode nama model.
