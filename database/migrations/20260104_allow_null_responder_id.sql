-- Migration: allow NULL responder_id for anonymous customer responses
-- Run this against your database (e.g., via Supabase SQL editor or migration tool)

ALTER TABLE ticket_responses
  ALTER COLUMN responder_id DROP NOT NULL;

-- Optional: set existing empty string responder_ids to NULL
UPDATE ticket_responses
SET responder_id = NULL
WHERE responder_id = '';
