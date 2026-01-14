-- LODDGO Database Functions
-- Milestone M2: Concurrency-safe functions for ticket purchasing

/**
 * Get next ticket number for an event with proper locking
 * This function uses advisory locks to ensure sequential ticket numbers
 * even under concurrent requests
 */
CREATE OR REPLACE FUNCTION get_next_ticket_number(
  p_event_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_max_ticket_number INTEGER;
BEGIN
  -- Lock the event and get the max ticket number for this event
  -- Using advisory lock to serialize access to this event's ticket numbering
  PERFORM pg_advisory_xact_lock(hashtext(p_event_id::TEXT));
  
  -- Get the maximum ticket number for this event
  SELECT COALESCE(MAX(ticket_number), 0) INTO v_max_ticket_number
  FROM tickets
  WHERE event_id = p_event_id;
  
  -- Return the next ticket number
  RETURN v_max_ticket_number + 1;
END;
$$ LANGUAGE plpgsql;
