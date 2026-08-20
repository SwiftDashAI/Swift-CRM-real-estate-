import { STATUS_LABELS } from "@/lib/utils";

const COLORS: Record<string, string> = {
  NEW: "bg-brand-50 text-brand-700 border-brand-200",
  CONTACTED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  QUALIFIED: "bg-brand-100 text-brand-700 border-brand-200",
  SITE_VISIT: "bg-amber-50 text-amber-700 border-amber-200",
  NEGOTIATION: "bg-purple-50 text-purple-700 border-purple-200",
  WON: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOST: "bg-ink-100 text-ink-600 border-surface-border",

  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HOLD: "bg-amber-50 text-amber-700 border-amber-200",
  SOLD: "bg-ink-100 text-ink-600 border-surface-border",
  RENTED: "bg-cyan-50 text-cyan-700 border-cyan-200",

  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RESCHEDULED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  SCHEDULED: "bg-brand-50 text-brand-700 border-brand-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? "bg-surface-muted text-ink-600 border-surface-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
