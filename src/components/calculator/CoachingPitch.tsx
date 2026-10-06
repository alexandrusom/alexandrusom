import { getDictionary, type Lang } from "@/i18n";
import { label } from "../ui";

export function CoachingPitch({ lang }: { lang: Lang }) {
  const { pitch } = getDictionary(lang).calculator;

  return (
    <section className="mt-4 overflow-hidden rounded-[10px] bg-anthracite p-6 text-titanium-light sm:p-10">
      <p className={`${label} text-titanium/70`}>{pitch.thanks}</p>
      <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
        {pitch.title}
      </h3>
      <p className="mt-4 text-lg text-titanium/85">{pitch.body}</p>
      <ul className="mt-6 space-y-3">
        {pitch.points.map((point) => (
          <li key={point} className="flex gap-3">
            <svg className="mt-1 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-lg font-semibold">{pitch.closing}</p>
    </section>
  );
}
