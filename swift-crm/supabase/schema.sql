-- =========================================================
-- SWIFT CRM — Supabase schema
-- Run this once in the Supabase SQL editor (or via CLI).
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PROFILES  (one row per authenticated user)
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  agency_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  source text not null default 'Other'
    check (source in ('Website','Instagram','Facebook','WhatsApp','Referral','Walk-in','Call','Other')),
  property_type text not null default 'Apartment'
    check (property_type in ('Apartment','Villa','Plot','Commercial','Office','Shop','Other')),
  bhk text,
  preferred_location text,
  min_budget numeric(14,2) check (min_budget is null or min_budget >= 0),
  max_budget numeric(14,2) check (max_budget is null or max_budget >= 0),
  notes text,
  status text not null default 'NEW'
    check (status in ('NEW','CONTACTED','QUALIFIED','SITE_VISIT','NEGOTIATION','WON','LOST')),
  assigned_agent text,
  next_followup_date date,
  next_followup_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_order check (min_budget is null or max_budget is null or min_budget <= max_budget)
);

create index if not exists idx_leads_user on leads(user_id);
create index if not exists idx_leads_status on leads(user_id, status);
create index if not exists idx_leads_followup on leads(user_id, next_followup_date);

-- ---------------------------------------------------------
-- PROPERTIES
-- ---------------------------------------------------------
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  property_type text not null default 'Apartment'
    check (property_type in ('Apartment','Villa','Plot','Commercial','Office','Shop','Other')),
  bhk text,
  location text not null,
  address text,
  area_sqft numeric(10,2) check (area_sqft is null or area_sqft >= 0),
  price numeric(14,2) not null check (price >= 0),
  floor text,
  total_floors text,
  furnishing text default 'Unfurnished'
    check (furnishing in ('Fully Furnished','Semi Furnished','Unfurnished')),
  possession_status text,
  status text not null default 'AVAILABLE'
    check (status in ('AVAILABLE','HOLD','SOLD','RENTED')),
  owner_developer text,
  description text,
  notes text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_user on properties(user_id);
create index if not exists idx_properties_status on properties(user_id, status);
create index if not exists idx_properties_location on properties(user_id, location);

-- ---------------------------------------------------------
-- FOLLOWUPS
-- ---------------------------------------------------------
create table if not exists followups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  purpose text not null default 'General follow-up',
  due_date date not null,
  due_time time,
  status text not null default 'PENDING'
    check (status in ('PENDING','COMPLETED','RESCHEDULED')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_followups_user on followups(user_id);
create index if not exists idx_followups_lead on followups(lead_id);
create index if not exists idx_followups_due on followups(user_id, due_date, status);

-- ---------------------------------------------------------
-- SITE VISITS
-- ---------------------------------------------------------
create table if not exists site_visits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  visit_date date not null,
  visit_time time,
  assigned_agent text,
  status text not null default 'SCHEDULED'
    check (status in ('SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED')),
  outcome text
    check (outcome is null or outcome in ('Interested','Negotiation','Not Interested','Follow-up Required')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sitevisits_user on site_visits(user_id);
create index if not exists idx_sitevisits_date on site_visits(user_id, visit_date, status);

-- ---------------------------------------------------------
-- DEALS
-- ---------------------------------------------------------
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  deal_value numeric(14,2) not null check (deal_value >= 0),
  commission_percent numeric(5,2) not null check (commission_percent >= 0 and commission_percent <= 100),
  commission_received numeric(14,2) not null default 0 check (commission_received >= 0),
  payment_status text not null default 'PENDING'
    check (payment_status in ('PENDING','PARTIAL','RECEIVED')),
  status text not null default 'NEGOTIATION'
    check (status in ('NEGOTIATION','WON','LOST')),
  closing_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deals_user on deals(user_id);
create index if not exists idx_deals_status on deals(user_id, status);

-- ---------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Other'
    check (category in ('Advertising','Travel','Office','Marketing','Brokerage','Salary','Other')),
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_user on expenses(user_id, expense_date);

-- ---------------------------------------------------------
-- ACTIVITIES (lightweight timeline)
-- ---------------------------------------------------------
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_lead on activities(lead_id, created_at desc);
create index if not exists idx_activities_user on activities(user_id, created_at desc);

-- ---------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated on leads;
create trigger trg_leads_updated before update on leads
  for each row execute procedure set_updated_at();

drop trigger if exists trg_properties_updated on properties;
create trigger trg_properties_updated before update on properties
  for each row execute procedure set_updated_at();

drop trigger if exists trg_followups_updated on followups;
create trigger trg_followups_updated before update on followups
  for each row execute procedure set_updated_at();

drop trigger if exists trg_sitevisits_updated on site_visits;
create trigger trg_sitevisits_updated before update on site_visits
  for each row execute procedure set_updated_at();

drop trigger if exists trg_deals_updated on deals;
create trigger trg_deals_updated before update on deals
  for each row execute procedure set_updated_at();

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute procedure set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- Every table is scoped strictly to auth.uid() = user_id.
-- =========================================================

alter table profiles enable row level security;
alter table leads enable row level security;
alter table properties enable row level security;
alter table followups enable row level security;
alter table site_visits enable row level security;
alter table deals enable row level security;
alter table expenses enable row level security;
alter table activities enable row level security;

-- PROFILES: a user can only see/edit their own profile row
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Generic pattern for the rest: user_id must equal auth.uid()
create policy "leads_select_own" on leads for select using (auth.uid() = user_id);
create policy "leads_insert_own" on leads for insert with check (auth.uid() = user_id);
create policy "leads_update_own" on leads for update using (auth.uid() = user_id);
create policy "leads_delete_own" on leads for delete using (auth.uid() = user_id);

create policy "properties_select_own" on properties for select using (auth.uid() = user_id);
create policy "properties_insert_own" on properties for insert with check (auth.uid() = user_id);
create policy "properties_update_own" on properties for update using (auth.uid() = user_id);
create policy "properties_delete_own" on properties for delete using (auth.uid() = user_id);

create policy "followups_select_own" on followups for select using (auth.uid() = user_id);
create policy "followups_insert_own" on followups for insert with check (auth.uid() = user_id);
create policy "followups_update_own" on followups for update using (auth.uid() = user_id);
create policy "followups_delete_own" on followups for delete using (auth.uid() = user_id);

create policy "sitevisits_select_own" on site_visits for select using (auth.uid() = user_id);
create policy "sitevisits_insert_own" on site_visits for insert with check (auth.uid() = user_id);
create policy "sitevisits_update_own" on site_visits for update using (auth.uid() = user_id);
create policy "sitevisits_delete_own" on site_visits for delete using (auth.uid() = user_id);

create policy "deals_select_own" on deals for select using (auth.uid() = user_id);
create policy "deals_insert_own" on deals for insert with check (auth.uid() = user_id);
create policy "deals_update_own" on deals for update using (auth.uid() = user_id);
create policy "deals_delete_own" on deals for delete using (auth.uid() = user_id);

create policy "expenses_select_own" on expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on expenses for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on expenses for delete using (auth.uid() = user_id);

create policy "activities_select_own" on activities for select using (auth.uid() = user_id);
create policy "activities_insert_own" on activities for insert with check (auth.uid() = user_id);
create policy "activities_delete_own" on activities for delete using (auth.uid() = user_id);
