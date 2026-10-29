import type { EmbeddingProvider } from "../types";
import { getServerEnv } from "@/lib/config/env";

/**
 * Adapter OpenAI-compatible embedding: OpenAI, xAI, dll.
 * ponytail: batch processing untuk text > 100 items, retry logic.
 */
export class OpenAIEmbeddingAdapter implements EmbeddingProvider {
  private apiKey: string;
  readonly model: string;
  readonly dimensions: number;
  private baseURL: string;

  constructor(apiKey?: string, model?: string, dimensions?: number, baseURL?: string) {
    const env = getServerEnv();
    this.apiKey = apiKey ?? env.AI_API_KEY;
    this.model = model ?? env.EMBEDDING_MODEL;
    this.dimensions = dimensions ?? env.EMBEDDING_DIMENSIONS;
    this.baseURL = baseURL ?? "https://api.openai.com/v1";
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  }
}
