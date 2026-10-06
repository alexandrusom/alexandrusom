"use client";

import Image from "next/image";
import { useState } from "react";
import { asset } from "@/lib/asset";

/** One or more photos in the same frame; click or tap to show the next one. */
export function PhotoCycler({
  srcs,
  nextLabel,
  className = "",
  sizes,
}: {
  srcs: string[];
  nextLabel: string;
  className?: string;
  sizes: string;
}) {
  const [index, setIndex] = useState(0);
  const multiple = srcs.length > 1;

  const photos = srcs.map((src, i) => (
    <Image
      key={src}
      src={asset(src)}
      alt=""
      fill
      sizes={sizes}
      className={`object-cover object-top transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
    />
  ));

  if (!multiple) return <div className={`relative overflow-hidden ${className}`}>{photos}</div>;

  return (
    <button
      type="button"
      onClick={() => setIndex((i) => (i + 1) % srcs.length)}
      aria-label={`${nextLabel} (${index + 1} / ${srcs.length})`}
      className={`group relative block w-full cursor-pointer overflow-hidden ${className}`}
    >
      {photos}
      {/* Hint that there's more: dots plus a small arrow */}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/45 to-transparent px-3 pb-3 pt-8">
        <span className="flex gap-1.5">
          {srcs.map((src, i) => (
            <span
              key={src}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/55"}`}
            />
          ))}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-anthracite transition-transform group-hover:translate-x-0.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 3l5 5-5 5" />
          </svg>
        </span>
      </span>
    </button>
  );
}
