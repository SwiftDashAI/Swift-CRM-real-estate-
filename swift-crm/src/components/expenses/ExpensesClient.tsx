"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExpenseFormDrawer } from "@/components/expenses/ExpenseFormDrawer";
import { formatDate, formatINR } from "@/lib/utils";
import type { Expense } from "@/lib/types";

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { thisMonthTotal, byCategory } = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonth = expenses.filter((e) => e.expense_date.startsWith(monthKey));
    const total = thisMonth.reduce((s, e) => s + Number(e.amount), 0);

    const cats: Record<string, number> = {};
    for (const e of thisMonth) {
      cats[e.category] = (cats[e.category] ?? 0) + Number(e.amount);
    }
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);

    return { thisMonthTotal: total, byCategory: sorted };
  }, [expenses]);

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Expenses</h1>
          <p className="mt-1 text-sm text-ink-600">Track basic business spend — nothing fancy.</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>+ Add Expense</button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <MetricCard label="This Month's Expenses" value={formatINR(thisMonthTotal)} accent="brand" />
        <div className="card p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-400">By Category</div>
          {byCategory.length === 0 ? (
            <p className="mt-2 text-sm text-ink-400">No expenses this month yet.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {byCategory.map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{cat}</span>
                  <span className="font-medium text-ink-900">{formatINR(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState message="No expenses recorded yet." />
      ) : (
        <div className="card divide-y divide-surface-border">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-900">{e.title}</p>
                <p className="text-xs text-ink-400">{e.category} · {formatDate(e.expense_date)}</p>
              </div>
              <p className="text-sm font-semibold text-ink-900">{formatINR(e.amount)}</p>
            </div>
          ))}
        </div>
      )}

      <ExpenseFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
