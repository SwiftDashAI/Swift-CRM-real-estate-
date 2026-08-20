-- =========================================================
-- SWIFT CRM — demo/sample data
--
-- 1. Sign up once in the app so an auth user + profile exist.
-- 2. In Supabase -> Authentication -> Users, copy that user's UUID.
-- 3. Replace YOUR_USER_ID below with that UUID.
-- 4. Run this file in the Supabase SQL editor.
--
-- This is clearly demo data — delete it any time from
-- Table Editor if you want a clean slate before going live.
-- =========================================================

do $$
declare
  uid uuid := 'YOUR_USER_ID'; -- <-- replace this
  lead_rahul uuid := uuid_generate_v4();
  lead_priya uuid := uuid_generate_v4();
  lead_arjun uuid := uuid_generate_v4();
  lead_sneha uuid := uuid_generate_v4();
  prop_1 uuid := uuid_generate_v4();
  prop_2 uuid := uuid_generate_v4();
  prop_3 uuid := uuid_generate_v4();
  prop_4 uuid := uuid_generate_v4();
  prop_5 uuid := uuid_generate_v4();
begin
  -- LEADS
  insert into leads (id, user_id, full_name, phone, email, source, property_type, bhk, preferred_location, min_budget, max_budget, notes, status, assigned_agent, next_followup_date, next_followup_time)
  values
    (lead_rahul, uid, 'Rahul Sharma', '+919876543210', 'rahul.sharma@example.com', 'Website', 'Apartment', '2 BHK', 'Whitefield', 5000000, 7000000, 'Wants a gated community with a gym.', 'QUALIFIED', 'You', current_date, '16:00'),
    (lead_priya, uid, 'Priya Verma', '+919876500001', 'priya.verma@example.com', 'Instagram', 'Apartment', '3 BHK', 'Indiranagar', 9000000, 12000000, 'Requested 3BHK properties near metro.', 'CONTACTED', 'You', current_date - 1, '11:00'),
    (lead_arjun, uid, 'Arjun Mehta', '+919876500002', null, 'Referral', 'Villa', '4 BHK', 'Electronic City', 15000000, 20000000, 'Referred by an existing client.', 'SITE_VISIT', 'You', current_date + 2, '10:30'),
    (lead_sneha, uid, 'Sneha Kapoor', '+919876500003', 'sneha.kapoor@example.com', 'Walk-in', 'Apartment', '2 BHK', 'Gurgaon', 4000000, 5500000, 'First-time buyer, budget conscious.', 'NEW', 'You', null, null);

  -- PROPERTIES
  insert into properties (id, user_id, title, property_type, bhk, location, address, area_sqft, price, floor, total_floors, furnishing, possession_status, status, owner_developer, description)
  values
    (prop_1, uid, 'Prestige Lakeside Habitat', 'Apartment', '2 BHK', 'Whitefield', 'ITPL Main Road, Whitefield, Bengaluru', 1180, 6500000, '7', '14', 'Semi Furnished', 'Ready to Move', 'AVAILABLE', 'Prestige Group', 'Lakeview 2BHK in a large gated township with clubhouse and pool.'),
    (prop_2, uid, 'Brigade Meadows', 'Apartment', '2 BHK', 'Whitefield', 'Kanakapura Road, Whitefield', 1050, 5800000, '3', '10', 'Unfurnished', 'Ready to Move', 'AVAILABLE', 'Brigade Group', 'Compact 2BHK, good for first-time buyers.'),
    (prop_3, uid, 'Sobha Dream Acres', 'Apartment', '3 BHK', 'Indiranagar', '100 Feet Road, Indiranagar', 1620, 10500000, '9', '18', 'Fully Furnished', 'Ready to Move', 'AVAILABLE', 'Sobha Ltd', 'Premium 3BHK walking distance to the metro.'),
    (prop_4, uid, 'Godrej Woodscapes Villa', 'Villa', '4 BHK', 'Electronic City', 'Hosur Road, Electronic City', 3200, 18500000, 'G+2', 'G+2', 'Semi Furnished', 'Under Construction', 'AVAILABLE', 'Godrej Properties', 'Independent villa with private garden, in a gated villa community.'),
    (prop_5, uid, 'DLF Cyber City Residency', 'Apartment', '2 BHK', 'Gurgaon', 'DLF Phase 3, Gurgaon', 980, 4800000, '5', '20', 'Unfurnished', 'Ready to Move', 'AVAILABLE', 'DLF Ltd', 'Well-connected 2BHK close to the Cyber Hub business district.');

  -- FOLLOWUPS
  insert into followups (user_id, lead_id, purpose, due_date, due_time, status)
  values
    (uid, lead_rahul, 'Confirm site visit slot', current_date, '16:00', 'PENDING'),
    (uid, lead_priya, 'Share 3BHK shortlist', current_date - 1, '11:00', 'PENDING'),
    (uid, lead_arjun, 'Discuss villa negotiation', current_date + 2, '10:30', 'PENDING'),
    (uid, lead_sneha, 'Initial requirement call', current_date + 1, '15:00', 'PENDING');

  -- SITE VISITS
  insert into site_visits (user_id, lead_id, property_id, visit_date, visit_time, assigned_agent, status)
  values
    (uid, lead_arjun, prop_4, current_date + 2, '10:30', 'You', 'SCHEDULED'),
    (uid, lead_rahul, prop_1, current_date, '16:30', 'You', 'SCHEDULED');

  -- DEALS
  insert into deals (user_id, lead_id, property_id, deal_value, commission_percent, commission_received, payment_status, status, closing_date)
  values
    (uid, lead_priya, prop_3, 10500000, 2.0, 0, 'PENDING', 'NEGOTIATION', null);

  -- EXPENSES
  insert into expenses (user_id, title, category, amount, expense_date, notes)
  values
    (uid, 'Instagram lead ads', 'Advertising', 8000, current_date - 3, 'Boosted post for Whitefield listings'),
    (uid, 'Site visit fuel', 'Travel', 1200, current_date - 2, null),
    (uid, 'Office rent share', 'Office', 15000, current_date - 5, null);

  -- ACTIVITIES
  insert into activities (user_id, lead_id, type, description)
  values
    (uid, lead_rahul, 'lead_created', 'Lead created from Website enquiry'),
    (uid, lead_priya, 'requirement_updated', 'Priya requested 3BHK properties'),
    (uid, lead_arjun, 'status_changed', 'Arjun moved to Site Visit'),
    (uid, lead_sneha, 'lead_created', 'Lead created from Walk-in');
end $$;
