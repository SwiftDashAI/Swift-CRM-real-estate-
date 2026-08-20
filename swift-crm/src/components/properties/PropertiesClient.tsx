"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyFormDrawer } from "@/components/properties/PropertyFormDrawer";
import { formatINR } from "@/lib/utils";
import type { Property } from "@/lib/types";

const STATUS_FILTERS = ["All", "Available", "Hold", "Sold", "Rented"];
const FILTER_TO_STATUS: Record<string, string | null> = {
  All: null,
  Available: "AVAILABLE",
  Hold: "HOLD",
  Sold: "SOLD",
  Rented: "RENTED",
};

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const status = FILTER_TO_STATUS[filter];
    return properties.filter((p) => {
      if (status && p.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    });
  }, [properties, filter, query]);

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Properties</h1>
          <p className="mt-1 text-sm text-ink-600">{properties.length} properties in inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
          + Add Property
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by title or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
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
          message={properties.length === 0 ? "No properties added yet." : "No properties match your search."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="card block overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink-900">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-xs text-ink-400">
                  {p.bhk ? `${p.bhk} · ` : ""}
                  {p.property_type} · {p.location}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand-600">{formatINR(p.price)}</span>
                  {p.area_sqft && <span className="text-xs text-ink-400">{p.area_sqft} sqft</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PropertyFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
