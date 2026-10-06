// Shared class names for type, buttons and layout.

const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const button = {
  // On the light page background
  primary: `${buttonBase} bg-anthracite text-titanium-light hover:bg-anthracite-deep focus-visible:outline-anthracite`,
  outlineDark: `${buttonBase} border border-anthracite/30 text-anthracite hover:border-anthracite hover:bg-anthracite/5 focus-visible:outline-anthracite`,
  // On dark panels
  light: `${buttonBase} bg-titanium-light text-anthracite hover:bg-white focus-visible:outline-titanium-light`,
  outlineLight: `${buttonBase} border border-titanium/40 text-titanium hover:border-titanium hover:bg-titanium/10 focus-visible:outline-titanium`,
};

/** Small uppercase underlined link, like "VIEW ALL" */
export const textLink =
  "text-xs font-semibold uppercase tracking-[0.12em] underline decoration-1 underline-offset-4 hover:decoration-2";

// Wide layout with small side gutters, like Jeff Nippard's site
export const container = "mx-auto w-full max-w-[96rem] px-4 sm:px-6";
export const panel = "rounded-[10px]";

/** Stacked soft shadows: reads as a real object lifted off the page */
export const floatShadow =
  "shadow-[0_1px_2px_rgba(36,40,41,0.12),0_6px_12px_rgba(36,40,41,0.12),0_20px_40px_rgba(36,40,41,0.18),0_40px_80px_rgba(36,40,41,0.12)]";

// Type scale (Inter Tight throughout, Title Case headings, tight tracking)
export const heroHeading = "text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]";
export const heading = "text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[2.75rem]";
export const subheading = "text-2xl font-medium leading-tight tracking-[-0.02em]";
export const label = "text-xs font-medium uppercase tracking-[0.12em]";
export const eyebrowLight = `${label} text-anthracite/75`;
export const eyebrowDark = `${label} text-titanium/70`;
