"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { button } from "@/components/ui";
import { site } from "@/content/site";
import { getDictionary, localePath, type Lang } from "@/i18n";
import type { Topic } from "@/i18n/en";

const TOPICS: Topic[] = ["fat_loss", "muscle", "health", "programs", "other"];
const normalizePhone = (v: string) => v.replace(/[\s\-()]/g, "");
const PHONE_PATTERN = /^\+?\d{7,15}$/;

const inputClass =
  "w-full rounded-md border border-anthracite/20 bg-white px-4 py-3 text-anthracite outline-none transition focus:border-military focus:ring-2 focus:ring-military/30";

export function BookingForm({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  const b = t.booking;
  const lead = t.calculator.lead;
  const id = useId();
  const preselected = useSearchParams().get("topic");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<Topic | null>(TOPICS.includes(preselected as Topic) ? (preselected as Topic) : null);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot: real people never see this field
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);
    if (!trimmedName) return setError(lead.errors.name);
    if (!PHONE_PATTERN.test(normalizedPhone)) return setError(lead.errors.phone);
    if (!topic) return setError(b.errors.topic);
    if (!consent) return setError(lead.errors.consent);

    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch(site.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: normalizedPhone,
          topic,
          message: message.trim(),
          consent: true,
          consentText: b.consent,
          lang,
          company,
        }),
      });
      if (!res.ok) throw new Error(`Booking failed (${res.status})`);
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(lead.errors.generic);
    }
  }

  if (status === "done") {
    return (
      <section role="status" className="rounded-[10px] bg-anthracite p-8 text-titanium-light sm:p-10">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">{b.successTitle}</h2>
        <p className="mt-3 text-titanium/80">{b.successBody}</p>
        <Link href={localePath(lang, "/calculator/")} className={`${button.light} mt-8`}>
          {b.successCta} →
        </Link>
      </section>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[10px] bg-titanium-light p-6 text-anthracite shadow-xl shadow-anthracite/10 ring-1 ring-anthracite/10 sm:grid-cols-2 sm:p-10"
    >
      <div>
        <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-semibold">
          {lead.name}
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
          {lead.phone}
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

      <fieldset className="sm:col-span-2">
        <legend className="mb-3 block text-sm font-semibold">{b.topicQuestion}</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((key) => (
            <label
              key={key}
              className="cursor-pointer rounded-full border border-anthracite/20 bg-white px-4 py-2 text-sm font-medium text-anthracite/80 transition has-checked:border-anthracite has-checked:bg-anthracite has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-military"
            >
              <input
                type="radio"
                name={`${id}-topic`}
                value={key}
                checked={topic === key}
                onChange={() => setTopic(key)}
                className="sr-only"
              />
              {b.topics[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label htmlFor={`${id}-message`} className="mb-2 block text-sm font-semibold">
          {b.message}
        </label>
        <textarea
          id={`${id}-message`}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          className={`${inputClass} resize-y`}
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
          {b.consent}{" "}
          <Link href={localePath(lang, "/privacy/")} className="underline hover:text-anthracite" target="_blank">
            {lead.privacy}
          </Link>
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-800 sm:col-span-2">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "submitting"} className={`${button.primary} w-full py-4 sm:w-auto`}>
          {status === "submitting" ? b.sending : b.submit}
        </button>
      </div>
    </form>
  );
}
