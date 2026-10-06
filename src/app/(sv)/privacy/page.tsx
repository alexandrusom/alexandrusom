import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = { title: getDictionary("sv").meta.privacyTitle };

export default function Page() {
  return <PrivacyPage lang="sv" />;
}
