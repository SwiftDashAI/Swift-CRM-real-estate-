"use client";

import { buildTelLink, buildWhatsAppLink } from "@/lib/utils";

export function ContactActions({
  phone,
  message,
  size = "md",
}: {
  phone: string;
  message: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <a
        href={buildTelLink(phone)}
        className={`btn-secondary ${padding}`}
        title="Call"
      >
        Call
      </a>
      <a
        href={buildWhatsAppLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 font-medium text-white hover:bg-emerald-700 ${padding}`}
        title="Open WhatsApp with a pre-filled message — you still tap Send"
      >
        Open WhatsApp
      </a>
    </div>
  );
}
