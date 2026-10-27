/**
 * Kuota chat. Antarmuka sama untuk anonim (MVP) dan akun (fase 2) agar menambah akun tidak merombak.
 * Kunci anonim: hash(IP + garam harian), kedaluwarsa 24 jam. Tanpa cookie pelacak dan tanpa fingerprint.
 */
export type QuotaSubject =
  | { kind: "anonymous"; key: string }
  | { kind: "user"; userId: string };

export interface QuotaDecision {
  allowed: boolean;
  remaining: number;
  limit: number;
}

export interface QuotaStore {
  consume(subject: QuotaSubject): Promise<QuotaDecision>;
}
