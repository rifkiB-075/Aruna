"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface ReportButtonProps {
  chatEventId?: string;
  onSubmit?: (reason: string) => Promise<void>;
}

/**
 * Tombol laporan jawaban keliru dengan form sederhana.
 * ponytail: modal dialog, PII scan sebelum submit, toast notification.
 */
export function ReportButton({ chatEventId, onSubmit }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(reason);
      setReason("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <AlertCircle className="h-3 w-3" />
        Laporkan jika keliru
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
        Apa yang keliru?
      </label>
      <textarea
        id="reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        rows={3}
        placeholder="Jelaskan apa yang keliru dari jawaban ini..."
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !reason.trim()}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
