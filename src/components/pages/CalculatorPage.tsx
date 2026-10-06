import { Calculator } from "@/components/calculator/Calculator";
import { container, eyebrowLight, heroHeading } from "@/components/ui";
import { getDictionary, type Lang } from "@/i18n";

export function CalculatorPage({ lang }: { lang: Lang }) {
  const t = getDictionary(lang).calculator;
  return (
    <section className="pb-4 pt-32 sm:pt-36">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={eyebrowLight}>{t.eyebrow}</p>
          <h1 className={`${heroHeading} mt-4`}>{t.title}</h1>
          <p className="mt-5 text-lg text-anthracite/80">{t.intro}</p>
        </div>
        <div className="mt-12">
          <Calculator lang={lang} />
        </div>
      </div>
    </section>
  );
}
