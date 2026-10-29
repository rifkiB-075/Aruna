import type { SupabaseClient } from "@supabase/supabase-js";
import { validateFile, type UploadInput } from "./validation";
import { extractText } from "./extraction";
import { chunkText } from "./chunking";
import { getEmbedder } from "@/lib/ai/gateway";
import { scanAndRedact } from "@/lib/privacy";

/**
 * Status pemrosesan ingestion.
 */
export type IngestionStatus =
  | "pending"
  | "extracting"
  | "chunking"
  | "embedding"
  | "completed"
  | "failed";

export interface IngestionResult {
  sourceId?: string;
  status: IngestionStatus;
  chunkCount: number;
  error?: string;
}

/**
 * Pipeline ingestion lengkap: validasi → ekstraksi → chunking → embedding → simpan.
 * ponytail: background job dengan progress tracking, retry logic, parallel processing.
 */
export async function ingestDocument(
  supabase: SupabaseClient,
  input: UploadInput,
  uploadedBy: string
): Promise<IngestionResult> {
  let sourceId: string | undefined;
  let status: IngestionStatus = "pending";

  try {
    // 1. Validasi file
    const validation = validateFile(input.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Buat record source (status draft, not active)
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        service_type_id: input.serviceTypeId,
        title: input.title,
        file_path: `uploads/${input.serviceTypeId}/${Date.now()}_${input.file.name}`,
        effective_date: input.effectiveDate,
        document_number: input.documentNumber,
        document_date: input.documentDate,
        status: "draft",
        uploaded_by: uploadedBy,
      })
      .select("id")
      .single();

    if (sourceError || !source) {
      throw new Error(`Gagal membuat record source: ${sourceError?.message}`);
    }

    sourceId = source.id;
    status = "extracting";

    // 3. Ekstraksi teks
    const extracted = await extractText(input.file);

    // 4. Scan PII (warning, tidak blokir ingestion untuk dokumen admin)
    const piiScan = scanAndRedact(extracted.text);
    if (piiScan.findings.length > 0) {
      console.warn(`PII terdeteksi di source ${sourceId}: ${piiScan.findings.map(f => f.kind).join(", ")}`);
    }

    status = "chunking";

    // 5. Chunking
    const chunks = chunkText(extracted.text, { chunkSize: 1000, overlap: 200 });

    if (chunks.length === 0) {
      throw new Error("Tidak ada chunk dihasilkan (dokumen kosong?)");
    }

    status = "embedding";

    // 6. Embedding batch
    const embedder = getEmbedder();
    const texts = chunks.map((c) => c.content);
    const embeddings = await embedder.embed(texts);

    // 7. Simpan chunks ke DB
    const chunkRecords = chunks.map((chunk, idx) => ({
      source_id: sourceId,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[idx]), // pgvector expects array, convert via RPC or raw SQL
      token_count: chunk.tokenCount,
      section_ref: chunk.sectionRef,
      page_ref: chunk.pageRef,
    }));

    const { error: chunkError } = await supabase.from("source_chunks").insert(chunkRecords);

    if (chunkError) {
      throw new Error(`Gagal menyimpan chunks: ${chunkError.message}`);
    }

    status = "completed";

    return {
      sourceId,
      status,
      chunkCount: chunks.length,
    };
  } catch (error) {
    status = "failed";

    // Update source status ke failed bila sudah dibuat
    if (sourceId) {
      await supabase
        .from("sources")
        .update({ status: "draft" }) // tetap draft, admin bisa retry manual
        .eq("id", sourceId);
    }

    return {
      sourceId: sourceId ?? undefined,
      status,
      chunkCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
