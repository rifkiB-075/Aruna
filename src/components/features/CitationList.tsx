export interface Citation {
  title: string;
  section?: string;
  effectiveDate: string;
  url?: string;
}

export function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <section aria-label="Sumber resmi" className="mt-4">
      <h3 className="text-h3">Sumber</h3>
      <ul className="mt-2 list-disc pl-6 text-body">
        {citations.map((c) => (
          <li key={`${c.title}-${c.section ?? ""}`}>
            {c.url ? <a className="underline" href={c.url}>{c.title}</a> : c.title}
            {c.section ? `, ${c.section}` : ""} (berlaku {c.effectiveDate})
          </li>
        ))}
      </ul>
    </section>
  );
}
