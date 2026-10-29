/**
 * Chunking: potong dokumen menjadi chunk untuk embedding dan retrieval.
 * Strategi: overlap untuk preservasi konteks di batas chunk.
 */

export interface Chunk {
  content: string;
  sectionRef?: string;
  pageRef?: number;
  tokenCount: number;
}

export interface ChunkingOptions {
  chunkSize: number; // karakter per chunk
  overlap: number; // karakter overlap
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;

/**
 * Estimasi token count (rough: 1 token ≈ 4 karakter untuk bahasa Indonesia/Indonesia).
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split teks menjadi chunks dengan overlap.
 * Simple sliding window; ponytail: semantic chunking (split by paragraf/section).
 */
export function chunkText(
  text: string,
  options: Partial<ChunkingOptions> = {}
): Chunk[] {
  const { chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP } = options;

  if (text.length <= chunkSize) {
    return [
      {
        content: text,
        tokenCount: estimateTokens(text),
      },
    ];
  }

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end);

    chunks.push({
      content,
      tokenCount: estimateTokens(content),
    });

    // Sliding window dengan overlap
    if (end >= text.length) break;
    start = end - overlap;
  }

  return chunks;
}

/**
 * Chunking dengan deteksi boundary (paragraf/kalimat).
 * ponytail: improve dengan langchain RecursiveCharacterTextSplitter atau semantic chunker.
 */
export function chunkBySentences(
  text: string,
  maxChunkSize = DEFAULT_CHUNK_SIZE
): Chunk[] {
  // Split by double newline (paragraf) atau titik + spasi
  const sentences = text.split(/(?:\.\s+|\n\n)/);
  const chunks: Chunk[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkSize) {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    } else {
      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          tokenCount: estimateTokens(currentChunk),
        });
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      tokenCount: estimateTokens(currentChunk),
    });
  }

  return chunks;
}
