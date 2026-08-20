"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyFormDrawer } from "@/components/properties/PropertyFormDrawer";
import { formatFullINR } from "@/lib/utils";
import type { Property, Lead } from "@/lib/types";

export function PropertyDetailClient({
  property,
  interestedLeads,
}: {
  property: Property;
  interestedLeads: Lead[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div>
      <Link href="/properties" className="text-xs font-medium text-ink-400 hover:text-brand-600">
        ← Back to properties
      </Link>

      <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-ink-900">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="mt-1 text-sm text-ink-600">
            {property.bhk ? `${property.bhk} · ` : ""}
            {property.property_type} · {property.location}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => setEditOpen(true)}>Edit Property</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Field label="Price" value={formatFullINR(property.price)} />
              <Field label="Area" value={property.area_sqft ? `${property.area_sqft} sqft` : "—"} />
              <Field label="Floor" value={property.floor ? `${property.floor}${property.total_floors ? ` / ${property.total_floors}` : ""}` : "—"} />
              <Field label="Furnishing" value={property.furnishing} />
              <Field label="Possession" value={property.possession_status || "—"} />
              <Field label="Owner / Developer" value={property.owner_developer || "—"} />
            </div>
            {property.address && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="text-xs font-medium text-ink-400">Address</p>
                <p className="mt-1 text-sm text-ink-700">{property.address}</p>
              </div>
            )}
            {property.description && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="text-xs font-medium text-ink-400">Description</p>
                <p className="mt-1 text-sm text-ink-700">{property.description}</p>
              </div>
            )}
            {property.notes && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="text-xs font-medium text-ink-400">Notes</p>
                <p className="mt-1 text-sm text-ink-700">{property.notes}</p>
              </div>
            )}
          </section>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600">
            Matching Leads ({interestedLeads.length})
          </h2>
          {interestedLeads.length > 0 ? (
            <div className="card divide-y divide-surface-border">
              {interestedLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block px-4 py-3 hover:bg-surface-muted">
                  <p className="text-sm font-medium text-ink-900">{lead.full_name}</p>
                  <p className="text-xs text-ink-400">{lead.phone}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No leads match this property yet." />
          )}
        </div>
      </div>

      <PropertyFormDrawer open={editOpen} onClose={() => setEditOpen(false)} property={property} />
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
