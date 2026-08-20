"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactActions } from "@/components/ContactActions";
import { FollowupActions } from "@/components/followups/FollowupActions";
import { LeadFormDrawer } from "@/components/leads/LeadFormDrawer";
import { formatDate, formatINR, formatTime } from "@/lib/utils";
import type { Lead, Property, Followup, SiteVisit, Activity } from "@/lib/types";

export function LeadDetailClient({
  lead,
  agentName,
  pendingFollowup,
  matches,
  siteVisits,
  activities,
}: {
  lead: Lead;
  agentName: string;
  pendingFollowup: Followup | null;
  matches: Property[];
  siteVisits: SiteVisit[];
  activities: Activity[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div>
      <Link href="/leads" className="text-xs font-medium text-ink-400 hover:text-brand-600">
        ← Back to leads
      </Link>

      <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-ink-900">{lead.full_name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-ink-600">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <ContactActions
            phone={lead.phone}
            message={`Hi ${lead.full_name.split(" ")[0]}, this is ${agentName} from Swift CRM. Just following up regarding your property requirement.`}
          />
          <button className="btn-secondary" onClick={() => setEditOpen(true)}>Edit Lead</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Customer Requirement</h2>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Field label="Property" value={lead.property_type} />
              <Field label="BHK" value={lead.bhk || "—"} />
              <Field label="Location" value={lead.preferred_location || "—"} />
              <Field label="Budget" value={`${formatINR(lead.min_budget)} – ${formatINR(lead.max_budget)}`} />
            </div>
            {lead.notes && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="text-xs font-medium text-ink-400">Notes</p>
                <p className="mt-1 text-sm text-ink-700">{lead.notes}</p>
              </div>
            )}
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Follow-up</h2>
            {pendingFollowup ? (
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {formatDate(pendingFollowup.due_date)}
                    {pendingFollowup.due_time ? ` · ${formatTime(pendingFollowup.due_time)}` : ""}
                  </p>
                  <p className="text-xs text-ink-400">{pendingFollowup.purpose}</p>
                </div>
                <FollowupActions followupId={pendingFollowup.id} leadId={lead.id} leadName={lead.full_name} />
              </div>
            ) : (
              <EmptyState message="No pending follow-up." hint="Edit this lead to schedule one." />
            )}
          </section>

          <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-600">Matching Properties</h2>
              <span className="text-xs text-ink-400">
                {matches.length} propert{matches.length === 1 ? "y matches" : "ies match"} this requirement
              </span>
            </div>
            {matches.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {matches.map((p) => (
                  <Link key={p.id} href={`/properties/${p.id}`} className="rounded-lg border border-surface-border p-3 hover:bg-surface-muted">
                    <p className="text-sm font-medium text-ink-900">{p.title}</p>
                    <p className="text-xs text-ink-400">{p.bhk ? `${p.bhk} · ` : ""}{p.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-600">{formatINR(p.price)}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState message="No matching properties yet." hint="Add properties with this location, BHK, and budget range." />
            )}
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Site Visits</h2>
            {siteVisits.length > 0 ? (
              <div className="divide-y divide-surface-border">
                {siteVisits.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-ink-900">{v.properties?.title ?? "Property"}</p>
                      <p className="text-xs text-ink-400">{formatDate(v.visit_date)}{v.visit_time ? ` · ${formatTime(v.visit_time)}` : ""}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No site visits scheduled." />
            )}
          </section>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Activity Timeline</h2>
          {activities.length > 0 ? (
            <div className="card divide-y divide-surface-border">
              {activities.map((a) => (
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

      <LeadFormDrawer open={editOpen} onClose={() => setEditOpen(false)} lead={lead} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-0.5 font-medium text-ink-900">{value}</p>
    </div>
  );
}
