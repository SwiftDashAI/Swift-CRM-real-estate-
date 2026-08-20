"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Drawer } from "@/components/ui/Drawer";
import { formatINR, isNonNegativeNumber } from "@/lib/utils";
import type { Lead, Property, Deal, PaymentStatus, DealStatus } from "@/lib/types";

const PAYMENT_STATUSES = ["PENDING", "PARTIAL", "RECEIVED"];
const DEAL_STATUSES = ["NEGOTIATION", "WON", "LOST"];

export function DealFormDrawer({
  open,
  onClose,
  leads,
  properties,
  deal,
}: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  properties: Property[];
  deal?: Deal | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!deal;

  const [form, setForm] = useState({
    lead_id: deal?.lead_id ?? "",
    property_id: deal?.property_id ?? "",
    deal_value: deal?.deal_value?.toString() ?? "",
    commission_percent: deal?.commission_percent?.toString() ?? "2",
    commission_received: deal?.commission_received?.toString() ?? "0",
    payment_status: (deal?.payment_status ?? "PENDING") as PaymentStatus,
    status: (deal?.status ?? "NEGOTIATION") as DealStatus,
    closing_date: deal?.closing_date ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const expectedCommission = useMemo(() => {
    const val = Number(form.deal_value) || 0;
    const pct = Number(form.commission_percent) || 0;
    return (val * pct) / 100;
  }, [form.deal_value, form.commission_percent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.lead_id) return setError("Select a lead.");
    if (!form.deal_value || !isNonNegativeNumber(form.deal_value)) return setError("Enter a valid deal value.");
    if (
      !form.commission_percent ||
      Number(form.commission_percent) < 0 ||
      Number(form.commission_percent) > 100
    ) {
      return setError("Commission % must be between 0 and 100.");
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const payload = {
      lead_id: form.lead_id,
      property_id: form.property_id || null,
      deal_value: Number(form.deal_value),
      commission_percent: Number(form.commission_percent),
      commission_received: Number(form.commission_received) || 0,
      payment_status: form.payment_status,
      status: form.status,
      closing_date: form.closing_date || null,
    };

    if (isEdit && deal) {
      const { error: updateError } = await supabase.from("deals").update(payload).eq("id", deal.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      if (payload.status !== deal.status && (payload.status === "WON" || payload.status === "LOST")) {
        const lead = leads.find((l) => l.id === form.lead_id);
        await supabase.from("activities").insert({
          user_id: user.id,
          lead_id: form.lead_id,
          type: "deal_" + payload.status.toLowerCase(),
          description: `Deal marked as ${payload.status === "WON" ? "Won" : "Lost"}${lead ? ` for ${lead.full_name}` : ""}`,
        });
        await supabase.from("leads").update({ status: payload.status }).eq("id", form.lead_id);
      }
    } else {
      const { error: insertError } = await supabase.from("deals").insert({ ...payload, user_id: user.id });
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      const lead = leads.find((l) => l.id === form.lead_id);
      await supabase.from("activities").insert({
        user_id: user.id,
        lead_id: form.lead_id,
        type: "deal_created",
        description: `Deal created${lead ? ` for ${lead.full_name}` : ""}`,
      });
    }

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? "Edit Deal" : "New Deal"}>
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
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Deal value (₹) *</label>
            <input className="input" value={form.deal_value} onChange={(e) => update("deal_value", e.target.value)} placeholder="8000000" />
          </div>
          <div>
            <label className="label">Commission %</label>
            <input className="input" value={form.commission_percent} onChange={(e) => update("commission_percent", e.target.value)} placeholder="2" />
          </div>
        </div>

        <div className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700">
          Expected commission: <span className="font-semibold text-brand-600">{formatINR(expectedCommission)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Commission received (₹)</label>
            <input className="input" value={form.commission_received} onChange={(e) => update("commission_received", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Payment status</label>
            <select className="input" value={form.payment_status} onChange={(e) => update("payment_status", e.target.value as PaymentStatus)}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Deal status</label>
            <select className="input" value={form.status} onChange={(e) => update("status", e.target.value as DealStatus)}>
              {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Closing date</label>
            <input type="date" className="input" value={form.closing_date} onChange={(e) => update("closing_date", e.target.value)} />
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create deal"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
