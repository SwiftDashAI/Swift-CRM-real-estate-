export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-cyan-500 text-sm font-bold text-white">
        S
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            SwiftDash AI
          </div>
          <div className="text-base font-semibold text-ink-900">Swift CRM</div>
        </div>
      )}
    </div>
  );
}
