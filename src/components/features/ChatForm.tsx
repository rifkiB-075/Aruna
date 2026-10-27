"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PiiWarning } from "./PiiWarning";
import { FallbackNotice } from "./FallbackNotice";

interface ChatResponse {
  status: "answered" | "fallback" | "out_of_scope";
  message: string;
  channel: string;
  piiWarning: boolean;
}

export function ChatForm() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("gagal");
      setResult((await res.json()) as ChatResponse);
    } catch {
      setError("Layanan tanya jawab sedang terganggu. Silakan coba lagi nanti atau baca Panduan Layanan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body text-neutral-700">Jawaban dari asisten AI berdasarkan sumber resmi. Jangan tulis NIK atau data pribadi.</p>
      <div>
        <label htmlFor="question" className="mb-2 block text-body-lg font-semibold">Pertanyaan Anda</label>
        <textarea
          id="question"
          aria-describedby="pii-warning"
          className="min-h-32 w-full rounded-md border border-neutral-700 p-3 text-body-lg"
          maxLength={1000}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <PiiWarning id="pii-warning" />
      </div>
      <Button onClick={submit} disabled={loading || question.trim().length === 0}>
        {loading ? "Memproses..." : "Tanya asisten"}
      </Button>
      <div aria-live="polite">
        {error && <p className="text-danger-700">{error}</p>}
        {result?.piiWarning && <p className="text-warning-700">Pesan Anda tampak berisi data pribadi. Kami tidak memprosesnya dan tidak menyimpannya.</p>}
        {result?.status === "fallback" && <FallbackNotice channel={result.channel} />}
      </div>
    </div>
  );
}
