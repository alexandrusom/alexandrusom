"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { button } from "@/components/ui";
import { coachId, supabase } from "@/lib/supabase";
import {
  ACTIVITY_LABELS,
  calendarLink,
  firstName,
  loadContacts,
  saveContactStatus,
  type Contact,
} from "./contacts";
import { DietPlans } from "./DietPlans";

type Profile = {
  phone: string;
  start_date: string | null;
  start_weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: "male" | "female" | null;
  activity: string | null;
  goal_weight_kg: number | null;
  goal_date: string | null;
  goal_text: string | null;
  likes: string | null;
  dislikes: string | null;
  allergies: string | null;
  diet_style: string | null;
  meals_per_day: number | null;
  preference_notes: string | null;
};

type CurrentPlan = { phone: string; target_kcal: number | null };

const inputClass = "mt-1 w-full rounded-md border border-anthracite/20 bg-white px-3 py-2 font-normal outline-none focus:border-military";
const label = "block text-sm font-semibold";
const eyebrow = "text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60";

/** Everyone marked as a client. Clicking one opens their page. */
export function ClientsPanel({ openPhone, onOpen }: { openPhone: string | null; onOpen: (phone: string | null) => void }) {
  const [clients, setClients] = useState<Contact[] | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [current, setCurrent] = useState<Map<string, CurrentPlan>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const [contacts, p, plans] = await Promise.all([
        loadContacts(),
        supabase().from("client_profiles").select("*"),
        supabase().from("diet_plans").select("phone, target_kcal").eq("is_current", true),
      ]);
      if (p.error || plans.error) throw p.error ?? plans.error;
      setClients(contacts.filter((c) => c.status === "client"));
      setProfiles(new Map((p.data as Profile[]).map((x) => [x.phone, x])));
      setCurrent(new Map((plans.data as CurrentPlan[]).map((x) => [x.phone, x])));
    } catch {
      setError("Couldn't load clients. Are you logged in as the admin?");
    }
  }, []);

  useEffect(() => {
    // Loading data from Supabase on mount is the external sync this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (clients ?? []).filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [clients, search]);

  if (error) return <p className="mt-8 font-semibold text-red-800">{error}</p>;
  if (!clients) return <p className="mt-8 text-anthracite/60">Loading clients…</p>;

  const client = clients.find((c) => c.phone === openPhone);
  if (client)
    return (
      <ClientPage
        client={client}
        profile={profiles.get(client.phone) ?? null}
        onBack={() => {
          onOpen(null);
          load();
        }}
        onProfileSaved={(p) => setProfiles((m) => new Map(m).set(p.phone, p))}
        onClientChange={(next) => setClients((list) => list?.map((c) => (c.phone === next.phone ? next : c)) ?? null)}
        onRemoved={() => {
          setClients((list) => list?.filter((c) => c.phone !== client.phone) ?? null);
          onOpen(null);
        }}
      />
    );

  return (
    <section className="mt-6">
      <input
        type="search"
        placeholder="Search clients"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-full border border-anthracite/20 bg-white px-4 py-2 text-sm outline-none focus:border-military sm:w-64"
      />
      {clients.length === 0 && (
        <p className="mt-6 text-anthracite/60">No clients yet. Open a lead and press &quot;Make client&quot;.</p>
      )}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => {
          const p = profiles.get(c.phone);
          const start = p?.start_weight_kg ?? c.weight_kg;
          const goal = p?.goal_weight_kg ?? c.goal_weight_kg;
          const kcal = current.get(c.phone)?.target_kcal;
          return (
            <li key={c.phone}>
              <button
                type="button"
                onClick={() => onOpen(c.phone)}
                className="w-full rounded-[10px] bg-white p-5 text-left ring-1 ring-anthracite/10 transition hover:ring-military"
              >
                <span className="block text-2xl font-semibold tracking-[-0.03em]">{firstName(c.name)}</span>
                <span className="block text-sm text-anthracite/60">{c.name}</span>
                <span className="mt-3 block text-sm">
                  {start && goal ? `${start} → ${goal} kg` : "No goal yet"}
                  {" · "}
                  {current.has(c.phone) ? `Diet ${kcal ? `${kcal} kcal` : "set"}` : "No diet yet"}
                </span>
                {p?.start_date && <span className="block text-xs text-anthracite/50">Client since {p.start_date}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ClientPage({
  client: c,
  profile,
  onBack,
  onProfileSaved,
  onClientChange,
  onRemoved,
}: {
  client: Contact;
  profile: Profile | null;
  onBack: () => void;
  onProfileSaved: (p: Profile) => void;
  onClientChange: (c: Contact) => void;
  onRemoved: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "diet">("overview");

  async function backToLeads() {
    if (!window.confirm(`Move ${c.name} back to leads? Their profile and diets are kept.`)) return;
    if (await saveContactStatus(c.phone, "called", c.notes)) onRemoved();
  }

  return (
    <section className="mt-6">
      <button type="button" onClick={onBack} className="text-sm underline underline-offset-4">
        ← All clients
      </button>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>Client</p>
          <h2 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{firstName(c.name)}</h2>
          <p className="mt-1 text-anthracite/70">
            {c.name} · <span className="tabular-nums">{c.phone}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${c.phone}`} className={button.primary}>
            Call
          </a>
          <a href={calendarLink(c)} target="_blank" rel="noopener noreferrer" className={button.outlineDark}>
            Add to Google Calendar
          </a>
        </div>
      </div>

      <nav className="mt-6 flex gap-6 border-b border-anthracite/15">
        {(["overview", "diet"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold ${
              tab === t ? "border-military text-anthracite" : "border-transparent text-anthracite/60 hover:text-anthracite"
            }`}
          >
            {t === "overview" ? "Overview" : "Diet"}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <Overview client={c} profile={profile} onProfileSaved={onProfileSaved} onClientChange={onClientChange} />
      ) : (
        <>
          <Preferences phone={c.phone} profile={profile} onSaved={onProfileSaved} />
          <DietPlans
            client={{
              phone: c.phone,
              name: c.name,
              target_kcal: c.target_kcal,
              weight_kg: profile?.start_weight_kg ?? c.weight_kg,
              goal_weight_kg: profile?.goal_weight_kg ?? c.goal_weight_kg,
            }}
          />
        </>
      )}

      <button type="button" onClick={backToLeads} className="mt-12 text-sm text-anthracite/60 underline underline-offset-4">
        Move back to leads
      </button>
    </section>
  );
}

/** Saves part of a client profile (creating it if needed). */
async function saveProfile(phone: string, profile: Profile | null, changes: Partial<Profile>) {
  const next = { ...(profile ?? emptyProfile(phone)), ...changes };
  const { error } = await supabase()
    .from("client_profiles")
    .upsert({ ...next, coach_id: await coachId(), updated_at: new Date().toISOString() });
  return error ? null : next;
}

function emptyProfile(phone: string): Profile {
  return {
    phone,
    start_date: null,
    start_weight_kg: null,
    height_cm: null,
    age: null,
    sex: null,
    activity: null,
    goal_weight_kg: null,
    goal_date: null,
    goal_text: null,
    likes: null,
    dislikes: null,
    allergies: null,
    diet_style: null,
    meals_per_day: null,
    preference_notes: null,
  };
}

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const str = (v: string) => (v.trim() === "" ? null : v);

function Overview({
  client: c,
  profile,
  onProfileSaved,
  onClientChange,
}: {
  client: Contact;
  profile: Profile | null;
  onProfileSaved: (p: Profile) => void;
  onClientChange: (c: Contact) => void;
}) {
  // Start values fall back to what they entered in the calculator
  const initial = {
    start_date: profile?.start_date ?? "",
    start_weight_kg: String(profile?.start_weight_kg ?? c.weight_kg ?? ""),
    height_cm: String(profile?.height_cm ?? c.height_cm ?? ""),
    age: String(profile?.age ?? c.age ?? ""),
    sex: profile?.sex ?? c.sex ?? "",
    activity: profile?.activity ?? c.activity ?? "",
    goal_weight_kg: String(profile?.goal_weight_kg ?? c.goal_weight_kg ?? ""),
    goal_date: profile?.goal_date ?? "",
    goal_text: profile?.goal_text ?? "",
  };
  const [form, setForm] = useState(initial);
  const [notes, setNotes] = useState(c.notes);
  const [status, setStatus] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setStatus(null);
  };

  async function save() {
    const saved = await saveProfile(c.phone, profile, {
      start_date: str(form.start_date),
      start_weight_kg: num(form.start_weight_kg),
      height_cm: num(form.height_cm),
      age: num(form.age),
      sex: (str(form.sex) as Profile["sex"]) ?? null,
      activity: str(form.activity),
      goal_weight_kg: num(form.goal_weight_kg),
      goal_date: str(form.goal_date),
      goal_text: str(form.goal_text),
    });
    const notesOk = notes === c.notes || (await saveContactStatus(c.phone, "client", notes));
    if (notesOk && notes !== c.notes) onClientChange({ ...c, notes });
    if (saved) onProfileSaved(saved);
    setStatus(saved && notesOk ? "Saved ✓" : "Couldn't save. Check the values and try again.");
  }

  const start = num(form.start_weight_kg);
  const goal = num(form.goal_weight_kg);

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Start" value={start ? `${start} kg` : "–"} />
        <Stat label="Goal" value={goal ? `${goal} kg` : "–"} sub={start && goal ? `${goal - start > 0 ? "+" : ""}${Math.round((goal - start) * 10) / 10} kg` : undefined} />
        <Stat
          label="Calculator target"
          value={c.target_kcal ? `${c.target_kcal} kcal` : "–"}
          sub={c.maintenance_kcal ? `Maintenance ${c.maintenance_kcal}${c.risk === "dangerous" ? " · dangerous goal" : ""}` : undefined}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="space-y-3 rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10">
          <legend className={`${eyebrow} px-1`}>Start values</legend>
          <label className={label}>
            Start date
            <input type="date" value={form.start_date} onChange={set("start_date")} className={inputClass} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className={label}>
              Weight (kg)
              <input inputMode="decimal" value={form.start_weight_kg} onChange={set("start_weight_kg")} className={inputClass} />
            </label>
            <label className={label}>
              Height (cm)
              <input inputMode="decimal" value={form.height_cm} onChange={set("height_cm")} className={inputClass} />
            </label>
            <label className={label}>
              Age
              <input inputMode="numeric" value={form.age} onChange={set("age")} className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Sex
              <select value={form.sex} onChange={set("sex")} className={inputClass}>
                <option value="">–</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className={label}>
              Activity
              <select value={form.activity} onChange={set("activity")} className={inputClass}>
                <option value="">–</option>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10">
          <legend className={`${eyebrow} px-1`}>Goal</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Goal weight (kg)
              <input inputMode="decimal" value={form.goal_weight_kg} onChange={set("goal_weight_kg")} className={inputClass} />
            </label>
            <label className={label}>
              Goal date
              <input type="date" value={form.goal_date} onChange={set("goal_date")} className={inputClass} />
            </label>
          </div>
          <label className={label}>
            Goal in their words
            <textarea rows={3} value={form.goal_text} onChange={set("goal_text")} className={inputClass} />
          </label>
        </fieldset>
      </div>

      <label className={`${label} rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10`}>
        <span className={eyebrow}>Coach notes</span>
        <textarea
          rows={6}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setStatus(null);
          }}
          className={inputClass}
        />
      </label>

      <div className="flex items-center gap-3">
        <button type="button" className={button.primary} onClick={save}>
          Save
        </button>
        {status && <span className={`text-sm ${status.startsWith("Saved") ? "text-military" : "text-red-800"}`}>{status}</span>}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[10px] bg-anthracite p-5 text-titanium-light">
      <p className="text-xs font-medium uppercase tracking-[0.12em] opacity-60">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{value}</p>
      {sub && <p className="text-sm opacity-70">{sub}</p>}
    </div>
  );
}

