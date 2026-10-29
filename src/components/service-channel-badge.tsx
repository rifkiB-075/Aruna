import type { ServiceChannel } from "@/types";

interface ServiceChannelBadgeProps {
  channel: ServiceChannel | null;
}

/**
 * Badge kanal layanan: sidnok (online), kantor (datang), campuran.
 * ponytail: design system final, icon, warna per kanal.
 */
export function ServiceChannelBadge({ channel }: ServiceChannelBadgeProps) {
  if (!channel) return null;

  const labels: Record<ServiceChannel, string> = {
    sidnok: "Online (Sidnok)",
    kantor: "Datang ke Kantor",
    campuran: "Online & Kantor",
  };

  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      {labels[channel]}
    </span>
  );
}
