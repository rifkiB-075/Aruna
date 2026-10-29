import type { EmbeddingProvider, LLMProvider } from "./types";
import { OpenAILLMAdapter } from "./providers/openai";
import { OpenAIEmbeddingAdapter } from "./providers/embedding";
import { getServerEnv } from "@/lib/config/env";

/**
 * AI Gateway: satu-satunya pintu ke provider model.
 * Modul fitur TIDAK boleh mengimpor SDK provider langsung (AGENTS A8).
 * Adapter ditaruh di ./providers/<nama>.ts dan dipilih lewat env AI_PROVIDER / EMBEDDING_PROVIDER.
 */

let _llm: LLMProvider | undefined;
let _embedder: EmbeddingProvider | undefined;

export function getLLM(): LLMProvider {
  if (!_llm) {
    const env = getServerEnv();
    const provider = env.AI_PROVIDER.toLowerCase();

    switch (provider) {
      case "openai":
      case "xai":
      case "openrouter":
        // OpenAI-compatible
        const baseURL = provider === "xai" ? "https://api.x.ai/v1" : undefined;
        _llm = new OpenAILLMAdapter(env.AI_API_KEY, env.AI_MODEL, baseURL);
        break;
      default:
        throw new Error(`Provider LLM tidak didukung: ${provider}`);
    }
  }
  return _llm;
}

export function getEmbedder(): EmbeddingProvider {
  if (!_embedder) {
    const env = getServerEnv();
    const provider = env.EMBEDDING_PROVIDER.toLowerCase();

    switch (provider) {
      case "openai":
      case "xai":
        const baseURL = provider === "xai" ? "https://api.x.ai/v1" : undefined;
        _embedder = new OpenAIEmbeddingAdapter(env.AI_API_KEY, env.EMBEDDING_MODEL, env.EMBEDDING_DIMENSIONS, baseURL);
        break;
      default:
        throw new Error(`Provider embedding tidak didukung: ${provider}`);
    }
  }
  return _embedder;
}
