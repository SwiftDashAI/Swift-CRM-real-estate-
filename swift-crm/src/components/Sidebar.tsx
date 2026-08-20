"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/leads", label: "Leads", icon: "☰" },
  { href: "/properties", label: "Properties", icon: "⌂" },
  { href: "/followups", label: "Follow-ups", icon: "◔" },
  { href: "/site-visits", label: "Site Visits", icon: "◎" },
  { href: "/deals", label: "Deals", icon: "◆" },
  { href: "/expenses", label: "Expenses", icon: "▤" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const NavLinks = (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-surface-muted hover:text-ink-900"
            }`}
          >
            <span className="w-4 text-center text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-surface-border bg-white px-4 py-3 md:hidden">
        <Logo compact />
        <button
          className="rounded-md border border-surface-border px-3 py-1.5 text-sm"
          onClick={() => setMobileOpen(true)}
        >
          Menu
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-ink-900/30" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col bg-white p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-ink-400">✕</button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">{NavLinks}</nav>
            <button onClick={handleLogout} className="btn-ghost mt-4 justify-start">
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-surface-border bg-white md:flex">
        <div className="border-b border-surface-border px-5 py-5">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">{NavLinks}</nav>
        <div className="border-t border-surface-border px-3 py-4">
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-surface-muted hover:text-ink-900">
            <span className="w-4 text-center">⚙</span> Settings
          </Link>
          <div className="mt-2 flex items-center justify-between px-3">
            <span className="truncate text-xs text-ink-400">{userName}</span>
            <button onClick={handleLogout} className="text-xs font-medium text-ink-600 hover:text-brand-600">
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
