"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SiteVisitFormDrawer } from "@/components/sitevisits/SiteVisitFormDrawer";
import { formatDate, formatTime } from "@/lib/utils";
import type { SiteVisit, Lead, Property } from "@/lib/types";

const OUTCOMES = ["Interested", "Negotiation", "Not Interested", "Follow-up Required"];

export function SiteVisitsClient({
  visits,
  leads,
  properties,
}: {
  visits: SiteVisit[];
  leads: Lead[];
  properties: Property[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scheduled = visits.filter((v) => v.status === "SCHEDULED");
  const others = visits.filter((v) => v.status !== "SCHEDULED");

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Site Visits</h1>
          <p className="mt-1 text-sm text-ink-600">{scheduled.length} scheduled</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>+ Schedule Visit</button>
      </div>

      {scheduled.length === 0 ? (
        <EmptyState message="No site visits scheduled." />
      ) : (
        <div className="space-y-3">
          {scheduled.map((v) => <VisitCard key={v.id} visit={v} />)}
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Past Visits</h2>
          <div className="space-y-3">
            {others.map((v) => <VisitCard key={v.id} visit={v} readOnly />)}
          </div>
        </div>
      )}

      <SiteVisitFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} leads={leads} properties={properties} />
    </div>
  );
}

function VisitCard({ visit, readOnly = false }: { visit: SiteVisit; readOnly?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [completing, setCompleting] = useState(false);
  const [outcome, setOutcome] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function markStatus(status: "COMPLETED" | "CANCELLED", outcomeValue?: string) {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("site_visits")
      .update({ status, outcome: outcomeValue ?? null })
      .eq("id", visit.id);

    await supabase.from("activities").insert({
      user_id: user.id,
      lead_id: visit.lead_id,
      type: "site_visit_" + status.toLowerCase(),
      description: `Site visit ${status.toLowerCase()} for ${visit.leads?.full_name ?? "lead"}${outcomeValue ? ` — ${outcomeValue}` : ""}`,
    });

    setBusy(false);
    router.refresh();
  }

  return (
    <div className="card p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <Link href={`/leads/${visit.lead_id}`} className="text-sm font-medium text-ink-900 hover:text-brand-600">
            {visit.leads?.full_name ?? "Customer"}
          </Link>
          <p className="text-xs text-ink-400">{visit.properties?.title ?? "No property linked"}{visit.properties?.location ? ` · ${visit.properties.location}` : ""}</p>
          <p className="mt-1 text-xs font-medium text-ink-700">
            {formatDate(visit.visit_date)}{visit.visit_time ? ` · ${formatTime(visit.visit_time)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={visit.status} />
          {visit.outcome && <StatusBadge status={visit.outcome} />}
        </div>
      </div>

      {!readOnly && (
        <div className="mt-3 border-t border-surface-border pt-3">
          {completing ? (
            <div className="flex flex-wrap items-center gap-2">
              <select className="input w-48" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                <option value="">Select outcome</option>
                {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button
                className="btn-primary px-3 py-1.5 text-sm"
                disabled={!outcome || busy}
                onClick={() => markStatus("COMPLETED", outcome)}
              >
                Save
              </button>
              <button className="btn-secondary px-3 py-1.5 text-sm" onClick={() => setCompleting(false)}>Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="btn-secondary px-3 py-1.5 text-sm" disabled={busy} onClick={() => setCompleting(true)}>
                Mark Completed
              </button>
              <button className="btn-secondary px-3 py-1.5 text-sm" disabled={busy} onClick={() => markStatus("CANCELLED")}>
                Cancel Visit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
