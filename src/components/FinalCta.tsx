import { getDictionary, type Lang } from "@/i18n";
import { BookLink } from "./BookLink";
import { button, heading } from "./ui";

export function FinalCta({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  return (
    // Framed dark panel, matching the hero
    <section className="px-2 pt-16 sm:pt-20">
      <div className="flex flex-col items-start gap-8 rounded-[10px] bg-anthracite px-6 py-14 text-titanium-light sm:px-10 sm:py-20 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className={heading}>{t.finalCta.title}</h2>
          <p className="mt-4 text-lg text-titanium/80">{t.finalCta.body}</p>
        </div>
        <BookLink lang={lang} className={`${button.light} shrink-0`} />
      </div>
    </section>
  );
}
