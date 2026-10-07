// Finds which coach a public form belongs to. Forms send the coach's slug; the site without one is Alexandru's.

// deno-lint-ignore no-explicit-any
type Client = { from: (table: string) => any };

export type Coach = { id: string; name: string; alert_email: string | null };

const DEFAULT_SLUG = "alexandru";

export async function findCoach(supabase: Client, slug: unknown): Promise<Coach | null> {
  const wanted = typeof slug === "string" && /^[a-z0-9-]{2,40}$/.test(slug) ? slug : DEFAULT_SLUG;
  const { data, error } = await supabase.from("coaches").select("id, name, alert_email").eq("slug", wanted).maybeSingle();
  if (error) console.error("Failed to look up coach", error);
  return data ?? null;
}
