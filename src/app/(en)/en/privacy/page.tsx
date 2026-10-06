import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = { title: getDictionary("en").meta.privacyTitle };

export default function Page() {
  return <PrivacyPage lang="en" />;
}
