// Hand-written types matching supabase/schema.sql.
// (If you prefer, generate these with `supabase gen types typescript`
// and this file becomes a drop-in replacement.)

export type LeadSource =
  | "Website" | "Instagram" | "Facebook" | "WhatsApp" | "Referral" | "Walk-in" | "Call" | "Other";

export type LeadStatus =
  | "NEW" | "CONTACTED" | "QUALIFIED" | "SITE_VISIT" | "NEGOTIATION" | "WON" | "LOST";

export type PropertyType =
  | "Apartment" | "Villa" | "Plot" | "Commercial" | "Office" | "Shop" | "Other";

export type PropertyStatus = "AVAILABLE" | "HOLD" | "SOLD" | "RENTED";

export type Furnishing = "Fully Furnished" | "Semi Furnished" | "Unfurnished";

export type FollowupStatus = "PENDING" | "COMPLETED" | "RESCHEDULED";

export type SiteVisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export type SiteVisitOutcome = "Interested" | "Negotiation" | "Not Interested" | "Follow-up Required";

export type DealStatus = "NEGOTIATION" | "WON" | "LOST";

export type PaymentStatus = "PENDING" | "PARTIAL" | "RECEIVED";

export type ExpenseCategory =
  | "Advertising" | "Travel" | "Office" | "Marketing" | "Brokerage" | "Salary" | "Other";

export interface Profile {
  id: string;
  full_name: string;
  agency_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  property_type: PropertyType;
  bhk: string | null;
  preferred_location: string | null;
  min_budget: number | null;
  max_budget: number | null;
  notes: string | null;
  status: LeadStatus;
  assigned_agent: string | null;
  next_followup_date: string | null;
  next_followup_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  title: string;
  property_type: PropertyType;
  bhk: string | null;
  location: string;
  address: string | null;
  area_sqft: number | null;
  price: number;
  floor: string | null;
  total_floors: string | null;
  furnishing: Furnishing;
  possession_status: string | null;
  status: PropertyStatus;
  owner_developer: string | null;
  description: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: string;
  user_id: string;
  lead_id: string;
  purpose: string;
  due_date: string;
  due_time: string | null;
  status: FollowupStatus;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, "id" | "full_name" | "phone">;
}

export interface SiteVisit {
  id: string;
  user_id: string;
  lead_id: string;
  property_id: string | null;
  visit_date: string;
  visit_time: string | null;
  assigned_agent: string | null;
  status: SiteVisitStatus;
  outcome: SiteVisitOutcome | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, "id" | "full_name" | "phone">;
  properties?: Pick<Property, "id" | "title" | "location">;
}

export interface Deal {
  id: string;
  user_id: string;
  lead_id: string;
  property_id: string | null;
  deal_value: number;
  commission_percent: number;
  commission_received: number;
  payment_status: PaymentStatus;
  status: DealStatus;
  closing_date: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, "id" | "full_name" | "phone">;
  properties?: Pick<Property, "id" | "title">;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string | null;
  type: string;
  description: string;
  created_at: string;
}

// Minimal placeholder so `@supabase/ssr` generics have something to bind to.
// Not a full generated schema — fine for an MVP.
export type Database = any;
