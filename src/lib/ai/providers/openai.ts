import type { LLMProvider, GenerateInput, GenerateOutput, GenerateChunk } from "../types";
import { getServerEnv } from "@/lib/config/env";

/**
 * Adapter OpenAI-compatible: OpenAI, xAI, OpenRouter, dll.
 * ponytail: tambah retry logic, timeout, error handling production-grade.
 */
export class OpenAILLMAdapter implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey?: string, model?: string, baseURL?: string) {
    const env = getServerEnv();
    this.apiKey = apiKey ?? env.AI_API_KEY;
    this.model = model ?? env.AI_MODEL;
    // Default OpenAI; override untuk provider lain (xAI: https://api.x.ai/v1)
    this.baseURL = baseURL ?? "https://api.openai.com/v1";
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: `${input.context}\n\n${input.question}` },
        ],
        max_tokens: input.maxTokens ?? 1000,
        temperature: 0.3, // Konsisten untuk RAG
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LLM API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content ?? "",
      model: data.model,
    };
  }

  async *stream(input: GenerateInput): AsyncIterable<GenerateChunk> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: `${input.context}\n\n${input.question}` },
        ],
        max_tokens: input.maxTokens ?? 1000,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LLM stream error ${response.status}: ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices[0]?.delta?.content;
          if (delta) yield { delta };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
