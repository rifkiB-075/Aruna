'use client';

import { useEffect, useState } from 'react';

interface Analytics {
  totalChats: number;
  answeredRate: number;
  avgRetrievalScore: number;
  topTopics: Array<{ topic: string; count: number }>;
  unansweredQuestions: Array<{
    id: string;
    question: string;
    count: number;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    reason: string | null;
    status: string;
    created_at: string;
  }>;
}

export default function AdminHome() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics');
        return res.json() as Promise<Analytics>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-body">Memuat...</p>;
  if (error) return <p className="text-danger-700">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-h1 font-bold">Dashboard Admin</h1>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Ringkasan (30 hari terakhir)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-neutral-200 bg-surface p-4">
            <p className="text-body-sm text-neutral-600">Total Percakapan</p>
            <p className="text-h2 font-bold">{data.totalChats}</p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-surface p-4">
            <p className="text-body-sm text-neutral-600">Tingkat Terjawab</p>
            <p className="text-h2 font-bold">{data.answeredRate}%</p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-surface p-4">
            <p className="text-body-sm text-neutral-600">Rata-rata Skor Retrieval</p>
            <p className="text-h2 font-bold">{data.avgRetrievalScore}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Topik Terbanyak</h2>
        {data.topTopics.length === 0 ? (
          <p className="text-body text-neutral-600">Belum ada data</p>
        ) : (
          <ol className="space-y-2">
            {data.topTopics.map((t, i) => (
              <li key={t.topic} className="flex items-center gap-3 text-body">
                <span className="font-semibold text-neutral-700">{i + 1}.</span>
                <span className="flex-1">{t.topic}</span>
                <span className="text-neutral-600">({t.count})</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Pertanyaan Belum Terjawab (status baru)</h2>
        {data.unansweredQuestions.length === 0 ? (
          <p className="text-body text-neutral-600">Tidak ada pertanyaan baru</p>
        ) : (
          <ul className="space-y-3">
            {data.unansweredQuestions.map((q) => (
              <li key={q.id} className="rounded-md border border-neutral-200 bg-surface p-3">
                <p className="text-body">{q.question}</p>
                <p className="mt-1 text-body-sm text-neutral-600">
                  Muncul {q.count}x • {new Date(q.created_at).toLocaleDateString('id-ID')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Laporan Jawaban Keliru (status baru)</h2>
        {data.reports.length === 0 ? (
          <p className="text-body text-neutral-600">Tidak ada laporan baru</p>
        ) : (
          <ul className="space-y-3">
            {data.reports.map((r) => (
              <li key={r.id} className="rounded-md border border-neutral-200 bg-surface p-3">
                <p className="text-body">{r.reason || '(tanpa alasan)'}</p>
                <p className="mt-1 text-body-sm text-neutral-600">
                  {new Date(r.created_at).toLocaleDateString('id-ID')} •{' '}
                  {new Date(r.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
