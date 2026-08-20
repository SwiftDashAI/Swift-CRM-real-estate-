"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FollowupActions({
  followupId,
  leadId,
  leadName,
  size = "md",
}: {
  followupId: string;
  leadId: string;
  leadName: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const supabase = createClient();
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [busy, setBusy] = useState(false);
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  async function handleComplete() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("followups")
      .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
      .eq("id", followupId);

    await supabase.from("activities").insert({
      user_id: user.id,
      lead_id: leadId,
      type: "followup_completed",
      description: `Follow-up completed for ${leadName}`,
    });

    setBusy(false);
    router.refresh();
  }

  async function handleReschedule() {
    if (!newDate) return;
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("followups")
      .update({ status: "RESCHEDULED" })
      .eq("id", followupId);

    await supabase.from("followups").insert({
      user_id: user.id,
      lead_id: leadId,
      purpose: "Rescheduled follow-up",
      due_date: newDate,
      due_time: newTime || null,
      status: "PENDING",
    });

    await supabase
      .from("leads")
      .update({ next_followup_date: newDate, next_followup_time: newTime || null })
      .eq("id", leadId);

    await supabase.from("activities").insert({
      user_id: user.id,
      lead_id: leadId,
      type: "followup_rescheduled",
      description: `Follow-up for ${leadName} rescheduled`,
    });

    setBusy(false);
    setRescheduling(false);
    router.refresh();
  }

  if (rescheduling) {
    return (
      <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <input type="date" className="input w-36" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        <input type="time" className="input w-28" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
        <button className={`btn-primary ${padding}`} disabled={busy || !newDate} onClick={handleReschedule}>
          Save
        </button>
        <button className={`btn-secondary ${padding}`} onClick={() => setRescheduling(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button className={`btn-secondary ${padding}`} disabled={busy} onClick={handleComplete}>
        Mark Complete
      </button>
      <button className={`btn-secondary ${padding}`} disabled={busy} onClick={() => setRescheduling(true)}>
        Reschedule
      </button>
    </div>
  );
}
