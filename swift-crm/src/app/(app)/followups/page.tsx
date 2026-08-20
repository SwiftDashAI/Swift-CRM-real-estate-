import { createClient } from "@/lib/supabase/server";
import { FollowupsClient } from "@/components/followups/FollowupsClient";

export const dynamic = "force-dynamic";

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: followups }, { data: profile }] = await Promise.all([
    supabase
      .from("followups")
      .select("*, leads(id, full_name, phone)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true }),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  return (
    <FollowupsClient
      followups={followups ?? []}
      agentName={profile?.full_name || "your agent"}
      initialFilter={searchParams.filter}
    />
  );
}
