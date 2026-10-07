"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { DietPlans } from "./DietPlans";

type Status = "new" | "called" | "client" | "not_interested";

type Contact = {
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
  sex: string | null;
  age: number | null;
  height_cm: number | null;
  activity: string | null;
  status: Status;
  notes: string;
};

const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  called: "Called",
  client: "Client",
  not_interested: "Not interested",
};
const STATUS_STYLES: Record<Status, string> = {
  new: "bg-military text-white",
  called: "bg-anthracite/10 text-anthracite",
  client: "bg-anthracite text-titanium-light",
  not_interested: "bg-anthracite/5 text-anthracite/50",
};
const TOPIC_LABELS: Record<string, string> = {
  fat_loss: "Lose fat",
  muscle: "Build muscle",
  health: "Health",
  programs: "Training programs",
  other: "Other",
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("sv-SE", { dateStyle: "medium", timeStyle: "short" });

/** Google Calendar "new event" link pre-filled with the person's details (no Google setup needed). */
function calendarLink(c: Contact) {
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

export function ContactsPanel() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [onlyDangerous, setOnlyDangerous] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [planCounts, setPlanCounts] = useState<Record<string, number>>({});
  // The client whose diet plans are open (replaces the list while open)
  const [plansFor, setPlansFor] = useState<Contact | null>(null);

  const load = useCallback(async () => {
    const [contactsRes, plansRes] = await Promise.all([
      supabase().from("contacts_overview").select("*"),
      supabase().from("diet_plans").select("phone"),
    ]);
    if (contactsRes.error) return setError("Couldn't load contacts. Are you logged in as the admin?");
    setContacts(contactsRes.data as Contact[]);
    const counts: Record<string, number> = {};
    for (const row of (plansRes.data ?? []) as { phone: string }[]) counts[row.phone] = (counts[row.phone] ?? 0) + 1;
    setPlanCounts(counts);
  }, []);

  useEffect(() => {
    // Loading data from Supabase on mount is the external sync this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (contacts ?? []).filter(
      (c) =>
        (statusFilter === "all" || c.status === statusFilter) &&
        (!onlyDangerous || c.risk === "dangerous") &&
        (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, "") || q)),
    );
  }, [contacts, search, statusFilter, onlyDangerous]);

  async function save(phone: string, changes: Partial<Pick<Contact, "status" | "notes">>) {
    const current = contacts?.find((c) => c.phone === phone);
    if (!current) return false;
    const next = { ...current, ...changes };
    setContacts((list) => list?.map((c) => (c.phone === phone ? next : c)) ?? null);
    const { error } = await supabase()
      .from("contact_status")
      .upsert({ phone, status: next.status, notes: next.notes, updated_at: new Date().toISOString() });
    if (error) {
      setError("Couldn't save. Try again.");
      return false;
    }
    return true;
  }

  const counts = useMemo(() => {
    const all = contacts ?? [];
    return {
      all: all.length,
      new: all.filter((c) => c.status === "new").length,
      called: all.filter((c) => c.status === "called").length,
      client: all.filter((c) => c.status === "client").length,
      not_interested: all.filter((c) => c.status === "not_interested").length,
    };
  }, [contacts]);

  if (error && !contacts) return <p className="mt-8 font-semibold text-red-800">{error}</p>;
  if (!contacts) return <p className="mt-8 text-anthracite/60">Loading contacts…</p>;

  if (plansFor) {
    return (
      <DietPlans
        client={plansFor}
        onBack={() => {
          setPlansFor(null);
          load(); // refresh plan counts
        }}
      />
    );
  }

  return (
    <section className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "new", "called", "client", "not_interested"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === s ? "bg-anthracite text-white" : "bg-white text-anthracite/70 ring-1 ring-anthracite/15 hover:ring-anthracite/40"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
        <label className="ml-1 flex items-center gap-2 text-sm text-anthracite/80">
          <input type="checkbox" checked={onlyDangerous} onChange={(e) => setOnlyDangerous(e.target.checked)} className="h-4 w-4 accent-red-700" />
          Dangerous goals only
        </label>
        <input
          type="search"
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-full rounded-full border border-anthracite/20 bg-white px-4 py-2 text-sm outline-none focus:border-military sm:w-64"
        />
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-800">{error}</p>}

      {/* List */}
      <ul className="mt-6 space-y-3">
        {visible.length === 0 && <li className="text-anthracite/60">No contacts match.</li>}
        {visible.map((c) => (
          <li key={c.phone} className="rounded-[10px] bg-white ring-1 ring-anthracite/10">
            <button
              type="button"
              onClick={() => setOpen(open === c.phone ? null : c.phone)}
              aria-expanded={open === c.phone}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left"
            >
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
                {STATUS_LABELS[c.status]}
              </span>
              <span className="min-w-40 flex-1 font-semibold">{c.name}</span>
              <span className="text-sm tabular-nums text-anthracite/70">{c.phone}</span>
              <span className="text-sm text-anthracite/60">{c.came_from}</span>
              {c.risk === "dangerous" && (
                <span className="rounded-sm bg-red-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  Dangerous goal
                </span>
              )}
              {(planCounts[c.phone] ?? 0) > 0 && (
                <span className="rounded-full bg-titanium-light px-2.5 py-0.5 text-xs font-medium text-anthracite/70">
                  {planCounts[c.phone]} diet plan{planCounts[c.phone] === 1 ? "" : "s"}
                </span>
              )}
              <span className="text-sm text-anthracite/50">{dateTime(c.last_contact)}</span>
            </button>

            {open === c.phone && (
              <ContactDetails
                contact={c}
                planCount={planCounts[c.phone] ?? 0}
                onOpenPlans={() => setPlansFor(c)}
                onSave={(changes) => save(c.phone, changes)}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactDetails({
  contact: c,
  planCount,
  onOpenPlans,
  onSave,
}: {
  contact: Contact;
  planCount: number;
  onOpenPlans: () => void;
  onSave: (changes: Partial<Pick<Contact, "status" | "notes">>) => Promise<boolean>;
}) {
  const [notes, setNotes] = useState(c.notes);
  const [saved, setSaved] = useState(false);

  const facts: [string, string | number | null][] = [
    ["Wants", c.booking_topic ? (TOPIC_LABELS[c.booking_topic] ?? c.booking_topic) : null],
    ["Message", c.booking_message],
    ["Goal", c.weight_kg && c.goal_weight_kg ? `${c.weight_kg} → ${c.goal_weight_kg} kg in ${c.weeks} weeks` : null],
    ["Calorie target", c.target_kcal ? `${c.target_kcal} kcal/day (maintenance ${c.maintenance_kcal})` : null],
    ["Risk", c.risk],
    ["Body", c.sex ? `${c.sex}, ${c.age} y, ${c.height_cm} cm, ${c.activity}` : null],
    ["Bookings / calculator", `${c.booking_requests} / ${c.calculator_entries}`],
    ["First contact", dateTime(c.first_contact)],
  ];

  return (
    <div className="grid gap-6 border-t border-anthracite/10 p-4 md:grid-cols-[1fr_1fr]">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {facts
          .filter(([, v]) => v !== null && v !== "")
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-anthracite/60">{k}</dt>
              <dd className="whitespace-pre-wrap">{v}</dd>
            </div>
          ))}
      </dl>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${c.phone}`} className={button.primary}>
            Call
          </a>
          <a href={calendarLink(c)} target="_blank" rel="noopener noreferrer" className={button.outlineDark}>
            Add to Google Calendar
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-titanium-light/60 p-3">
          <span className="text-sm">
            <b>Diet plans</b> · {planCount === 0 ? "none yet" : `${planCount} saved`}
          </span>
          <button type="button" className={button.outlineDark} onClick={onOpenPlans}>
            {planCount === 0 ? "Create diet plan" : "Open diet plans"}
          </button>
        </div>

        <label className="block text-sm font-semibold">
          Status
          <select
            value={c.status}
            onChange={(e) => onSave({ status: e.target.value as Status })}
            className="mt-2 w-full rounded-md border border-anthracite/20 bg-white px-3 py-2"
          >
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold">
          Notes
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
            className="mt-2 w-full resize-y rounded-md border border-anthracite/20 bg-white px-3 py-2 font-normal"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={button.outlineDark}
            disabled={notes === c.notes}
            onClick={async () => setSaved(await onSave({ notes }))}
          >
            Save notes
          </button>
          {saved && <span className="text-sm text-military">Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}
