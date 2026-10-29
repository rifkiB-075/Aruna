import { z } from "zod";

/**
 * Validasi berkas upload untuk ingestion.
 * AGENTS A6: whitelist tipe, batas ukuran, bucket privat.
 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  "text/markdown",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadSchema = z.object({
  file: z.instanceof(File),
  serviceTypeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documentNumber: z.string().optional(),
  documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type UploadInput = z.infer<typeof uploadSchema>;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  const allowedTypes: readonly string[] = ALLOWED_MIME_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipe file tidak didukung: ${file.type}` };
  }

  return { valid: true };
}
