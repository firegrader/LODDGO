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

/**
 * Draw next winner for an event (random undrawn ticket)
 * Ensures no duplicate ticket is drawn and allows new tickets during draw rounds
 */
CREATE OR REPLACE FUNCTION draw_next_winner(
  p_event_id UUID
) RETURNS TABLE (
  id UUID,
  event_id UUID,
  winning_ticket_number INTEGER,
  winning_order_id UUID,
  method TEXT,
  drawn_at TIMESTAMPTZ
) AS $$
DECLARE
  v_ticket RECORD;
BEGIN
  -- Lock the event to prevent concurrent draws
  PERFORM pg_advisory_xact_lock(hashtext(p_event_id::TEXT));

  -- Pick a random ticket that hasn't been drawn yet
  SELECT t.ticket_number, t.order_id
  INTO v_ticket
  FROM tickets t
  WHERE t.event_id = p_event_id
    AND NOT EXISTS (
      SELECT 1
      FROM draws d
      WHERE d.event_id = p_event_id
        AND d.winning_ticket_number = t.ticket_number
    )
  ORDER BY random()
  LIMIT 1;

  -- If no tickets left to draw, return empty result
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Insert draw record and return it
  RETURN QUERY
  INSERT INTO draws (event_id, winning_ticket_number, winning_order_id, method)
  VALUES (p_event_id, v_ticket.ticket_number, v_ticket.order_id, 'random')
  RETURNING draws.id, draws.event_id, draws.winning_ticket_number, draws.winning_order_id, draws.method, draws.drawn_at;
END;
$$ LANGUAGE plpgsql;
