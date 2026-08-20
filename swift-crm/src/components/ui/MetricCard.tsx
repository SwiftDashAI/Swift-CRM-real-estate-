export function MetricCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string | number;
  accent?: "default" | "brand" | "red" | "amber";
}) {
  const valueColor =
    accent === "brand"
      ? "text-brand-600"
      : accent === "red"
      ? "text-red-600"
      : accent === "amber"
      ? "text-amber-600"
      : "text-ink-900";

  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}
