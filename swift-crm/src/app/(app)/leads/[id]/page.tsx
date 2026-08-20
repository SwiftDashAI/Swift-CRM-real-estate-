import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailClient } from "@/components/leads/LeadDetailClient";
import { isMatch } from "@/lib/utils";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: lead }, { data: profile }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", params.id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  if (!lead) notFound();

  const [{ data: followups }, { data: properties }, { data: siteVisits }, { data: activities }] =
    await Promise.all([
      supabase
        .from("followups")
        .select("*")
        .eq("lead_id", lead.id)
        .eq("status", "PENDING")
        .order("due_date", { ascending: true })
        .limit(1),
      supabase.from("properties").select("*").eq("user_id", user.id).eq("status", "AVAILABLE"),
      supabase
        .from("site_visits")
        .select("*, properties(id, title, location)")
        .eq("lead_id", lead.id)
        .order("visit_date", { ascending: false }),
      supabase
        .from("activities")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

  const matches = ((properties ?? []) as Property[]).filter((p) => isMatch(lead, p));

  return (
    <LeadDetailClient
      lead={lead}
      agentName={profile?.full_name || "your agent"}
      pendingFollowup={followups?.[0] ?? null}
      matches={matches}
      siteVisits={siteVisits ?? []}
      activities={activities ?? []}
    />
  );
}
