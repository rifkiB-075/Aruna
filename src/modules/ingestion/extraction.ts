/**
 * Ekstraksi teks dari berkas upload.
 * ponytail: tambah support .docx (mammoth/docx-parser), OCR untuk PDF image-based.
 */

export interface ExtractedText {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
  };
}

/**
 * Ekstraksi teks dari PDF sederhana (text-based).
 * MVP: placeholder, return dummy. Implementasi real: pdf-parse atau Supabase Edge Function.
 */
export async function extractFromPDF(_buffer: ArrayBuffer): Promise<ExtractedText> {
  // ponytail: gunakan pdf-parse atau serverless function
  const text = "[PDF extraction placeholder - implement with pdf-parse]";
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  };
}

/**
 * Ekstraksi dari plain text atau markdown.
 */
export async function extractFromText(buffer: ArrayBuffer): Promise<ExtractedText> {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(buffer);
  
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  };
}

/**
 * Router ekstraksi berdasarkan MIME type.
 */
export async function extractText(file: File): Promise<ExtractedText> {
  const buffer = await file.arrayBuffer();

  switch (file.type) {
    case "application/pdf":
      return extractFromPDF(buffer);
    case "text/plain":
    case "text/markdown":
      return extractFromText(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      // ponytail: implement .docx extraction
      throw new Error("DOCX extraction belum diimplementasikan");
    default:
      throw new Error(`Tipe file tidak didukung: ${file.type}`);
  }
}
