import { heading } from "@/components/ui";
import { site } from "@/content/site";
import { getDictionary, type Lang } from "@/i18n";

export function PrivacyPage({ lang }: { lang: Lang }) {
  const t = getDictionary(lang).privacy;
  const sections = t.sections(site.name, site.contactEmail || t.contactPlaceholder);

  return (
    <section className="pb-4 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <h1 className={heading}>{t.title}</h1>
        <div className="mt-10 space-y-8 leading-relaxed text-anthracite/85">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl font-medium tracking-[-0.02em] text-anthracite">{s.heading}</h2>
              <p className="mt-2">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
