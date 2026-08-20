import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyDetailClient } from "@/components/properties/PropertyDetailClient";
import { isMatch } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!property) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .not("status", "in", "(WON,LOST)");

  const interestedLeads = ((leads ?? []) as Lead[]).filter((lead) => isMatch(lead, property));

  return <PropertyDetailClient property={property} interestedLeads={interestedLeads} />;
}
