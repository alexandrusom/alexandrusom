import Image from "next/image";
import { asset } from "@/lib/asset";

/** Shows a photo from /public, or a branded placeholder until one is set in content/site.ts. */
export function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[10px] bg-anthracite-deep ${className}`}>
      {src ? (
        <Image src={asset(src)} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(200,197,190,0.04)_14px_15px)]"
        >
          <span className="text-7xl font-semibold tracking-[-0.04em] text-military/60">AS</span>
        </div>
      )}
    </div>
  );
}
