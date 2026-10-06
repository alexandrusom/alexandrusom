"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ACTIVITY_LEVELS,
  calculatePlan,
  riskOf,
  cmToFtIn,
  ftInToCm,
  kgToLb,
  lbToKg,
  type ActivityLevel,
  type CalorieInput,
  type Issue,
  type Plan,
  type Sex,
} from "@calc";
import { getDictionary, type Dictionary, type Lang } from "@/i18n";
import { formatter, type Formatter, type Units } from "@/lib/format";
import { button, label, subheading } from "../ui";
import { BookLink } from "../BookLink";
import { CoachingPitch } from "./CoachingPitch";
import { LeadForm } from "./LeadForm";

type FormState = {
  sex: Sex | "";
  age: string;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  goalWeight: string;
  weeks: string;
  activity: ActivityLevel | "";
};

type Outcome =
  | { kind: "plan"; plan: Plan; input: CalorieInput }
  | { kind: "issue"; issue: Issue; input: CalorieInput }
  | { kind: "incomplete" };

const emptyForm: FormState = {
  sex: "",
  age: "",
  heightCm: "",
  heightFt: "",
  heightIn: "",
  weight: "",
  goalWeight: "",
  weeks: "",
  activity: "",
};

const parse = (v: string) => {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const oneDecimal = (n: number) => String(Math.round(n * 10) / 10);

function toInput(form: FormState, units: Units): CalorieInput | null {
  const age = parse(form.age);
  const weight = parse(form.weight);
  const goal = parse(form.goalWeight);
  const weeks = parse(form.weeks);
  const ft = parse(form.heightFt);
  const heightCm = units === "metric" ? parse(form.heightCm) : ft === null ? null : ftInToCm(ft, parse(form.heightIn) ?? 0);

  if (!form.sex || !form.activity || age === null || heightCm === null || weight === null || goal === null || weeks === null) {
    return null;
  }
  const toKg = (n: number) => (units === "metric" ? n : lbToKg(n));
  return {
    sex: form.sex,
    age,
    heightCm,
    weightKg: toKg(weight),
    goalWeightKg: toKg(goal),
    weeks: Math.round(weeks),
    activity: form.activity,
  };
}

function convertForm(form: FormState, to: Units): FormState {
  const convertWeight = (v: string) => {
    const n = parse(v);
    if (n === null) return v;
    return oneDecimal(to === "imperial" ? kgToLb(n) : lbToKg(n));
  };
  let height = { heightCm: form.heightCm, heightFt: form.heightFt, heightIn: form.heightIn };
  if (to === "imperial") {
    const cm = parse(form.heightCm);
    if (cm !== null) {
      const { ft, in: inches } = cmToFtIn(cm);
      height = { ...height, heightFt: String(ft), heightIn: String(inches) };
    }
  } else {
    const ft = parse(form.heightFt);
    if (ft !== null) height = { ...height, heightCm: String(Math.round(ftInToCm(ft, parse(form.heightIn) ?? 0))) };
  }
  return { ...form, ...height, weight: convertWeight(form.weight), goalWeight: convertWeight(form.goalWeight) };
}

export function Calculator({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  const c = t.calculator;
  const f = formatter(lang);
  const [units, setUnits] = useState<Units>("metric");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [scrollKey, setScrollKey] = useState(0);
  const [leadName, setLeadName] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollKey === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [scrollKey]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function run(next: FormState) {
    const input = toInput(next, units);
    if (!input) {
      setOutcome({ kind: "incomplete" });
    } else {
      const result = calculatePlan(input);
      setOutcome(result.ok ? { kind: "plan", plan: result.plan, input } : { kind: "issue", issue: result.issue, input });
    }
    setScrollKey((k) => k + 1);
  }

  function switchUnits(next: Units) {
    if (next === units) return;
    setForm((f) => convertForm(f, next));
    setUnits(next);
  }

  /** Apply a suggested goal weight, rounding toward the current weight so it stays within the safe pace. */
  function applyGoal(kg: number, round: "up" | "down") {
    const value =
      units === "metric"
        ? String(kg)
        : String(round === "up" ? Math.ceil(kgToLb(kg) - 1e-9) : Math.floor(kgToLb(kg) + 1e-9));
    const next = { ...form, goalWeight: value };
    setForm(next);
    run(next);
  }

  const weightUnit = units === "metric" ? "kg" : "lb";

  return (
    <div className="mx-auto max-w-3xl">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(form);
        }}
        className="rounded-[10px] bg-titanium-light p-6 text-anthracite shadow-xl shadow-anthracite/10 ring-1 ring-anthracite/10 sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className={subheading}>{c.form.title}</h2>
          <Segmented
            legend={c.form.units}
            name="units"
            value={units}
            onChange={(v) => switchUnits(v as Units)}
            options={[
              { value: "metric", label: "kg / cm" },
              { value: "imperial", label: "lb / ft" },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Segmented
            legend={c.form.sex}
            hint={c.form.sexHint}
            name="sex"
            value={form.sex}
            onChange={(v) => set("sex", v as Sex)}
            options={[
              { value: "male", label: c.form.male },
              { value: "female", label: c.form.female },
            ]}
            stretch
          />
          <NumberField label={c.form.age} suffix={c.form.years} value={form.age} onChange={(v) => set("age", v)} />

          {units === "metric" ? (
            <NumberField label={c.form.height} suffix="cm" value={form.heightCm} onChange={(v) => set("heightCm", v)} />
          ) : (
            <fieldset>
              <legend className="mb-2 block text-sm font-semibold">{c.form.height}</legend>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={c.form.feet} hideLabel suffix="ft" value={form.heightFt} onChange={(v) => set("heightFt", v)} />
                <NumberField label={c.form.inches} hideLabel suffix="in" value={form.heightIn} onChange={(v) => set("heightIn", v)} />
              </div>
            </fieldset>
          )}
          <NumberField
            label={c.form.weight}
            suffix={weightUnit}
            value={form.weight}
            onChange={(v) => set("weight", v)}
            decimal
          />
          <NumberField
            label={c.form.goalWeight}
            suffix={weightUnit}
            value={form.goalWeight}
            onChange={(v) => set("goalWeight", v)}
            decimal
          />
          <NumberField label={c.form.timeframe} suffix={c.form.weeks} value={form.weeks} onChange={(v) => set("weeks", v)} />

          <SelectField
            label={c.form.activity}
            placeholder={c.form.activityPlaceholder}
            options={(Object.keys(ACTIVITY_LEVELS) as ActivityLevel[]).map((key) => ({
              value: key,
              label: `${c.activity[key].label}: ${c.activity[key].description}`,
            }))}
            value={form.activity}
            onChange={(v) => set("activity", v as ActivityLevel)}
            className="sm:col-span-2"
          />
        </div>

        <button type="submit" className={`${button.primary} mt-8 w-full py-4`}>
          {c.form.submit}
        </button>
      </form>

      <div ref={resultRef} aria-live="polite" className="scroll-mt-28">
        {outcome?.kind === "incomplete" && (
          <MessageCard title={c.incomplete.title} body={c.incomplete.body} />
        )}

        {outcome?.kind === "issue" && (
          <IssueCard t={t} f={f} lang={lang} issue={outcome.issue} input={outcome.input} units={units} onGoal={applyGoal} />
        )}

        {outcome?.kind === "plan" && (
          <>
            <ResultCard t={t} f={f} plan={outcome.plan} input={outcome.input} units={units} />
            {leadName === null ? (
              <LeadForm
                lang={lang}
                risk={riskOf(outcome.plan)}
                input={outcome.input}
                units={units}
                onSubmitted={setLeadName}
              />
            ) : (
              <CoachingPitch lang={lang} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

type CardProps = { t: Dictionary; f: Formatter; input: CalorieInput; units: Units };

function ResultCard({ t, f, plan, input, units }: CardProps & { plan: Plan }) {
  const r = t.calculator.result;
  const summary =
    plan.goal === "maintain" ? (
      <>
        {r.maintainPrefix} <strong className="text-titanium-light">{f.weight(input.weightKg, units)}</strong>.
      </>
    ) : (
      <>
        {r.fromPrefix} <strong className="text-titanium-light">{f.weight(input.weightKg, units)}</strong> {r.to}{" "}
        <strong className="text-titanium-light">{f.weight(input.goalWeightKg, units)}</strong> {r.in}{" "}
        {f.weeks(input.weeks)}.
      </>
    );

  const stats = [
    { label: r.maintenance, value: `${f.kcal(plan.maintenanceCalories)} kcal` },
    {
      label: plan.goal === "gain" ? r.surplus : r.deficit,
      value: `${f.kcal(Math.abs(plan.dailyAdjustment))} kcal`,
    },
    { label: r.pace, value: plan.goal === "maintain" ? "—" : f.rate(plan.weeklyChangeKg, units) },
  ];

  return (
    <section className="mt-4 rounded-[10px] bg-anthracite-deep p-6 text-titanium sm:p-10">
      <p className={`${label} flex flex-wrap items-center gap-3 text-titanium/60`}>
        {r.label}
        {plan.warning?.level === "dangerous" && (
          <span className="rounded-sm bg-red-700 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-white">
            {r.notRecommended}
          </span>
        )}
      </p>
      <p className="mt-4 text-6xl font-semibold tracking-[-0.04em] text-titanium-light sm:text-7xl">
        {f.kcal(plan.targetCalories)}
        <span className="ml-3 text-2xl font-medium text-titanium/70 sm:text-3xl">{r.perDay}</span>
      </p>
      <p className="mt-3 text-lg text-titanium/80">{summary}</p>

      <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-titanium/10 pt-8 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className={`${label} text-titanium/60`}>{s.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-titanium-light">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-xs leading-relaxed text-titanium/55">{t.calculator.disclaimer}</p>
    </section>
  );
}

function IssueCard({
  t,
  f,
  lang,
  issue,
  units,
  onGoal,
}: CardProps & {
  lang: Lang;
  issue: Issue;
  onGoal: (kg: number, round: "up" | "down") => void;
}) {
  const c = t.calculator;
  const { title, body } = c.issue(issue, f, units);

  return (
    <MessageCard title={title} body={body}>
      {issue.code === "goal_below_healthy_bmi" && (
        <button type="button" className={`${button.outlineDark} mt-6`} onClick={() => onGoal(issue.minHealthyWeightKg, "up")}>
          {c.useHealthyMin(f.weight(issue.minHealthyWeightKg, units, 0))}
        </button>
      )}
      {issue.code === "below_medical_minimum" && <BookLink lang={lang} className={`${button.primary} mt-6`} />}
    </MessageCard>
  );
}

function MessageCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className="mt-4 rounded-[10px] border-l-4 border-anthracite bg-titanium-light p-6 text-anthracite ring-1 ring-anthracite/10 sm:p-8">
      <h3 className={subheading}>{title}</h3>
      <p className="mt-3 text-anthracite/80">{body}</p>
      {children}
    </section>
  );
}

// Form controls

const inputClass =
  "w-full rounded-md border border-anthracite/20 bg-white px-4 py-3 text-anthracite outline-none transition placeholder:text-anthracite/40 focus:border-military focus:ring-2 focus:ring-military/30";

function NumberField({
  label,
  suffix,
  value,
  onChange,
  decimal = false,
  hideLabel = false,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-2 block text-sm font-semibold"}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          step={decimal ? "0.1" : "1"}
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-16`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-anthracite/50">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = "",
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} appearance-none`}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Segmented({
  legend,
  hint,
  name,
  value,
  options,
  onChange,
  stretch = false,
}: {
  legend: string;
  hint?: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  stretch?: boolean;
}) {
  return (
    <fieldset>
      <legend className={stretch ? "mb-2 block text-sm font-semibold" : "sr-only"}>
        {legend}
        {hint && <span className="ml-2 font-normal text-anthracite/50">{hint}</span>}
      </legend>
      <div className={`inline-flex rounded-md border border-anthracite/20 bg-white p-1 ${stretch ? "w-full" : ""}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded px-4 py-2 text-center text-sm font-semibold text-anthracite/70 transition has-checked:bg-anthracite has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-military ${
              stretch ? "flex-1 py-2.5" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
