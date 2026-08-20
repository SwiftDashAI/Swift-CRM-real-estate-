"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Drawer } from "@/components/ui/Drawer";
import type { Lead, Property } from "@/lib/types";

export function SiteVisitFormDrawer({
  open,
  onClose,
  leads,
  properties,
}: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  properties: Property[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    lead_id: "",
    property_id: "",
    visit_date: "",
    visit_time: "",
    assigned_agent: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.lead_id) return setError("Select a lead.");
    if (!form.visit_date) return setError("Select a visit date.");

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { data: visit, error: insertError } = await supabase
      .from("site_visits")
      .insert({
        user_id: user.id,
        lead_id: form.lead_id,
        property_id: form.property_id || null,
        visit_date: form.visit_date,
        visit_time: form.visit_time || null,
        assigned_agent: form.assigned_agent.trim() || null,
        notes: form.notes.trim() || null,
        status: "SCHEDULED",
      })
      .select()
      .single();

    if (!insertError && visit) {
      const lead = leads.find((l) => l.id === form.lead_id);
      await supabase.from("activities").insert({
        user_id: user.id,
        lead_id: form.lead_id,
        type: "site_visit_scheduled",
        description: `Site visit scheduled for ${lead?.full_name ?? "lead"}`,
      });
    } else if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setForm({ lead_id: "", property_id: "", visit_date: "", visit_time: "", assigned_agent: "", notes: "" });
    onClose();
    router.refresh();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Schedule Site Visit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Lead *</label>
          <select className="input" value={form.lead_id} onChange={(e) => update("lead_id", e.target.value)}>
            <option value="">Select a lead</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Property</label>
          <select className="input" value={form.property_id} onChange={(e) => update("property_id", e.target.value)}>
            <option value="">Select a property (optional)</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.visit_date} onChange={(e) => update("visit_date", e.target.value)} />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" className="input" value={form.visit_time} onChange={(e) => update("visit_time", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Assigned agent</label>
          <input className="input" value={form.assigned_agent} onChange={(e) => update("assigned_agent", e.target.value)} placeholder="You" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving…" : "Schedule visit"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
