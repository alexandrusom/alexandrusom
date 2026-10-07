// Emails Alexandru when a new lead or booking comes in (via Resend).
// Needs the RESEND_API_KEY and ALERT_EMAIL secrets; without them it quietly does nothing.

export async function notify(subject: string, lines: [string, string | number | null | undefined][]) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("ALERT_EMAIL");
  if (!apiKey || !to) return;

  const escape = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = lines
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${escape(label)}</td><td style="padding:4px 0"><b>${escape(String(value))}</b></td></tr>`)
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "alexandrusom.com <onboarding@resend.dev>",
        to: [to],
        subject,
        html: `<table style="font-family:sans-serif;font-size:15px">${rows}</table>`,
      }),
    });
    if (!res.ok) console.error("Alert email failed", res.status, await res.text());
  } catch (err) {
    // An alert failing must never lose the lead, which is already saved
    console.error("Alert email failed", err);
  }
}
