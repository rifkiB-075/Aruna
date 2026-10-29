/**
 * Modul ingestion: validasi, ekstraksi, chunking, embedding, status pemrosesan.
 * ponytail: background job queue, progress tracking, retry logic.
 */
export { validateFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "./validation";
export type { UploadInput, ValidationResult } from "./validation";
export { extractText, extractFromPDF, extractFromText } from "./extraction";
export type { ExtractedText } from "./extraction";
export { chunkText, chunkBySentences } from "./chunking";
export type { Chunk, ChunkingOptions } from "./chunking";
export { ingestDocument } from "./pipeline";
export type { IngestionResult, IngestionStatus } from "./pipeline";
