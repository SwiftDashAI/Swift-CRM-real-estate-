export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, "")}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatFullINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return dateStr < todayISO();
}

export function isToday(dateStr: string | null | undefined): boolean {
  return dateStr === todayISO();
}

/**
 * Builds a wa.me deep link with a pre-filled message.
 * This ONLY opens WhatsApp with the message ready to send —
 * the agent still has to tap Send. No automation happens.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  const withCountryCode = digitsOnly.startsWith("91") || digitsOnly.length > 10
    ? digitsOnly
    : `91${digitsOnly}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function buildTelLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

// ---------------------------------------------------------
// Deterministic lead <-> property matching (NO AI).
// Matches on property type, BHK, location, and budget overlap.
// ---------------------------------------------------------
export function isMatch(
  lead: {
    property_type: string;
    bhk: string | null;
    preferred_location: string | null;
    min_budget: number | null;
    max_budget: number | null;
  },
  property: {
    property_type: string;
    bhk: string | null;
    location: string;
    price: number;
    status: string;
  }
): boolean {
  if (property.status !== "AVAILABLE") return false;
  if (lead.property_type !== property.property_type) return false;

  if (lead.bhk && property.bhk && lead.bhk.trim() !== property.bhk.trim()) return false;

  if (lead.preferred_location) {
    const a = lead.preferred_location.trim().toLowerCase();
    const b = property.location.trim().toLowerCase();
    if (!a.includes(b) && !b.includes(a)) return false;
  }

  if (lead.min_budget !== null && property.price < lead.min_budget) return false;
  if (lead.max_budget !== null && property.price > lead.max_budget) return false;

  return true;
}

// ---------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNonNegativeNumber(value: string | number): boolean {
  const n = typeof value === "string" ? Number(value) : value;
  return !Number.isNaN(n) && n >= 0;
}

export const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SITE_VISIT: "Site Visit",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
  AVAILABLE: "Available",
  HOLD: "Hold",
  SOLD: "Sold",
  RENTED: "Rented",
  PENDING: "Pending",
  COMPLETED: "Completed",
  RESCHEDULED: "Rescheduled",
  SCHEDULED: "Scheduled",
  CANCELLED: "Cancelled",
  PARTIAL: "Partial",
  RECEIVED: "Received",
};
