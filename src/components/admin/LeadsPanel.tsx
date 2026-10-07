"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { button } from "@/components/ui";
import {
  calendarLink,
  dateTime,
  loadContacts,
  makeClient,
  saveContactStatus,
  STATUS_LABELS,
  STATUS_STYLES,
  TOPIC_LABELS,
  type Contact,
  type LeadStatus,
} from "./contacts";

const LEAD_STATUSES: LeadStatus[] = ["new", "called", "not_interested"];

/** Everyone from the calculator and booking form who isn't a client yet. */
export function LeadsPanel({ onClientMade }: { onClientMade: (contact: Contact) => void }) {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [onlyDangerous, setOnlyDangerous] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setContacts(await loadContacts());
    } catch {
      setError("Couldn't load leads. Are you logged in as the admin?");
    }
  }, []);

  useEffect(() => {
    // Loading data from Supabase on mount is the external sync this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const leads = useMemo(() => (contacts ?? []).filter((c) => c.status !== "client"), [contacts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter(
      (c) =>
        (statusFilter === "all" || c.status === statusFilter) &&
        (!onlyDangerous || c.risk === "dangerous") &&
        (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, "") || q)),
    );
  }, [leads, search, statusFilter, onlyDangerous]);

  async function save(contact: Contact, changes: Partial<Pick<Contact, "status" | "notes">>) {
    const next = { ...contact, ...changes };
    setContacts((list) => list?.map((c) => (c.phone === contact.phone ? next : c)) ?? null);
    const ok = await saveContactStatus(next.phone, next.status, next.notes);
    if (!ok) setError("Couldn't save. Try again.");
    return ok;
  }

  async function convert(contact: Contact) {
    if (!(await makeClient(contact))) return setError("Couldn't make them a client. Try again.");
    setContacts((list) => list?.map((c) => (c.phone === contact.phone ? { ...c, status: "client" } : c)) ?? null);
    onClientMade({ ...contact, status: "client" });
  }

  if (error && !contacts) return <p className="mt-8 font-semibold text-red-800">{error}</p>;
  if (!contacts) return <p className="mt-8 text-anthracite/60">Loading leads…</p>;

  const count = (s: LeadStatus | "all") => (s === "all" ? leads.length : leads.filter((c) => c.status === s).length);

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === s ? "bg-anthracite text-white" : "bg-white text-anthracite/70 ring-1 ring-anthracite/15 hover:ring-anthracite/40"
            }`}
          >
            {s === "all" ? "All leads" : STATUS_LABELS[s]} <span className="opacity-60">{count(s)}</span>
          </button>
        ))}
        <label className="ml-1 flex items-center gap-2 text-sm text-anthracite/80">
          <input
            type="checkbox"
            checked={onlyDangerous}
            onChange={(e) => setOnlyDangerous(e.target.checked)}
            className="h-4 w-4 accent-red-700"
          />
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

      <ul className="mt-6 space-y-3">
        {visible.length === 0 && <li className="text-anthracite/60">No leads match.</li>}
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
              <span className="text-sm text-anthracite/50">{dateTime(c.last_contact)}</span>
            </button>

            {open === c.phone && <LeadDetails lead={c} onSave={(changes) => save(c, changes)} onMakeClient={() => convert(c)} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeadDetails({
  lead: c,
  onSave,
  onMakeClient,
}: {
  lead: Contact;
  onSave: (changes: Partial<Pick<Contact, "status" | "notes">>) => Promise<boolean>;
  onMakeClient: () => void;
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

        <label className="block text-sm font-semibold">
          Status
          <select
            value={c.status}
            onChange={(e) => onSave({ status: e.target.value as LeadStatus })}
            className="mt-2 w-full rounded-md border border-anthracite/20 bg-white px-3 py-2"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold">
          Notes
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
            className="mt-2 w-full resize-y rounded-md border border-anthracite/20 bg-white px-3 py-2 font-normal"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={button.outlineDark}
            disabled={notes === c.notes}
            onClick={async () => setSaved(await onSave({ notes }))}
          >
            Save notes
          </button>
          {saved && <span className="text-sm text-military">Saved ✓</span>}
          <button type="button" className={`${button.primary} ml-auto`} onClick={onMakeClient}>
            Make client →
          </button>
        </div>
      </div>
    </div>
  );
}
