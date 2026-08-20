import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatINR, formatTime, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const today = todayISO();

  const [
    { count: activeLeadsCount },
    { data: overdueFollowups },
    { data: todayFollowups },
    { data: upcomingVisits },
    { data: noFollowupLeads },
    { data: recentLeads },
    { data: recentActivity },
    { data: activeDeals },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("status", "in", "(WON,LOST)"),
    supabase
      .from("followups")
      .select("id, purpose, due_date, due_time, leads(id, full_name, phone)")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .lt("due_date", today),
    supabase
      .from("followups")
      .select("id, purpose, due_date, due_time, leads(id, full_name, phone)")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .eq("due_date", today),
    supabase
      .from("site_visits")
      .select("id, visit_date")
      .eq("user_id", user.id)
      .eq("status", "SCHEDULED")
      .gte("visit_date", today),
    supabase
      .from("leads")
      .select("id, full_name")
      .eq("user_id", user.id)
      .is("next_followup_date", null)
      .not("status", "in", "(WON,LOST)"),
    supabase
      .from("leads")
      .select("id, full_name, property_type, bhk, preferred_location, min_budget, max_budget, status, next_followup_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("activities")
      .select("id, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("deals")
      .select("deal_value, commission_percent, commission_received, status")
      .eq("user_id", user.id)
      .neq("status", "LOST"),
  ]);

  const expectedCommission = (activeDeals ?? []).reduce(
    (sum, d) => sum + (Number(d.deal_value) * Number(d.commission_percent)) / 100,
    0
  );

  const firstName = (profile?.full_name || "there").split(" ")[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900 md:text-2xl">
          Good {timeOfDayGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-600">Here&apos;s what needs your attention today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="Active Leads" value={activeLeadsCount ?? 0} />
        <MetricCard label="Follow-ups Today" value={todayFollowups?.length ?? 0} accent="brand" />
        <MetricCard label="Overdue" value={overdueFollowups?.length ?? 0} accent="red" />
        <MetricCard label="Site Visits" value={upcomingVisits?.length ?? 0} accent="amber" />
        <MetricCard label="Expected Commission" value={formatINR(expectedCommission)} accent="brand" />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">
          Attention Required
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <AttentionCard
            href="/followups?filter=overdue"
            dot="bg-red-500"
            text={`${overdueFollowups?.length ?? 0} overdue follow-up${(overdueFollowups?.length ?? 0) === 1 ? "" : "s"}`}
          />
          <AttentionCard
            href="/followups?filter=today"
            dot="bg-amber-500"
            text={`${todayFollowups?.length ?? 0} follow-up${(todayFollowups?.length ?? 0) === 1 ? "" : "s"} due today`}
          />
          <AttentionCard
            href="/site-visits"
            dot="bg-yellow-400"
            text={`${upcomingVisits?.length ?? 0} upcoming site visit${(upcomingVisits?.length ?? 0) === 1 ? "" : "s"}`}
          />
          <AttentionCard
            href="/leads"
            dot="bg-brand-500"
            text={`${noFollowupLeads?.length ?? 0} lead${(noFollowupLeads?.length ?? 0) === 1 ? "" : "s"} without a next follow-up`}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-600">Recent Leads</h2>
            <Link href="/leads" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="card divide-y divide-surface-border">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">{lead.full_name}</p>
                    <p className="text-xs text-ink-400">
                      {lead.bhk ? `${lead.bhk} ` : ""}
                      {lead.property_type} · {lead.preferred_location || "Any location"} ·{" "}
                      {formatINR(lead.min_budget)}–{formatINR(lead.max_budget)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-400">
                      Next: {lead.next_followup_date ? formatDate(lead.next_followup_date) : "—"}
                    </span>
                    <StatusBadge status={lead.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No leads yet." hint="Create your first lead to get started." />
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Recent Activity</h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="card divide-y divide-surface-border">
              {recentActivity.map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <p className="text-sm text-ink-800">{a.description}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{formatDate(a.created_at.split("T")[0])}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No activity yet." />
          )}
        </div>
      </div>
    </div>
  );
}

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function AttentionCard({ href, dot, text }: { href: string; dot: string; text: string }) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <span className="text-sm font-medium text-ink-800">{text}</span>
    </Link>
  );
}
