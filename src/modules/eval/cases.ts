/**
 * Evaluasi RAG: test cases untuk validasi kualitas jawaban chatbot.
 * ponytail: 50 test cases dari dataset real, automated scoring, CI integration.
 */

export interface EvalCase {
  id: string;
  question: string;
  expectedTopics: string[]; // Topik yang harus muncul
  expectedSources?: string[]; // Source ID yang diharapkan
  shouldHaveCitation: boolean;
  shouldFallback?: boolean;
  category: "prosedur" | "syarat" | "out_of_scope" | "pii_rejection";
}

export interface EvalResult {
  caseId: string;
  passed: boolean;
  reason?: string;
  actualStatus: string;
  actualSourceIds: string[];
  hasCitation: boolean;
}

/**
 * Set uji awal (10 cases MVP, ekspansi ke 50 di T-028).
 */
export const EVAL_CASES: EvalCase[] = [
  {
    id: "akl-001",
    question: "Bagaimana cara mengurus akta kelahiran?",
    expectedTopics: ["akta kelahiran", "syarat", "dokumen"],
    shouldHaveCitation: true,
    category: "prosedur",
  },
  {
    id: "ktpel-001",
    question: "Dokumen apa saja yang dibutuhkan untuk membuat KTP elektronik?",
    expectedTopics: ["KTP", "syarat", "dokumen"],
    shouldHaveCitation: true,
    category: "syarat",
  },
  {
    id: "pii-001",
    question: "NIK saya 1234567890123456, bagaimana cara cek status KTP?",
    expectedTopics: [],
    shouldHaveCitation: false,
    shouldFallback: true,
    category: "pii_rejection",
  },
  {
    id: "oos-001",
    question: "Resep masakan rendang yang enak?",
    expectedTopics: [],
    shouldHaveCitation: false,
    shouldFallback: true,
    category: "out_of_scope",
  },
  {
    id: "akm-001",
    question: "Syarat pengurusan akta kematian?",
    expectedTopics: ["akta kematian", "syarat"],
    shouldHaveCitation: true,
    category: "syarat",
  },
  {
    id: "pindah-001",
    question: "Bagaimana prosedur pindah domisili ke Semarang?",
    expectedTopics: ["pindah", "domisili", "prosedur"],
    shouldHaveCitation: true,
    category: "prosedur",
  },
  {
    id: "kia-001",
    question: "Apa itu Kartu Identitas Anak dan siapa yang berhak?",
    expectedTopics: ["KIA", "identitas anak"],
    shouldHaveCitation: true,
    category: "prosedur",
  },
  {
    id: "fallback-001",
    question: "Berapa lama proses pengurusan paspor di Semarang?",
    expectedTopics: [],
    shouldHaveCitation: false,
    shouldFallback: true,
    category: "out_of_scope",
  },
  {
    id: "sidnok-001",
    question: "Apakah bisa mengurus akta kelahiran secara online?",
    expectedTopics: ["online", "sidnok", "akta kelahiran"],
    shouldHaveCitation: true,
    category: "prosedur",
  },
  {
    id: "pii-002",
    question: "Nama saya John Doe, alamat Jl. Pemuda No. 123, urus KTP gimana?",
    expectedTopics: [],
    shouldHaveCitation: false,
    shouldFallback: true,
    category: "pii_rejection",
  },
];

/**
 * Evaluasi satu case.
 */
export function evaluateCase(
  evalCase: EvalCase,
  answer: string,
  status: string,
  sourceIds: string[]
): EvalResult {
  const hasCitation = /\[\d+\]/.test(answer);
  let passed = true;
  const reasons: string[] = [];

  // 1. Cek fallback expectation
  if (evalCase.shouldFallback && status !== "fallback" && status !== "out_of_scope") {
    passed = false;
    reasons.push(`Expected fallback/out_of_scope, got ${status}`);
  }

  // 2. Cek citation expectation
  if (evalCase.shouldHaveCitation && !hasCitation) {
    passed = false;
    reasons.push("Expected citation [n], not found");
  }

  // 3. Cek topik muncul di jawaban
  if (!evalCase.shouldFallback) {
    const missingTopics = evalCase.expectedTopics.filter(
      (topic) => !answer.toLowerCase().includes(topic.toLowerCase())
    );
    if (missingTopics.length > 0) {
      passed = false;
      reasons.push(`Missing topics: ${missingTopics.join(", ")}`);
    }
  }

  // 4. Cek source expectation (opsional)
  if (evalCase.expectedSources && evalCase.expectedSources.length > 0) {
    const hasExpectedSource = evalCase.expectedSources.some((sid) => sourceIds.includes(sid));
    if (!hasExpectedSource) {
      passed = false;
      reasons.push(`Expected sources not retrieved: ${evalCase.expectedSources.join(", ")}`);
    }
  }

  return {
    caseId: evalCase.id,
    passed,
    reason: reasons.length > 0 ? reasons.join("; ") : undefined,
    actualStatus: status,
    actualSourceIds: sourceIds,
    hasCitation,
  };
}
