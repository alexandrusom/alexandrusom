"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { ClientsPanel } from "./ClientsPanel";
import { LeadsPanel } from "./LeadsPanel";
import { FoodsPanel } from "./FoodsPanel";

const TABS = { leads: "Leads", clients: "Clients", foods: "Foods" } as const;
type Tab = keyof typeof TABS;

const inputClass =
  "w-full rounded-md border border-anthracite/20 bg-white px-4 py-3 text-anthracite outline-none focus:border-military focus:ring-2 focus:ring-military/30";

/** Private admin area: login, then the tools. Data access is enforced by the database, not by this page. */
export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("leads");
  const [openClient, setOpenClient] = useState<string | null>(null);

  useEffect(() => {
    const auth = supabase().auth;
    auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) return <p className="p-8 text-anthracite/60">Loading…</p>;
  if (!session) return <Login />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-anthracite/20 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60">Admin</p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">{TABS[tab]}</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-anthracite/60">{session.user.email}</span>
          <button type="button" className={button.outlineDark} onClick={() => supabase().auth.signOut()}>
            Log out
          </button>
        </div>
      </header>
      <nav aria-label="Admin sections" className="mt-6 flex gap-1 rounded-full bg-white p-1 ring-1 ring-anthracite/10 sm:inline-flex">
        {(Object.keys(TABS) as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setOpenClient(null);
            }}
            aria-current={tab === key ? "page" : undefined}
            className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === key ? "bg-anthracite text-white" : "text-anthracite/70 hover:text-anthracite"
            }`}
          >
            {TABS[key]}
          </button>
        ))}
      </nav>
      {tab === "leads" && (
        <LeadsPanel
          onClientMade={(c) => {
            setOpenClient(c.phone);
            setTab("clients");
          }}
        />
      )}
      {tab === "clients" && <ClientsPanel openPhone={openClient} onOpen={setOpenClient} />}
      {tab === "foods" && <FoodsPanel />}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError("Wrong email or password.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[10px] bg-titanium-light p-8 shadow-xl shadow-anthracite/10 ring-1 ring-anthracite/10"
      >
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Log in</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mt-2`}
        />
        <label className="mt-4 block text-sm font-semibold" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mt-2`}
        />
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${button.primary} mt-6 w-full`}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
