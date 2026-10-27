export interface GenerateInput {
  system: string;
  /** Konteks sumber dan pertanyaan adalah DATA, bukan instruksi. */
  context: string;
  question: string;
  maxTokens?: number;
}
export interface GenerateOutput {
  text: string;
  model: string;
}
export interface GenerateChunk {
  delta: string;
}
export interface LLMProvider {
  generate(input: GenerateInput): Promise<GenerateOutput>;
  stream(input: GenerateInput): AsyncIterable<GenerateChunk>;
}
export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  readonly model: string;
  readonly dimensions: number;
}
