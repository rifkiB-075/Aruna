import { ExternalLink } from "lucide-react";

interface OfficialLinkProps {
  href: string;
  label?: string;
}

/**
 * Link ke kanal resmi Disdukcapil dengan verifikasi domain whitelist.
 * ponytail: domain whitelist dari env, visual design final.
 */
export function OfficialLink({ href, label = "Kunjungi Kanal Resmi" }: OfficialLinkProps) {
  // Whitelist domain (ponytail: pindah ke env/config)
  const allowedDomains = ["semarangkota.go.id", "play.google.com"];
  
  try {
    const url = new URL(href);
    const isAllowed = allowedDomains.some((domain) => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      console.warn(`Domain tidak diizinkan: ${url.hostname}`);
      return null;
    }
  } catch {
    console.warn(`URL tidak valid: ${href}`);
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
    >
      {label}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
