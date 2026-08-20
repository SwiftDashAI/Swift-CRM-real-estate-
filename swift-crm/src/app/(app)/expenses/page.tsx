import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false });

  return <ExpensesClient expenses={expenses ?? []} />;
}
