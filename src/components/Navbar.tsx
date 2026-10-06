"use client";

import Link from "next/link";
import { useState } from "react";
import { getDictionary, localePath, type Lang } from "@/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { BookLink } from "./BookLink";

// Frosted-glass boxes floating over the page
const glass = "rounded-md border border-white/10 bg-anthracite-deep/55 backdrop-blur-xl";
const barLink =
  "flex h-7 items-center whitespace-nowrap rounded-[5px] px-3 text-[13px] font-medium text-titanium transition-colors hover:bg-white/5 hover:text-white";
const mobileItem =
  "flex items-center gap-3 rounded px-3 py-3 text-lg font-medium tracking-[-0.02em] text-titanium-light hover:bg-white/5";

export function Navbar({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const calculatorHref = localePath(lang, "/calculator/");
  const aboutHref = localePath(lang, "/#about");

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:pt-5">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-start justify-between gap-1 lg:justify-center">
        <Link
          href={localePath(lang, "/")}
          onClick={close}
          className={`${glass} flex h-10 items-center whitespace-nowrap px-3 text-sm font-semibold tracking-[-0.03em] text-titanium-light transition-colors hover:text-white sm:px-4 sm:text-[15px]`}
        >
          {t.navbar.brand}
        </Link>

        {/* Desktop: one menu bar (free first step → main action → trust) */}
        <ul className={`${glass} hidden h-10 items-center gap-1 px-1.5 lg:flex`}>
          <li>
            <Link href={calculatorHref} className={`${barLink} gap-2`}>
              {t.navbar.calculator}
              <FreeBadge text={t.navbar.free} />
            </Link>
          </li>
          <li>
            <BookLink lang={lang} className={barLink}>
              {t.navbar.book}
            </BookLink>
          </li>
          <li>
            <Link href={aboutHref} className={barLink}>
              {t.navbar.about}
            </Link>
          </li>
        </ul>

        <div className="flex gap-1">
          {/* Phones: book button */}
          <BookLink
            lang={lang}
            onClick={close}
            className={`${glass} flex h-10 items-center whitespace-nowrap px-4 text-[13px] font-medium text-titanium-light hover:text-white lg:hidden`}
          >
            {t.navbar.bookShort}
          </BookLink>
          <LanguageToggle lang={lang} className={`${glass} h-10 px-1`} />
          <button
            type="button"
            className={`${glass} flex h-10 w-10 items-center justify-center text-titanium-light hover:text-white lg:hidden`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.navbar.closeMenu : t.navbar.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className={`${glass} mx-auto mt-1 max-w-6xl p-2 lg:hidden`}>
          <ul className="flex flex-col">
            <li>
              <Link href={calculatorHref} onClick={close} className={mobileItem}>
                {t.navbar.calculator}
                <FreeBadge text={t.navbar.free} />
              </Link>
            </li>
            <li>
              <BookLink lang={lang} onClick={close} className={mobileItem}>
                {t.navbar.book}
              </BookLink>
            </li>
            <li>
              <Link href={aboutHref} onClick={close} className={mobileItem}>
                {t.navbar.about}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function FreeBadge({ text }: { text: string }) {
  return (
    <span className="rounded-sm bg-titanium-light px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-anthracite">
      {text}
    </span>
  );
}
