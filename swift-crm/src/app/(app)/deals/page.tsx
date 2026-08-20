import { createClient } from "@/lib/supabase/server";
import { DealsClient } from "@/components/deals/DealsClient";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: deals }, { data: leads }, { data: properties }] = await Promise.all([
    supabase
      .from("deals")
      .select("*, leads(id, full_name, phone), properties(id, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("leads").select("*").eq("user_id", user.id),
    supabase.from("properties").select("*").eq("user_id", user.id),
  ]);

  return <DealsClient deals={deals ?? []} leads={leads ?? []} properties={properties ?? []} />;
}
