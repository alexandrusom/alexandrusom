import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/content/site";

let client: SupabaseClient | null = null;

/** Browser-side Supabase client for the admin page (keeps the login session in this browser). */
export function supabase() {
  client ??= createClient(site.supabaseUrl, site.supabasePublishableKey);
  return client;
}

/** The logged-in coach's id. Every coach's data is tagged with it, and the database only shows them their own. */
export async function coachId() {
  const { data } = await supabase().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Not logged in");
  return id;
}
