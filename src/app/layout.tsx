import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { BrandMark } from "@/components/features/BrandMark";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Aruna | Portal Edukasi Layanan Disdukcapil Kota Semarang",
  description: "Informasi syarat, alur, biaya, dan waktu layanan administrasi kependudukan. Portal edukasi, bukan kanal pengajuan resmi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={font.variable}>
      <body className="font-sans">
        <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-surface focus:p-3">Lewati ke konten utama</a>
        <header className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <BrandMark />
            <nav aria-label="Utama" className="flex gap-4 text-body">
              <Link href="/chat" className="inline-flex min-h-[44px] items-center">Tanya asisten</Link>
              <Link href="/layanan/ktp-el" className="inline-flex min-h-[44px] items-center">Layanan</Link>
            </nav>
          </div>
        </header>
        <main id="konten" className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-200 bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-6 text-body text-neutral-700">
            <p>Portal ini untuk sosialisasi dan edukasi. Pengajuan, pembuatan, dan perpanjangan dokumen dilakukan melalui kanal resmi Disdukcapil.</p>
            <p className="mt-2">Portal ini bukan situs resmi pemerintah dan tidak memakai logo resmi.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
