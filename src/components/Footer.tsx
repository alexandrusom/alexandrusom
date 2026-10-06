import Link from "next/link";
import { site } from "@/content/site";
import { getDictionary, localePath, type Lang } from "@/i18n";
import { Rule } from "./Rule";
import { container } from "./ui";

export function Footer({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  const socials = site.socials.filter((s) => s.href);

  return (
    <footer className={`${container} pb-10 pt-12 text-sm text-anthracite/80`}>
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-[-0.03em] text-anthracite">{t.navbar.brand}</p>
          <p className="mt-1">
            {site.name} · {t.footer.tagline}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {t.footer.links.map((item) => (
            <Link key={item.path} href={localePath(lang, item.path)} className="hover:text-anthracite">
              {item.label}
            </Link>
          ))}
          <Link href={localePath(lang, "/privacy/")} className="hover:text-anthracite">
            {t.footer.privacy}
          </Link>
        </nav>

        {socials.length > 0 && (
          <ul className="flex gap-6">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-anthracite">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Rule className="mt-10" />
      <p className="mt-6">
        © {new Date().getFullYear()} {site.name}. {t.footer.rights}
      </p>
    </footer>
  );
}
