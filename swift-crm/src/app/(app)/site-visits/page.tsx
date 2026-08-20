import { createClient } from "@/lib/supabase/server";
import { SiteVisitsClient } from "@/components/sitevisits/SiteVisitsClient";

export const dynamic = "force-dynamic";

export default async function SiteVisitsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: visits }, { data: leads }, { data: properties }] = await Promise.all([
    supabase
      .from("site_visits")
      .select("*, leads(id, full_name, phone), properties(id, title, location)")
      .eq("user_id", user.id)
      .order("visit_date", { ascending: true }),
    supabase.from("leads").select("*").eq("user_id", user.id).not("status", "in", "(WON,LOST)"),
    supabase.from("properties").select("*").eq("user_id", user.id),
  ]);

  return <SiteVisitsClient visits={visits ?? []} leads={leads ?? []} properties={properties ?? []} />;
}
