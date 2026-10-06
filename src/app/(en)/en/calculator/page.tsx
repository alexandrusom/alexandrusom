import type { Metadata } from "next";
import { CalculatorPage } from "@/components/pages/CalculatorPage";
import { getDictionary } from "@/i18n";

const t = getDictionary("en");
export const metadata: Metadata = { title: t.meta.calculatorTitle, description: t.calculator.intro };

export default function Page() {
  return <CalculatorPage lang="en" />;
}
