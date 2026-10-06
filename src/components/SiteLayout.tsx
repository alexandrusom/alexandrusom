import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { getDictionary, type Lang } from "@/i18n";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import "@/app/globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });

export function siteMetadata(lang: Lang): Metadata {
  const t = getDictionary(lang);
  return { title: t.meta.title, description: t.meta.description };
}

/** The <html> shell shared by the Swedish and English root layouts. */
export function SiteLayout({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={`${interTight.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar lang={lang} />
        <main className="flex-1">{children}</main>
        <FinalCta lang={lang} />
        <Footer lang={lang} />
      </body>
    </html>
  );
}
