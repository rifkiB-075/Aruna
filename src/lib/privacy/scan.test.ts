import { describe, expect, it } from "vitest";
import { scanAndRedact } from "./scan";

// Semua data di bawah ini SINTETIS dan jelas fiktif.
describe("scanAndRedact", () => {
  it("menyamarkan 16 digit polos", () => {
    const r = scanAndRedact("NIK saya 0000000000000000 tolong cek");
    expect(r.hasPii).toBe(true);
    expect(r.redacted).not.toContain("0000000000000000");
    expect(r.safeToStore).toBe(false);
  });

  it("menyamarkan 16 digit meski struktur tidak valid (recall-first)", () => {
    const r = scanAndRedact("9999999999999999");
    expect(r.hasPii).toBe(true);
    expect(r.findings[0]?.confidence).toBe("medium");
  });

  it("menangkap variasi pemisah", () => {
    for (const s of ["0000 0000 0000 0000", "0000-0000-0000-0000", "0000.0000.0000.0000"]) {
      expect(scanAndRedact(s).hasPii).toBe(true);
    }
  });

  it("menangkap digit lebar-penuh (Unicode)", () => {
    expect(scanAndRedact("０００００００００００００００").hasPii).toBe(true);
  });

  it("menyamarkan telepon dan email", () => {
    const r = scanAndRedact("hubungi 08000000000 atau contoh@example.test");
    expect(r.redacted).toContain("[TELEPON]");
    expect(r.redacted).toContain("[EMAIL]");
  });

  it("tidak mengubah teks tanpa PII", () => {
    const r = scanAndRedact("Apa syarat membuat KTP-el baru?");
    expect(r.hasPii).toBe(false);
    expect(r.safeToStore).toBe(true);
    expect(r.redacted).toBe("Apa syarat membuat KTP-el baru?");
  });
});
