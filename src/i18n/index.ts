import type { Lang } from "./config";
import { en, type Dictionary } from "./en";
import { sv } from "./sv";

const dictionaries: Record<Lang, Dictionary> = { sv, en };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
export * from "./config";
