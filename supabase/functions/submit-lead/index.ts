// Receives the calculator lead form, re-checks everything server-side and stores it in public.leads.
// Deploy: supabase functions deploy submit-lead --no-verify-jwt

import { createClient } from "jsr:@supabase/supabase-js@2";
import { calculatePlan, isActivityLevel, isSex, riskOf, type CalorieInput } from "../_shared/calories.ts";
import { findCoach } from "../_shared/coach.ts";
import { notify } from "../_shared/notify.ts";

// Optional: comma-separated list of allowed site origins, e.g. "https://alexandrusom.com,http://localhost:3000"
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const PHONE_PATTERN = /^\+?\d{7,15}$/;

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = allowedOrigins.length === 0 ? "*" : origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot filled in: pretend success so bots don't retry.
  if (typeof body.company === "string" && body.company.length > 0) return json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/[\s\-()]/g, "") : "";
  const consentText = typeof body.consentText === "string" ? body.consentText.slice(0, 1000) : "";
  const units = body.units === "imperial" ? "imperial" : body.units === "metric" ? "metric" : null;

  if (!name || name.length > 100) return json({ error: "Please enter your name." }, 400);
  if (!PHONE_PATTERN.test(phone)) return json({ error: "Please enter a valid phone number." }, 400);
  if (body.consent !== true || !consentText) return json({ error: "Consent is required." }, 400);
  if (!units) return json({ error: "Invalid request." }, 400);

  const raw = (body.input ?? {}) as Record<string, unknown>;
  if (
    !isSex(raw.sex) ||
    !isActivityLevel(raw.activity) ||
    !isNumber(raw.age) ||
    !isNumber(raw.heightCm) ||
    !isNumber(raw.weightKg) ||
    !isNumber(raw.goalWeightKg) ||
    !isNumber(raw.weeks)
  ) {
    return json({ error: "Invalid calculator details." }, 400);
  }
  const input: CalorieInput = {
    sex: raw.sex,
    activity: raw.activity,
    age: raw.age,
    heightCm: raw.heightCm,
    weightKg: raw.weightKg,
    goalWeightKg: raw.goalWeightKg,
    weeks: raw.weeks,
  };

  // Recalculate so stored results can't be tampered with. Goals with no result shown (e.g. under 18) are rejected.
  const result = calculatePlan(input);
  if (!result.ok) return json({ error: "Those calculator details don't have a result." }, 422);

  const coach = await findCoach(supabase, body.coach);
  if (!coach) return json({ error: "Something went wrong. Please try again." }, 500);

  const { error } = await supabase.from("leads").insert({
    coach_id: coach.id,
    name,
    phone,
    consent: true,
    consent_text: consentText,
    unit_system: units,
    sex: input.sex,
    age: Math.round(input.age),
    height_cm: input.heightCm,
    weight_kg: input.weightKg,
    goal_weight_kg: input.goalWeightKg,
    weeks: Math.round(input.weeks),
    activity: input.activity,
    goal: result.plan.goal,
    maintenance_kcal: result.plan.maintenanceCalories,
    target_kcal: result.plan.targetCalories,
    risk: riskOf(result.plan),
  });

  if (error) {
    console.error("Failed to insert lead", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  const risk = riskOf(result.plan);
  await notify(coach.alert_email, `Ny lead från kaloriräknaren: ${name}${risk === "dangerous" ? " (farligt mål)" : ""}`, [
    ["Namn", name],
    ["Telefon", phone],
    ["Mål", `${input.weightKg} → ${input.goalWeightKg} kg på ${input.weeks} veckor`],
    ["Kalorimål", `${result.plan.targetCalories} kcal/dag`],
    ["Risk", risk],
  ]);

  return json({ ok: true });
});