function Preferences({ phone, profile, onSaved }: { phone: string; profile: Profile | null; onSaved: (p: Profile) => void }) {
  const [form, setForm] = useState({
    likes: profile?.likes ?? "",
    dislikes: profile?.dislikes ?? "",
    allergies: profile?.allergies ?? "",
    diet_style: profile?.diet_style ?? "",
    meals_per_day: String(profile?.meals_per_day ?? ""),
    preference_notes: profile?.preference_notes ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setStatus(null);
  };

  async function save() {
    const saved = await saveProfile(phone, profile, {
      likes: str(form.likes),
      dislikes: str(form.dislikes),
      allergies: str(form.allergies),
      diet_style: str(form.diet_style),
      meals_per_day: num(form.meals_per_day),
      preference_notes: str(form.preference_notes),
    });
    if (saved) onSaved(saved);
    setStatus(saved ? "Saved ✓" : "Couldn't save. Check the values and try again.");
  }

  return (
    <fieldset className="mt-6 rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10">
      <legend className={`${eyebrow} px-1`}>Preferences</legend>
      <div className="grid gap-3 md:grid-cols-3">
        <label className={label}>
          Likes
          <textarea rows={3} value={form.likes} onChange={set("likes")} className={inputClass} />
        </label>
        <label className={label}>
          Dislikes
          <textarea rows={3} value={form.dislikes} onChange={set("dislikes")} className={inputClass} />
        </label>
        <label className={label}>
          Allergies / intolerances
          <textarea rows={3} value={form.allergies} onChange={set("allergies")} className={`${inputClass} ${form.allergies ? "border-red-700" : ""}`} />
        </label>
        <label className={label}>
          Diet style
          <input placeholder="e.g. vegetarian, no pork" value={form.diet_style} onChange={set("diet_style")} className={inputClass} />
        </label>
        <label className={label}>
          Meals per day
          <input inputMode="numeric" value={form.meals_per_day} onChange={set("meals_per_day")} className={inputClass} />
        </label>
        <label className={`${label} md:row-span-1`}>
          Other notes
          <textarea rows={2} value={form.preference_notes} onChange={set("preference_notes")} className={inputClass} />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" className={button.outlineDark} onClick={save}>
          Save preferences
        </button>
        {status && <span className={`text-sm ${status.startsWith("Saved") ? "text-military" : "text-red-800"}`}>{status}</span>}
      </div>
    </fieldset>
  );
}
