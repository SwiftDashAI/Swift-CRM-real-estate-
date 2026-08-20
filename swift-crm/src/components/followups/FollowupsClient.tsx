"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactActions } from "@/components/ContactActions";
import { FollowupActions } from "@/components/followups/FollowupActions";
import { formatDate, formatTime, isOverdue, isToday } from "@/lib/utils";
import type { Followup } from "@/lib/types";

type Section = "overdue" | "today" | "upcoming" | "completed";

export function FollowupsClient({ followups, agentName, initialFilter }: {
  followups: Followup[];
  agentName: string;
  initialFilter?: string;
}) {
  const [tab, setTab] = useState<Section>(
    initialFilter === "overdue" || initialFilter === "today" ? initialFilter : "overdue"
  );

  const grouped = useMemo(() => {
    const overdue: Followup[] = [];
    const today: Followup[] = [];
    const upcoming: Followup[] = [];
    const completed: Followup[] = [];

    for (const f of followups) {
      if (f.status === "COMPLETED") {
        completed.push(f);
      } else if (isOverdue(f.due_date)) {
        overdue.push(f);
      } else if (isToday(f.due_date)) {
        today.push(f);
      } else if (f.status === "PENDING") {
        upcoming.push(f);
      }
    }
    return { overdue, today, upcoming, completed };
  }, [followups]);

  const TABS: { key: Section; label: string; count: number }[] = [
    { key: "overdue", label: "Overdue", count: grouped.overdue.length },
    { key: "today", label: "Today", count: grouped.today.length },
    { key: "upcoming", label: "Upcoming", count: grouped.upcoming.length },
    { key: "completed", label: "Completed", count: grouped.completed.length },
  ];

  const active = grouped[tab];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-ink-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-ink-600">Never lose track of a customer conversation.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.key
                ? t.key === "overdue"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-brand-600 bg-brand-600 text-white"
                : "border-surface-border bg-white text-ink-600 hover:bg-surface-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {active.length === 0 ? (
        <EmptyState message={tab === "overdue" ? "No overdue follow-ups 🎉" : `No ${tab} follow-ups.`} />
      ) : (
        <div className="space-y-3">
          {active.map((f) => (
            <div
              key={f.id}
              className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                tab === "overdue" ? "border-red-200 bg-red-50/40" : tab === "today" ? "border-brand-200" : ""
              }`}
            >
              <div>
                <Link href={`/leads/${f.leads?.id}`} className="text-sm font-medium text-ink-900 hover:text-brand-600">
                  {f.leads?.full_name ?? "Customer"}
                </Link>
                <p className="text-xs text-ink-400">{f.leads?.phone}</p>
                <p className="mt-1 text-xs text-ink-600">{f.purpose}</p>
                <p className="mt-0.5 text-xs font-medium text-ink-700">
                  {formatDate(f.due_date)}{f.due_time ? ` · ${formatTime(f.due_time)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {f.leads?.phone && (
                  <ContactActions
                    phone={f.leads.phone}
                    message={`Hi ${f.leads.full_name.split(" ")[0]}, this is ${agentName} from Swift CRM. Just following up regarding your property requirement.`}
                    size="sm"
                  />
                )}
                {f.status === "PENDING" && (
                  <FollowupActions followupId={f.id} leadId={f.lead_id} leadName={f.leads?.full_name ?? "Customer"} size="sm" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
