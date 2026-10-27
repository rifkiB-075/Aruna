import { Info } from "lucide-react";

export function ScopeNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside role="note" className="flex gap-3 rounded-md border border-info-700 bg-primary-100 p-4 text-neutral-900">
      <Info aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-info-700" />
      <p className="text-body">
        {compact
          ? "Aruna hanya memberi informasi, bukan tempat mengurus dokumen."
          : "Aruna membantu Anda memahami syarat dan alur layanan. Aruna tidak menerima pengajuan. Pengurusan dilakukan lewat kanal resmi Disdukcapil: Sidnok (layanan online) atau datang ke kantor."}
      </p>
    </aside>
  );
}
