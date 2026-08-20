export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-surface-border bg-surface-muted px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink-600">{message}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
