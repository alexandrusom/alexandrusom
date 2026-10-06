import { cmToFtIn, kgToLb, type RangeField } from "@calc";
import { getDictionary, numberLocale, type Lang } from "@/i18n";

export type Units = "metric" | "imperial";

/** Number and unit formatting in the visitor's language (e.g. "2 190 kcal" in Swedish, "2,190 kcal" in English). */
export function formatter(lang: Lang) {
  const t = getDictionary(lang).units;
  const num = (n: number, digits = 0) => n.toLocaleString(numberLocale[lang], { maximumFractionDigits: digits });

  const weight = (kg: number, units: Units, digits = 1) =>
    units === "metric" ? `${num(kg, digits)} kg` : `${num(kgToLb(kg), digits === 0 ? 0 : 1)} lb`;

  const height = (cm: number, units: Units) => {
    if (units === "metric") return `${num(cm)} cm`;
    const { ft, in: inches } = cmToFtIn(cm);
    return `${ft}′${inches}″`;
  };

  const weeks = (n: number) => `${n} ${n === 1 ? t.week : t.weeks}`;

  return {
    weight,
    height,
    weeks,
    kcal: (n: number) => num(n),
    rate: (kgPerWeek: number, units: Units) => `${weight(Math.abs(kgPerWeek), units, 2)}${t.perWeek}`,
    /** A calculator range limit, shown in the field's own unit. */
    limit(field: RangeField, value: number, units: Units) {
      if (field === "heightCm") return height(value, units);
      if (field === "weightKg" || field === "goalWeightKg") return weight(value, units, 0);
      if (field === "weeks") return weeks(value);
      return `${value}`;
    },
  };
}

export type Formatter = ReturnType<typeof formatter>;
