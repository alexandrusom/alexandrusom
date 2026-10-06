export const locales = ["sv", "en"] as const;
export type Lang = (typeof locales)[number];

/** Swedish lives at the root (/), English under /en/. */
export const defaultLang: Lang = "sv";

export const numberLocale: Record<Lang, string> = { sv: "sv-SE", en: "en-US" };

/** Pages whose address differs per language. Keyed by the Swedish path. */
const translatedPaths: Record<string, Record<Lang, string>> = {
  "/boka/": { sv: "/boka/", en: "/book/" },
};

/** The URL of a page in a given language, from its Swedish path, e.g. ("en", "/boka/") → "/en/book/". */
export function localePath(lang: Lang, path: string) {
  const [base, rest = ""] = path.split(/(?=[?#])/);
  const translated = (translatedPaths[base]?.[lang] ?? base) + rest;
  if (lang === defaultLang) return translated;
  return `/${lang}${translated.startsWith("/") ? translated : `/${translated}`}`;
}

/** The same page in another language, e.g. "/en/book/" → "/boka/". */
export function switchLangPath(pathname: string, to: Lang) {
  let base = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  if (!base.endsWith("/")) base = `${base}/`;
  const swedish = Object.keys(translatedPaths).find((sv) => Object.values(translatedPaths[sv]).includes(base)) ?? base;
  return localePath(to, swedish);
}
