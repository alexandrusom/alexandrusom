"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Background videos that play one after another and loop, crossfading between them. */
export function HeroVideos({ sources }: { sources: string[] }) {
  const [active, setActive] = useState(0);
  // Visitors who turn off animations in their device settings get a still first frame.
  const paused = useReducedMotion();
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === active && !paused) video.play().catch(() => {});
      else video.pause();
    });
  }, [active, paused]);

  function playNext(current: number) {
    const next = (current + 1) % sources.length;
    const video = videos.current[next];
    if (video) video.currentTime = 0;
    setActive(next);
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-anthracite-deep">
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            videos.current[i] = el;
          }}
          src={asset(src)}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onEnded={() => playNext(i)}
          className={`absolute inset-0 h-full w-full scale-[1.02] object-cover blur-[1.2px] contrast-105 transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Darken for contrast, add film grain, and fade into the panel below */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="film-grain" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-anthracite-deep to-transparent lg:h-56" />
    </div>
  );
}
