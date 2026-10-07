import { supabase } from "@/lib/supabase";

export type Status = "new" | "called" | "client" | "not_interested";
export type LeadStatus = Exclude<Status, "client">;

/** One person (a row from contacts_overview): their latest calculator and booking data, status and notes. */
export type Contact = {
  phone: string;
  name: string;
  last_contact: string;
  first_contact: string;
  came_from: "calculator" | "booking" | "calculator + booking";
  booking_requests: number;
  calculator_entries: number;
  booking_topic: string | null;
  booking_message: string | null;
  risk: "none" | "ambitious" | "dangerous" | null;
  goal: "lose" | "gain" | "maintain" | null;
  weight_kg: number | null;
  goal_weight_kg: number | null;
  weeks: number | null;
  target_kcal: number | null;
  maintenance_kcal: number | null;
  sex: "male" | "female" | null;
  age: number | null;
  height_cm: number | null;
  activity: string | null;
  status: Status;
  notes: string;
};

export const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  called: "Called",
  client: "Client",
  not_interested: "Not interested",
};

export const STATUS_STYLES: Record<Status, string> = {
  new: "bg-military text-white",
  called: "bg-anthracite/10 text-anthracite",
  client: "bg-anthracite text-titanium-light",
  not_interested: "bg-anthracite/5 text-anthracite/50",
};

export const TOPIC_LABELS: Record<string, string> = {
  fat_loss: "Lose fat",
  muscle: "Build muscle",
  health: "Health",
  programs: "Training programs",
  other: "Other",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Very active",
  very_active: "Extremely active",
};

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("sv-SE", { dateStyle: "medium", timeStyle: "short" });

/** First name for headings, e.g. "Alex" from "Alex Andersson". */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export async function loadContacts(): Promise<Contact[]> {
  const { data, error } = await supabase().from("contacts_overview").select("*");
  if (error) throw error;
  return data as Contact[];
}

/** Saves a person's status and notes. */
export async function saveContactStatus(phone: string, status: Status, notes: string) {
  const { error } = await supabase()
    .from("contact_status")
    .upsert({ phone, status, notes, updated_at: new Date().toISOString() });
  return !error;
}

/** Turns a lead into a client: status "client", and a client profile starting today (if they don't have one). */
export async function makeClient(contact: Contact) {
  if (!(await saveContactStatus(contact.phone, "client", contact.notes))) return false;
  const { error } = await supabase()
    .from("client_profiles")
    .upsert({ phone: contact.phone, start_date: new Date().toISOString().slice(0, 10) }, { onConflict: "phone", ignoreDuplicates: true });
  return !error;
}

/** Google Calendar "new event" link pre-filled with the person's details (no Google setup needed). */
export function calendarLink(c: Contact) {
  const details = [
    `Telefon: ${c.phone}`,
    c.booking_topic && `Vill: ${TOPIC_LABELS[c.booking_topic] ?? c.booking_topic}`,
    c.weight_kg && c.goal_weight_kg && `Mål: ${c.weight_kg} → ${c.goal_weight_kg} kg på ${c.weeks} veckor`,
    c.notes && `Anteckningar: ${c.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({ action: "TEMPLATE", text: `Konsultation – ${c.name}`, details });
  return `https://calendar.google.com/calendar/render?${params}`;
}
