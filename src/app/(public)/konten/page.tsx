'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  kind: string;
  body: string;
}

export default function KontenEdukasi() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadContents(); }, []);

  async function loadContents() {
    try {
      const res = await fetch('/api/educational-content');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as { contents: Content[] };
      setContents(data.contents);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-6">Memuat...</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-h1 font-bold">Pusat Konten Edukasi</h1>
        <p className="mt-2 text-body text-neutral-600">Artikel dan kuis seputar layanan kependudukan.</p>
      </div>

      <div className="flex gap-4">
        <Link href="/konten" className="font-semibold text-primary-700 underline">Konten</Link>
        <Link href="/kuis" className="text-neutral-600 hover:text-primary-700">Kuis</Link>
      </div>

      {contents.length === 0 && <p className="text-body text-neutral-600">Belum ada konten edukasi.</p>}

      {contents.length > 0 && (
        <ul className="space-y-3">
          {contents.map((item) => (
            <li key={item.id} className="rounded-md border border-neutral-200 bg-surface p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-body-sm text-neutral-600">{item.kind}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
