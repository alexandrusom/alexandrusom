"use client";

import { usePathname } from "next/navigation";
import { useId } from "react";
import { getDictionary, switchLangPath, type Lang } from "@/i18n";

const languages: { lang: Lang; name: string }[] = [
  { lang: "sv", name: "Svenska" },
  { lang: "en", name: "English" },
];

/** Flag switch between Swedish and English, staying on the same page. */
export function LanguageToggle({ lang, className = "" }: { lang: Lang; className?: string }) {
  const pathname = usePathname();

  return (
    <div role="group" aria-label={getDictionary(lang).navbar.language} className={`flex items-center gap-1 ${className}`}>
      {languages.map((l) => {
        const active = l.lang === lang;
        return (
          // Plain <a>: the two languages use separate layouts, so switching is a full page load anyway
          <a
            key={l.lang}
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${switchLangPath(pathname, l.lang)}`}
            hrefLang={l.lang}
            lang={l.lang}
            aria-current={active ? "true" : undefined}
            aria-label={l.name}
            title={l.name}
            className={`flex h-7 w-8 items-center justify-center rounded-[5px] transition ${
              active ? "bg-white/15" : "opacity-50 hover:bg-white/5 hover:opacity-100"
            }`}
          >
            {l.lang === "sv" ? <SwedishFlag /> : <BritishFlag />}
          </a>
        );
      })}
    </div>
  );
}

function SwedishFlag() {
  return (
    <svg viewBox="0 0 16 10" className="h-3.5 w-[22px] rounded-[2px]" aria-hidden>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC02" />
      <rect y="4" width="16" height="2" fill="#FECC02" />
    </svg>
  );
}

function BritishFlag() {
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" className="h-3.5 w-[22px] rounded-[2px]" aria-hidden>
      <clipPath id={`${id}-s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}-s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
