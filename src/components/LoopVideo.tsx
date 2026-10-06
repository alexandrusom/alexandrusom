"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Muted looping video in a rounded panel, with the same soft film-grain look as the hero. Plays only while on screen. */
export function LoopVideo({
  src,
  className = "",
  fill = false,
}: {
  src: string;
  className?: string;
  /** Cover the parent element (as a background) instead of being its own rounded panel. */
  fill?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden className={`${fill ? "absolute inset-0" : "relative rounded-[10px]"} overflow-hidden bg-anthracite-deep ${className}`}>
      <video
        ref={ref}
        src={asset(src)}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover blur-[1px] contrast-105"
      />
      <div className="absolute inset-0 bg-black/15" />
      <div className="film-grain" />
    </div>
  );
}
