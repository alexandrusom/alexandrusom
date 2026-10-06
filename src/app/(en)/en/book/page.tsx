import type { Metadata } from "next";
import { BookingPage } from "@/components/pages/BookingPage";
import { getDictionary } from "@/i18n";

const t = getDictionary("en");
export const metadata: Metadata = { title: t.meta.bookingTitle, description: t.booking.intro };

export default function Page() {
  return <BookingPage lang="en" />;
}
