import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { container, eyebrowLight, heroHeading } from "@/components/ui";
import { getDictionary, type Lang } from "@/i18n";

export function BookingPage({ lang }: { lang: Lang }) {
  const t = getDictionary(lang).booking;
  return (
    <section className="pb-4 pt-32 sm:pt-36">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={eyebrowLight}>{t.eyebrow}</p>
          <h1 className={`${heroHeading} mt-4`}>{t.title}</h1>
          <p className="mt-5 text-lg text-anthracite/80">{t.intro}</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          {/* Suspense: the form reads ?topic= from the address */}
          <Suspense>
            <BookingForm lang={lang} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
