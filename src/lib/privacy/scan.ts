/**
 * Deteksi dan penyamaran PII. Fungsi murni, tanpa efek samping, tanpa logging isi input.
 * Prinsip: fail-closed dan recall-first (lebih baik terlalu banyak menyamarkan).
 * Lihat docs/05-SECURITY.md bagian 5.
 *
 * Catatan: posisi pada PiiFinding dan teks redacted mengacu pada teks yang
 * sudah dinormalisasi (NFKC), bukan teks asli.
 */
export type PiiKind = "NIK" | "KK" | "TELEPON" | "EMAIL" | "REKENING" | "LAINNYA";

export interface PiiFinding {
  kind: PiiKind;
  start: number;
  end: number;
  confidence: "high" | "medium";
}

export interface ScanResult {
  findings: PiiFinding[];
  redacted: string;
  hasPii: boolean;
  /** false bila PII terdeteksi atau ragu. */
  safeToStore: boolean;
}

const TOKEN: Record<PiiKind, string> = {
  NIK: "[NIK_ATAU_KK]",
  KK: "[NIK_ATAU_KK]",
  TELEPON: "[TELEPON]",
  EMAIL: "[EMAIL]",
  REKENING: "[REKENING]",
  LAINNYA: "[DATA_PRIBADI]",
};

// Deret digit dengan pemisah opsional (spasi, titik, tanda hubung).
const DIGIT_RUN = /\d(?:[\s.\-]?\d){9,}/g;
const PHONE = /(?:\+62|62|0)[\s.\-]?8\d(?:[\s.\-]?\d){7,11}/g;
const EMAIL = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const ACCOUNT_KEYWORD = /(rekening|no\.?\s*rek|norek)/i;
const CONTEXT_KEYWORD = /\b(nik|kk|nomor|no\.?|hp|telp|telepon|wa)\b/i;

function digitsOf(s: string): string {
  return s.replace(/\D/g, "");
}

function hasNikStructure(d: string): boolean {
  if (d.length !== 16) return false;
  const day = Number(d.slice(6, 8));
  const month = Number(d.slice(8, 10));
  const realDay = day > 40 ? day - 40 : day;
  return realDay >= 1 && realDay <= 31 && month >= 1 && month <= 12;
}

export function scanAndRedact(input: string): ScanResult {
  const text = input.normalize("NFKC");
  const found: PiiFinding[] = [];

  for (const m of text.matchAll(EMAIL)) {
    found.push({ kind: "EMAIL", start: m.index, end: m.index + m[0].length, confidence: "high" });
  }
  for (const m of text.matchAll(PHONE)) {
    found.push({ kind: "TELEPON", start: m.index, end: m.index + m[0].length, confidence: "high" });
  }
  for (const m of text.matchAll(DIGIT_RUN)) {
    const d = digitsOf(m[0]);
    const start = m.index;
    const end = start + m[0].length;
    const nearby = text.slice(Math.max(0, start - 20), start);
    const hasContext = CONTEXT_KEYWORD.test(nearby);
    if (d.length === 16) {
      // 16 digit tetap disamarkan walau struktur tidak valid (recall-first).
      found.push({
        kind: "NIK",
        start,
        end,
        confidence: hasNikStructure(d) || hasContext ? "high" : "medium",
      });
    } else if (ACCOUNT_KEYWORD.test(nearby)) {
      found.push({ kind: "REKENING", start, end, confidence: "high" });
    } else {
      found.push({ kind: "LAINNYA", start, end, confidence: "medium" });
    }
  }

  // Buang tumpang tindih: pertahankan temuan yang mulai lebih awal, lalu yang lebih panjang.
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const findings: PiiFinding[] = [];
  for (const f of found) {
    const last = findings[findings.length - 1];
    if (!last || f.start >= last.end) findings.push(f);
  }

  let redacted = "";
  let cursor = 0;
  for (const f of findings) {
    redacted += text.slice(cursor, f.start) + TOKEN[f.kind];
    cursor = f.end;
  }
  redacted += text.slice(cursor);

  const hasPii = findings.length > 0;
  return { findings, redacted, hasPii, safeToStore: !hasPii };
}
