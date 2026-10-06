import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary, localePath, type Lang } from "@/i18n";
import type { Topic } from "@/i18n/en";

/** Every "Book a consultation" button leads to the booking page (optionally with a topic preselected). */
export function BookLink({
  lang,
  className,
  topic,
  children,
  onClick,
}: {
  lang: Lang;
  className: string;
  topic?: Topic;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={localePath(lang, topic ? `/boka/?topic=${topic}` : "/boka/")} className={className} onClick={onClick}>
      {children ?? getDictionary(lang).bookCta}
    </Link>
  );
}
