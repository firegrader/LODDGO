-- Migration: Add organizer_id to events table
-- File: supabase/migrations/20260119151749_add_organizer_to_events.sql

-- Add organizer_id column to events table
-- Note: TEXT for now (simulated user_id), will be UUID when real auth is added
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id TEXT NULL;

-- Add index for querying events by organizer
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);

-- Add comment for future reference
COMMENT ON COLUMN events.organizer_id IS 'Organizer user ID. Currently TEXT (simulated), will be UUID (auth.users.id) when real auth is added.';
