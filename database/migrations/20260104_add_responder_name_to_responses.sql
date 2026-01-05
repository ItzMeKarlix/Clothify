-- Migration: Add responder_name to ticket_responses and populate existing rows
-- Run this in Supabase SQL editor or your migration framework

-- 1) Add column
ALTER TABLE ticket_responses
  ADD COLUMN IF NOT EXISTS responder_name VARCHAR(255);

-- 2) Populate from user_roles / user_details for responses with a responder_id
UPDATE ticket_responses tr
SET responder_name = ud.name
FROM (
  SELECT ur.user_id, ur.name
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
) ud
WHERE tr.responder_id = ud.user_id
  AND (tr.responder_name IS NULL OR tr.responder_name = '');

-- 3) For anonymous responses, try to populate from ticket customer_name
UPDATE ticket_responses tr
SET responder_name = st.customer_name
FROM support_tickets st
WHERE tr.responder_id IS NULL
  AND tr.ticket_id = st.id
  AND (tr.responder_name IS NULL OR tr.responder_name = '');

-- 4) Set a sensible default for any remaining NULLs
UPDATE ticket_responses
SET responder_name = 'Support Team'
WHERE responder_name IS NULL OR responder_name = '';
