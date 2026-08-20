"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function SettingsClient({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile.full_name);
  const [agencyName, setAgencyName] = useState(profile.agency_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        agency_name: agencyName.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-ink-900">Settings</h1>
      <p className="mt-1 text-sm text-ink-600">Manage your profile.</p>

      <form onSubmit={handleSave} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Agency name</label>
          <input className="input" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g. Sharma Realty" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-surface-muted" value={email} disabled />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-xs font-medium text-emerald-600">Saved</span>}
        </div>
      </form>

      <button onClick={handleLogout} className="btn-secondary mt-4">Log out</button>
    </div>
  );
}
