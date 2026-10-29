import { describe, it, expect, beforeEach } from "vitest";
import { MemoryQuotaStore } from "./store";
import { hashIpDaily } from "./hash";
import { getQuotaExhaustedMessage } from "./messages";

describe("quota module", () => {
  describe("hashIpDaily", () => {
    it("hash sama untuk IP sama di hari yang sama", () => {
      const h1 = hashIpDaily("127.0.0.1");
      const h2 = hashIpDaily("127.0.0.1");
      expect(h1).toBe(h2);
    });

    it("hash berbeda untuk IP berbeda", () => {
      const h1 = hashIpDaily("127.0.0.1");
      const h2 = hashIpDaily("192.168.1.1");
      expect(h1).not.toBe(h2);
    });

    it("menghasilkan hex string 64 karakter (sha256)", () => {
      const hash = hashIpDaily("127.0.0.1");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("MemoryQuotaStore", () => {
    let store: MemoryQuotaStore;

    beforeEach(() => {
      store = new MemoryQuotaStore(5, 20); // anon: 5, user: 20
    });

    it("allow konsumsi pertama", async () => {
      const result = await store.consume({ kind: "anonymous", key: "test-key-1" });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it("decrement remaining setiap konsumsi", async () => {
      await store.consume({ kind: "anonymous", key: "test-key-2" });
      await store.consume({ kind: "anonymous", key: "test-key-2" });
      const result = await store.consume({ kind: "anonymous", key: "test-key-2" });
      expect(result.remaining).toBe(2);
    });

    it("reject setelah limit tercapai", async () => {
      const key = "test-key-3";
      for (let i = 0; i < 5; i++) {
        await store.consume({ kind: "anonymous", key });
      }
      const result = await store.consume({ kind: "anonymous", key });
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("isolasi antar key", async () => {
      await store.consume({ kind: "anonymous", key: "key-a" });
      const result = await store.consume({ kind: "anonymous", key: "key-b" });
      expect(result.remaining).toBe(4);
    });

    it("kuota user lebih besar dari anonim", async () => {
      const r1 = await store.consume({ kind: "anonymous", key: "anon-1" });
      const r2 = await store.consume({ kind: "user", userId: "user-1" });
      expect(r1.limit).toBe(5);
      expect(r2.limit).toBe(20);
    });
  });

  describe("getQuotaExhaustedMessage", () => {
    it("pesan anonim menyarankan masuk", () => {
      const msg = getQuotaExhaustedMessage(false);
      expect(msg).toContain("Masuk untuk mendapat kuota lebih banyak");
    });

    it("pesan user tidak menyarankan masuk", () => {
      const msg = getQuotaExhaustedMessage(true);
      expect(msg).toContain("Coba lagi besok");
      expect(msg).not.toContain("Masuk");
    });
  });
});
