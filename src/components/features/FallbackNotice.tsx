export function FallbackNotice({ channel }: { channel: string }) {
  return (
    <div role="status" className="rounded-md border border-warning-700 bg-surface p-4 text-body text-neutral-900">
      Maaf, informasi tersebut belum tersedia di sumber resmi yang kami miliki, jadi saya tidak ingin menebak. Silakan hubungi Disdukcapil Kota Semarang melalui kanal resmi: <strong>{channel}</strong>.
    </div>
  );
}
