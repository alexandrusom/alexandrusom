"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/** Horizontal, swipeable slider with prev/next arrows and a "1 / 4" counter. */
export function Carousel({
  children,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  // While an arrow-triggered scroll is animating, ignore scroll events so the counter doesn't jump back
  const animating = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      if (animating.current) return;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
      setIndex(Math.min(slides.length - 1, Math.round(el.scrollLeft / step)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  function go(to: number) {
    const el = track.current;
    const target = el?.children[to] as HTMLElement | undefined;
    if (!el || !target) return;
    setIndex(to);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animating.current) clearTimeout(animating.current);
    animating.current = setTimeout(() => (animating.current = null), reduce ? 50 : 700);
    el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full border border-anthracite/30 text-anthracite transition-colors hover:bg-anthracite hover:text-titanium-light disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <div
        ref={track}
        className="-mx-4 -my-12 flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-4 px-4 py-12 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-[88%] shrink-0 snap-start lg:w-[82%]">
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" aria-label={prevLabel} className={arrow} disabled={index === 0} onClick={() => go(index - 1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          className={arrow}
          disabled={index === slides.length - 1}
          onClick={() => go(index + 1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
        <span className="ml-2 text-xs font-medium tabular-nums tracking-[0.12em] text-anthracite/70" aria-live="polite">
          {index + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}
