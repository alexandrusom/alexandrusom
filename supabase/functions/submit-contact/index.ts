// Receives the booking form (/boka/), checks it server-side and stores it in public.contact_requests.
// Deploy: supabase functions deploy submit-contact --no-verify-jwt --use-api

import { createClient } from "jsr:@supabase/supabase-js@2";
import { findCoach } from "../_shared/coach.ts";
import { notify } from "../_shared/notify.ts";

// Optional: comma-separated list of allowed site origins (shared with submit-lead)
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const PHONE_PATTERN = /^\+?\d{7,15}$/;
const TOPICS = ["fat_loss", "muscle", "health", "programs", "other"];

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = allowedOrigins.length === 0 ? "*" : origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

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
  const topic = typeof body.topic === "string" && TOPICS.includes(body.topic) ? body.topic : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  const consentText = typeof body.consentText === "string" ? body.consentText.slice(0, 1000) : "";
  const lang = body.lang === "en" ? "en" : "sv";

  if (!name || name.length > 100) return json({ error: "Please enter your name." }, 400);
  if (!PHONE_PATTERN.test(phone)) return json({ error: "Please enter a valid phone number." }, 400);
  if (!topic) return json({ error: "Please choose a topic." }, 400);
  if (body.consent !== true || !consentText) return json({ error: "Consent is required." }, 400);

  const coach = await findCoach(supabase, body.coach);
  if (!coach) return json({ error: "Something went wrong. Please try again." }, 500);

  const { error } = await supabase.from("contact_requests").insert({
    coach_id: coach.id,
    name,
    phone,
    topic,
    message: message || null,
    consent: true,
    consent_text: consentText,
    lang,
  });

  if (error) {
    console.error("Failed to insert contact request", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  await notify(coach.alert_email, `Ny bokning: ${name}`, [
    ["Namn", name],
    ["Telefon", phone],
    ["Vill", topic],
    ["Meddelande", message],
  ]);

  return json({ ok: true });
});
