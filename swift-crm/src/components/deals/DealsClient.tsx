"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { DealFormDrawer } from "@/components/deals/DealFormDrawer";
import { formatDate, formatINR } from "@/lib/utils";
import type { Deal, Lead, Property } from "@/lib/types";

export function DealsClient({
  deals,
  leads,
  properties,
}: {
  deals: Deal[];
  leads: Lead[];
  properties: Property[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const activeDeals = deals.filter((d) => d.status !== "LOST");
  const expected = activeDeals.reduce((s, d) => s + (Number(d.deal_value) * Number(d.commission_percent)) / 100, 0);
  const received = deals.reduce((s, d) => s + Number(d.commission_received), 0);
  const pending = expected - received;

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Deals</h1>
          <p className="mt-1 text-sm text-ink-600">{deals.length} deals tracked</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingDeal(null); setDrawerOpen(true); }}>
          + New Deal
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <MetricCard label="Expected Commission" value={formatINR(expected)} accent="brand" />
        <MetricCard label="Received" value={formatINR(received)} />
        <MetricCard label="Pending" value={formatINR(pending)} accent="amber" />
      </div>

      {deals.length === 0 ? (
        <EmptyState message="No deals yet." hint="Create a deal once a lead is close to closing." />
      ) : (
        <div className="space-y-3">
          {deals.map((d) => (
            <button
              key={d.id}
              onClick={() => { setEditingDeal(d); setDrawerOpen(true); }}
              className="card flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{d.leads?.full_name ?? "Lead"}</p>
                <p className="text-xs text-ink-400">{d.properties?.title ?? "No property linked"}</p>
                <p className="mt-1 text-xs text-ink-600">
                  Deal value {formatINR(d.deal_value)} · {d.commission_percent}% commission
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-600">
                    {formatINR((Number(d.deal_value) * Number(d.commission_percent)) / 100)}
                  </p>
                  <p className="text-xs text-ink-400">{d.closing_date ? formatDate(d.closing_date) : "No closing date"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={d.status} />
                  <StatusBadge status={d.payment_status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <DealFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        leads={leads}
        properties={properties}
        deal={editingDeal}
      />
    </div>
  );
}
