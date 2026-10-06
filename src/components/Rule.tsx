/** Thin divider with small end ticks, placed under section headings. */
export function Rule({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const color = tone === "dark" ? "bg-anthracite/35" : "bg-titanium/30";
  return (
    <div aria-hidden className={`relative h-px ${color} ${className}`}>
      <span className={`absolute -top-1 left-0 h-2.5 w-px ${color}`} />
      <span className={`absolute -top-1 right-0 h-2.5 w-px ${color}`} />
    </div>
  );
}
