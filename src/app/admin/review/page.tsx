'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ContentDraft {
  id: string;
  content_type: string;
  title: string;
  content: unknown;
  source_reference: string | null;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

export default function ContentReview() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  async function loadDrafts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content-review');
      if (!res.ok) throw new Error('Failed to load drafts');
      const data = (await res.json()) as { drafts: ContentDraft[] };
      setDrafts(data.drafts);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!selectedDraft) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/content-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: selectedDraft.id,
          action,
          note: reviewNote.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to review content');
      setSelectedDraft(null);
      setReviewNote('');
      await loadDrafts();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-body">Memuat...</p>;
  if (error) return <p className="text-danger-700">{error}</p>;

  const draftOnly = drafts.filter((d) => d.status === 'draft');
  const reviewed = drafts.filter((d) => d.status !== 'draft');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold">Review Konten AI</h1>
        <p className="mt-2 text-body text-neutral-600">
          Konten buatan AI (FAQ, quiz, summary) berstatus draf sampai disetujui.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Menunggu Review ({draftOnly.length})</h2>
        {draftOnly.length === 0 ? (
          <p className="text-body text-neutral-600">Tidak ada draft baru</p>
        ) : (
          <ul className="space-y-3">
            {draftOnly.map((draft) => (
              <li key={draft.id}>
                <button
                  onClick={() => setSelectedDraft(draft)}
                  className="block w-full cursor-pointer rounded-md border border-neutral-200 bg-surface p-4 text-left hover:border-primary-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-primary-700">{draft.title}</p>
                      <p className="text-body-sm text-neutral-600">
                        Tipe: {draft.content_type} • {new Date(draft.created_at).toLocaleDateString('id-ID')}
                      </p>
                      {draft.source_reference && (
                        <p className="text-body-sm text-neutral-500">Sumber: {draft.source_reference}</p>
                      )}
                    </div>
                    <span className="rounded-md bg-primary-700 px-3 py-1 text-body-sm text-white">Tinjau</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Riwayat Review ({reviewed.length})</h2>
        {reviewed.length === 0 ? (
          <p className="text-body text-neutral-600">Belum ada yang direview</p>
        ) : (
          <ul className="space-y-3">
            {reviewed.slice(0, 10).map((draft) => (
              <li key={draft.id} className="rounded-md border border-neutral-200 bg-surface p-3">
                <p className="font-semibold">{draft.title}</p>
                <p className="text-body-sm text-neutral-600">
                  Status:{' '}
                  <span
                    className={
                      draft.status === 'approved' ? 'text-success-700 font-semibold' : 'text-danger-700 font-semibold'
                    }
                  >
                    {draft.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                  {draft.reviewed_at && ` • ${new Date(draft.reviewed_at).toLocaleDateString('id-ID')}`}
                </p>
                {draft.review_note && <p className="mt-1 text-body-sm text-neutral-700">Catatan: {draft.review_note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-surface p-6">
            <div>
              <h2 className="text-h2 font-bold">{selectedDraft.title}</h2>
              <p className="text-body-sm text-neutral-600">
                Tipe: {selectedDraft.content_type} • {new Date(selectedDraft.created_at).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="mb-2 font-semibold">Konten:</h3>
              <pre className="whitespace-pre-wrap text-body-sm">{JSON.stringify(selectedDraft.content, null, 2)}</pre>
            </div>

            {selectedDraft.source_reference && (
              <div className="text-body-sm text-neutral-600">
                <strong>Referensi sumber:</strong> {selectedDraft.source_reference}
              </div>
            )}

            <div>
              <label htmlFor="review-note" className="mb-2 block font-semibold">
                Catatan Review (opsional)
              </label>
              <textarea
                id="review-note"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full rounded-md border border-neutral-700 p-3 text-body"
                rows={3}
                placeholder="Alasan setuju/tolak, saran perbaikan..."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => handleReview('approve')} disabled={submitting}>
                {submitting ? 'Memproses...' : '✓ Setujui'}
              </Button>
              <Button variant="destructive" onClick={() => handleReview('reject')} disabled={submitting}>
                {submitting ? 'Memproses...' : '✗ Tolak'}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedDraft(null)} disabled={submitting}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
