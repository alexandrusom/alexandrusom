import type { ReactNode } from "react";
import { SiteLayout, siteMetadata } from "@/components/SiteLayout";

export const metadata = siteMetadata("sv");

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout lang="sv">{children}</SiteLayout>;
}
