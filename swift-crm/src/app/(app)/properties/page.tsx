import { createClient } from "@/lib/supabase/server";
import { PropertiesClient } from "@/components/properties/PropertiesClient";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <PropertiesClient properties={properties ?? []} />;
}
