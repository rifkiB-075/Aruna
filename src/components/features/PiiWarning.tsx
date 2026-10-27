import { ShieldAlert } from "lucide-react";

export function PiiWarning({ id }: { id?: string }) {
  return (
    <p id={id} className="flex items-start gap-2 text-body text-neutral-700">
      <ShieldAlert aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warning-700" />
      <span>Jangan tulis NIK, nomor KK, alamat, atau nomor telepon di sini.</span>
    </p>
  );
}
