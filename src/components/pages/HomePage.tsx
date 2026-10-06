import Link from "next/link";
import type { ReactNode } from "react";
import { Carousel } from "@/components/Carousel";
import { HeroVideos } from "@/components/HeroVideos";
import { LoopVideo } from "@/components/LoopVideo";
import { Photo } from "@/components/Photo";
import { PhotoCycler } from "@/components/PhotoCycler";
import { Rule } from "@/components/Rule";
import { BookLink } from "@/components/BookLink";
import { button, container, eyebrowLight, floatShadow, heading, label } from "@/components/ui";
import { site } from "@/content/site";
import { getDictionary, localePath, type Dictionary, type Lang } from "@/i18n";

export function HomePage({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  return (
    <>
      <Hero t={t} lang={lang} />
      <Divider />
      <Programs t={t} lang={lang} />
      <Divider />
      <Coaching t={t} lang={lang} />
      {/* Proof right after the offer */}
      {t.results.items.length > 0 && (
        <>
          <Divider />
          <Results t={t} lang={lang} />
        </>
      )}
      <Divider />
      <HowItWorks t={t} lang={lang} />
      <Divider />
      <About t={t} lang={lang} />
    </>
  );
}

type SectionProps = { t: Dictionary; lang: Lang };

/** Thin line between sections */
function Divider() {
  return (
    <div className={`${container} py-12 sm:py-14`}>
      <Rule />
    </div>
  );
}

/** Small label + big heading on the left, optional link on the right */
function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className={eyebrowLight}>{eyebrow}</p>
        <h2 className={`${heading} mt-3`}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function BookButton({ lang }: { lang: Lang }) {
  return <BookLink lang={lang} className={button.primary} />;
}

function Hero({ t, lang }: SectionProps) {
  return (
    <section>
      <div className="relative overflow-hidden bg-anthracite-deep">
        {/* Phones: video on top, box overlapping below it. Desktop: video fills the panel, box on the right. */}
        <div className="relative h-[60svh] min-h-80 lg:absolute lg:inset-0 lg:h-auto">
          <HeroVideos sources={site.heroVideos} />
        </div>
        <div className="relative -mt-24 px-3 pb-3 sm:px-6 sm:pb-6 lg:mt-0 lg:flex lg:min-h-svh lg:items-center lg:justify-end lg:px-10 lg:py-16">
          <div className="rounded-2xl border border-white/10 bg-anthracite-deep/70 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9 lg:max-w-md">
            {/* Setup line, then the punchline */}
            <p className="text-lg font-medium tracking-[-0.02em] text-titanium/60">{t.hero.lead}</p>
            <h1 className={`${heading} mt-2 text-titanium-light`}>{t.hero.title}</h1>
            <p className="mt-5 leading-relaxed text-titanium/75">
              {t.hero.subtitle}{" "}
              <strong className="box-decoration-clone bg-[linear-gradient(transparent_55%,rgba(200,197,190,0.28)_55%)] font-semibold text-white">
                {t.hero.highlight}
              </strong>
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={localePath(lang, "/calculator/")} className={`${button.light} group py-3.5 sm:flex-1`}>
                {t.hero.primaryCta}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <BookLink lang={lang} className={`${button.outlineLight} sm:flex-1`} />
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-titanium/70">
              {t.hero.reassurance.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckIcon className="text-titanium-light" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Programs({ t, lang }: SectionProps) {
  const p = t.programs;
  return (
    <section id="programs" className={container}>
      <SectionHeader
        eyebrow={p.eyebrow}
        title={p.title}
        action={<span className={`${label} rounded-full border border-anthracite/30 px-3 py-1.5`}>{p.comingSoon}</span>}
      />

      <div className="relative mt-8">
        {/* Placeholder cards, blurred until the programs launch */}
        <div aria-hidden className="pointer-events-none grid select-none grid-cols-2 gap-3 blur-[6px] lg:grid-cols-4 lg:gap-4">
          {p.items.map((item, i) => (
            <div key={item.name}>
              <div
                className={`flex aspect-[3/4] flex-col justify-between rounded-[10px] p-5 ${
                  i % 2 === 0 ? "bg-anthracite" : "bg-military"
                } text-titanium-light`}
              >
                <span className="self-start rounded-sm bg-titanium-light px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-anthracite">
                  {p.newTag}
                </span>
                <p className="text-3xl font-semibold leading-none tracking-[-0.04em] sm:text-4xl">{item.name}</p>
              </div>
              <p className="mt-3 font-medium">{item.name}</p>
              <div className="mt-2 rounded-md bg-anthracite/10 p-3 text-xs">
                <p className="flex justify-between">
                  <span>{p.goal}</span>
                  <span className="font-semibold uppercase">{item.goal}</span>
                </p>
                <p className="mt-1 flex justify-between">
                  <span>{p.level}</span>
                  <span className="font-semibold uppercase">{item.level}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-anthracite-deep/80 p-7 text-center text-titanium-light shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className={`${label} text-titanium/70`}>{p.comingSoon}</p>
            <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em]">{p.teaser}</p>
            <BookLink lang={lang} topic="programs" className={`${button.light} mt-6`}>
              {p.notifyCta}
            </BookLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Coaching({ t, lang }: SectionProps) {
  const c = t.coaching;
  return (
    <section id="coaching" className={container}>
      <SectionHeader eyebrow={c.eyebrow} title={c.title} />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* The one offer: gym video behind a brand-green fade so the text stays readable */}
        <div className="relative isolate flex min-h-[32rem] flex-col justify-between gap-10 overflow-hidden rounded-[10px] bg-military p-7 text-white sm:p-10">
          <LoopVideo src="/videos/coaching.mp4" fill className="-z-10" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-military via-military/75 to-military/10" />
          <span className="self-start rounded-sm bg-titanium-light px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-anthracite">
            {c.tag}
          </span>
          <div>
            <h3 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{c.name}</h3>
            <p className="mt-4 max-w-lg leading-relaxed text-white/85">{c.description}</p>
            <BookLink lang={lang} className={`${button.light} mt-8`}>
              {c.cta}
            </BookLink>
          </div>
        </div>

        {/* What's included */}
        <div className="rounded-[10px] bg-anthracite/[0.06] p-7 sm:p-10">
          <p className={eyebrowLight}>{c.includedLabel}</p>
          <ol className="mt-4 divide-y divide-anthracite/20">
            {c.included.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 last:pb-0">
                <span className="text-sm font-semibold tabular-nums text-anthracite/50">0{i + 1}</span>
                <div>
                  <h4 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-medium tracking-[-0.02em]">
                    {item.title}
                    {item.optional && (
                      <span className="rounded-full border border-anthracite/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-anthracite/75">
                        {c.optionalTag}
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-anthracite/80">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }: SectionProps) {
  return (
    <section id="how-it-works" className={container}>
      {/* Label sitting on the line */}
      <div className="flex items-center gap-4">
        <Rule className="flex-1" />
        <p className={eyebrowLight}>{t.howItWorks.eyebrow}</p>
        <Rule className="flex-1" />
      </div>
      <ol className="mt-10 grid divide-y divide-anthracite/25 md:grid-cols-3 md:divide-x md:divide-y-0">
        {t.howItWorks.steps.map((s, i) => (
          <li key={s.title} className="flex min-h-56 flex-col justify-between gap-8 py-8 md:px-8 md:py-2 md:first:pl-0">
            <div>
              <span className="text-6xl font-semibold tracking-[-0.05em]">0{i + 1}</span>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.02em]">{s.title}</h3>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-anthracite/80">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function About({ t, lang }: SectionProps) {
  return (
    <section id="about" className={`${container} grid items-start gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-16`}>
      <Photo
        src={site.photos.about}
        alt={site.name}
        className="aspect-[3/4] w-full lg:sticky lg:top-24"
      />
      <div className="lg:pt-4">
        <h2 className={heading}>{t.about.title}</h2>
        <Rule className="mt-8" />
        <div className="mt-8 space-y-5">
          {t.about.paragraphs.map((p) => (
            <p key={p} className="max-w-xl text-lg leading-relaxed text-anthracite/85">
              {p}
            </p>
          ))}
        </div>
        {/* Punchline, highlighted like the hero */}
        <p className="mt-8 text-3xl font-semibold tracking-[-0.035em]">
          <span className="box-decoration-clone bg-[linear-gradient(transparent_55%,rgba(96,106,69,0.35)_55%)]">
            {t.about.closing}
          </span>
        </p>
        <div className="mt-6">
          <BookButton lang={lang} />
        </div>
      </div>
    </section>
  );
}

function Results({ t }: SectionProps) {
  const r = t.results;
  return (
    <section id="results" className={container}>
      <SectionHeader eyebrow={r.eyebrow} title={r.title} />
      <div className="mt-8">
        <Carousel prevLabel={r.prev} nextLabel={r.next}>
          {r.items.map((item) => (
            <ResultCard key={item.photos.before} item={item} t={t} />
          ))}
          {Array.from({ length: r.upcoming }, (_, i) => (
            <UpcomingCard key={`upcoming-${i}`} t={t} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

type ResultItem = Dictionary["results"]["items"][number];

const lift = "transition-transform duration-300 hover:-translate-y-1.5";

/** Before, after and quote as three floating cards at staggered heights */
function ResultCard({ item, t }: { item: ResultItem; t: Dictionary }) {
  const r = t.results;
  return (
    <article className="grid grid-cols-2 items-start gap-3 md:grid-cols-3 md:gap-5">
      <PhotoCard srcs={[item.photos.before]} tag={r.before} value={item.beforeValue} nextLabel={r.nextPhoto} className="md:mt-12" />
      <PhotoCard srcs={item.photos.after} tag={r.after} value={item.afterValue} nextLabel={r.nextPhoto} dark />
      <figure
        className={`col-span-2 flex flex-col gap-8 rounded-2xl bg-anthracite p-7 text-titanium-light md:col-span-1 md:mt-24 ${floatShadow} ${lift}`}
      >
        <div>
          <p className="text-5xl font-semibold tracking-[-0.05em]">{item.change}</p>
          <p className="mt-2 text-sm font-medium text-titanium/70">{item.headline}</p>
        </div>
        {item.quote && (
          <blockquote className="text-lg font-medium leading-snug tracking-[-0.02em]">“{item.quote}”</blockquote>
        )}
        <figcaption className={`${label} text-titanium/60`}>{item.name}</figcaption>
      </figure>
    </article>
  );
}

function PhotoCard({
  srcs,
  tag,
  value,
  nextLabel,
  dark = false,
  className = "",
}: {
  srcs: string[];
  tag: string;
  value: string;
  nextLabel: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white p-2 ${floatShadow} ${lift} ${className}`}>
      <PhotoCycler
        srcs={srcs}
        nextLabel={nextLabel}
        sizes="(min-width: 768px) 30vw, 45vw"
        className="aspect-[3/4] rounded-xl bg-titanium"
      />
      <div className="flex flex-wrap items-center justify-between gap-1 px-1.5 py-2.5 sm:px-2 sm:py-3">
        <span
          className={`rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
            dark ? "bg-anthracite text-titanium-light" : "bg-titanium-light text-anthracite"
          }`}
        >
          {tag}
        </span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

/** Same three-card shape, blurred, until the next person is added */
function UpcomingCard({ t }: { t: Dictionary }) {
  return (
    <div className="relative">
      <div aria-hidden className="grid grid-cols-2 items-start gap-3 blur-[6px] md:grid-cols-3 md:gap-5">
        <div className={`rounded-2xl bg-white p-2 md:mt-12 ${floatShadow}`}>
          <div className="aspect-[3/4] rounded-xl bg-titanium" />
          <div className="h-11" />
        </div>
        <div className={`rounded-2xl bg-white p-2 ${floatShadow}`}>
          <div className="aspect-[3/4] rounded-xl bg-military/50" />
          <div className="h-11" />
        </div>
        <div className={`hidden h-80 rounded-2xl bg-anthracite md:mt-24 md:block ${floatShadow}`} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className={`rounded-2xl bg-anthracite-deep/85 px-7 py-5 text-center text-titanium-light backdrop-blur-xl ${floatShadow}`}>
          <p className={`${label} text-titanium/70`}>{t.results.comingSoon}</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">{t.results.comingSoonBody}</p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
