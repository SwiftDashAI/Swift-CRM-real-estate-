"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactActions } from "@/components/ContactActions";
import { LeadFormDrawer } from "@/components/leads/LeadFormDrawer";
import { formatDate, formatINR, isOverdue } from "@/lib/utils";
import type { Lead } from "@/lib/types";

const FILTERS = ["All", "New", "Contacted", "Qualified", "Site Visit", "Negotiation", "Won", "Lost"];
const FILTER_TO_STATUS: Record<string, string | null> = {
  All: null,
  New: "NEW",
  Contacted: "CONTACTED",
  Qualified: "QUALIFIED",
  "Site Visit": "SITE_VISIT",
  Negotiation: "NEGOTIATION",
  Won: "WON",
  Lost: "LOST",
};

export function LeadsClient({ leads, agentName }: { leads: Lead[]; agentName: string }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const status = FILTER_TO_STATUS[filter];
    return leads.filter((l) => {
      if (status && l.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        l.full_name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.preferred_location ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, filter, query]);

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Leads</h1>
          <p className="mt-1 text-sm text-ink-600">{leads.length} total leads</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
          + New Lead
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name, phone, location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-surface-border bg-white text-ink-600 hover:bg-surface-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={leads.length === 0 ? "No leads yet." : "No leads match your search."}
          hint={leads.length === 0 ? "Create your first lead to get started." : undefined}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Follow-up</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                        {lead.full_name}
                      </Link>
                      <div className="text-xs text-ink-400">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {lead.bhk ? `${lead.bhk} ` : ""}
                      {lead.property_type}
                      {lead.preferred_location ? ` · ${lead.preferred_location}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatINR(lead.min_budget)}–{formatINR(lead.max_budget)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className={`px-4 py-3 ${isOverdue(lead.next_followup_date) ? "text-red-600 font-medium" : "text-ink-600"}`}>
                      {lead.next_followup_date ? formatDate(lead.next_followup_date) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ContactActions
                        phone={lead.phone}
                        message={`Hi ${lead.full_name.split(" ")[0]}, this is ${agentName} from Swift CRM. Just following up regarding your property requirement.`}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="card block p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink-900">{lead.full_name}</p>
                    <p className="text-xs text-ink-400">{lead.phone}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="mt-2 text-xs text-ink-600">
                  {lead.bhk ? `${lead.bhk} ` : ""}
                  {lead.property_type}
                  {lead.preferred_location ? ` · ${lead.preferred_location}` : ""} ·{" "}
                  {formatINR(lead.min_budget)}–{formatINR(lead.max_budget)}
                </p>
                <p className={`mt-1 text-xs ${isOverdue(lead.next_followup_date) ? "font-medium text-red-600" : "text-ink-400"}`}>
                  Next follow-up: {lead.next_followup_date ? formatDate(lead.next_followup_date) : "—"}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      <LeadFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
