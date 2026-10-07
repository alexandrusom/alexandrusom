import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/content/site";

let client: SupabaseClient | null = null;

/** Browser-side Supabase client for the admin page (keeps the login session in this browser). */
export function supabase() {
  client ??= createClient(site.supabaseUrl, site.supabasePublishableKey);
  return client;
}
