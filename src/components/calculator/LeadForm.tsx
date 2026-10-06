"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import type { CalorieInput, Risk } from "@calc";
import { site } from "@/content/site";
import { getDictionary, localePath, type Lang } from "@/i18n";
import type { Units } from "@/lib/format";
import { button } from "../ui";

type Status = "idle" | "submitting" | "error";

/** 7–15 digits, optionally starting with +; spaces, dashes and brackets are allowed while typing. */
const normalizePhone = (v: string) => v.replace(/[\s\-()]/g, "");
const PHONE_PATTERN = /^\+?\d{7,15}$/;

export function LeadForm({
  lang,
  risk,
  input,
  units,
  onSubmitted,
}: {
  lang: Lang;
  /** How aggressive the goal is; changes the heading and text */
  risk: Risk;
  input: CalorieInput;
  units: Units;
  onSubmitted: (name: string) => void;
}) {
  const t = getDictionary(lang).calculator.lead;
  const id = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot: real people never see this field
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);
    if (!trimmedName) return setError(t.errors.name);
    if (!PHONE_PATTERN.test(normalizedPhone)) return setError(t.errors.phone);
    if (!consent) return setError(t.errors.consent);

    setError(null);
    setStatus("submitting");
    try {
      await submitLead({
        name: trimmedName,
        phone: normalizedPhone,
        consent: true,
        consentText: t.consent,
        units,
        input,
        company,
      });
      onSubmitted(trimmedName);
    } catch (err) {
      setStatus("error");
      setError(err instanceof NotConnectedError ? t.errors.notConnected : t.errors.generic);
    }
  }

  const inputClass =
    "w-full rounded-md border border-anthracite/20 bg-white px-4 py-3 text-anthracite outline-none transition focus:border-military focus:ring-2 focus:ring-military/30";

  return (
    <section className="mt-4 rounded-[10px] bg-titanium-light p-6 text-anthracite ring-1 ring-anthracite/10 sm:p-10">
      <h3 className="text-3xl font-semibold tracking-[-0.035em]">{t.intro[risk].title}</h3>
      <p className="mt-3 text-anthracite/75">{t.intro[risk].body}</p>

      <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-semibold">
            {t.name}
          </label>
          <input
            id={`${id}-name`}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="mb-2 block text-sm font-semibold">
            {t.phone}
          </label>
          <input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            className={inputClass}
          />
        </div>

        <div className="absolute -left-[9999px]" aria-hidden>
          <label htmlFor={`${id}-company`}>Company</label>
          <input
            id={`${id}-company`}
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <label className="flex gap-3 text-sm text-anthracite/75 sm:col-span-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-military"
          />
          <span>
            {t.consent}{" "}
            <Link href={localePath(lang, "/privacy/")} className="underline hover:text-anthracite" target="_blank">
              {t.privacy}
            </Link>
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-800 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={status === "submitting"} className={button.primary}>
            {status === "submitting" ? t.sending : t.submit}
          </button>
        </div>
      </form>
    </section>
  );
}

class NotConnectedError extends Error {}

async function submitLead(payload: Record<string, unknown>) {
  if (!site.leadEndpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("site.leadEndpoint is not set; pretending the lead was saved.", payload);
      return;
    }
    throw new NotConnectedError();
  }

  const res = await fetch(site.leadEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Lead submission failed (${res.status})`);
}
