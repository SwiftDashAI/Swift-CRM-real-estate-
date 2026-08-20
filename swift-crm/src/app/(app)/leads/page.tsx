import { createClient } from "@/lib/supabase/server";
import { LeadsClient } from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: leads }, { data: profile }] = await Promise.all([
    supabase.from("leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  return <LeadsClient leads={leads ?? []} agentName={profile?.full_name || "your agent"} />;
}
