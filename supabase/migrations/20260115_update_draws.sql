-- Update draws table to allow multiple draws per event

-- Drop old unique constraint on event_id (single draw per event)
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_event_id_key;

-- Add unique constraint to prevent duplicate ticket draws per event
ALTER TABLE draws
  ADD CONSTRAINT draws_event_ticket_unique UNIQUE (event_id, winning_ticket_number);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_draws_event_ticket_number
  ON draws(event_id, winning_ticket_number);