-- LODDGO Database Schema
-- Milestone M1: Database schema (Supabase) - MVP Spec

-- Events table: stores raffle events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- Public code for sharing (e.g., via QR/link)
    title TEXT NOT NULL,
    price_nok INTEGER NOT NULL CHECK (price_nok >= 0), -- Price per ticket in NOK (whole kroner)
    status TEXT NOT NULL DEFAULT 'live', -- draft|live|closed|drawn
    draw_at TIMESTAMPTZ NULL, -- Scheduled draw time (optional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table: stores ticket purchase orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    buyer_display_name TEXT NULL, -- Optional display name for buyer
    qty INTEGER NOT NULL CHECK (qty > 0 AND qty <= 200), -- Number of tickets (max 200)
    amount_nok INTEGER NOT NULL CHECK (amount_nok >= 0), -- Total amount in NOK (whole kroner)
    paid BOOLEAN NOT NULL DEFAULT false, -- Mock payment flag (paid=true for MVP)
    payment_provider TEXT NOT NULL DEFAULT 'mock', -- Payment provider (mock|vipps for future)
    idempotency_key TEXT NULL, -- For preventing duplicate orders
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets table: stores individual tickets with sequential numbers per event
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL CHECK (ticket_number > 0), -- Sequential number per event (1, 2, 3, ...)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure unique ticket numbers per event
    UNIQUE(event_id, ticket_number)
);

-- Draws table: stores draw results (multiple draws per event)
CREATE TABLE IF NOT EXISTS draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    winning_ticket_number INTEGER NOT NULL CHECK (winning_ticket_number > 0), -- The winning ticket number (from tickets table)
    winning_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, -- Reference to winning order
    method TEXT NOT NULL DEFAULT 'manual', -- Draw method (manual|random for future)
    drawn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure no duplicate ticket is drawn for the same event
    UNIQUE(event_id, winning_ticket_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_code ON events(code);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key_unique ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_number ON tickets(event_id, ticket_number);
CREATE INDEX IF NOT EXISTS idx_draws_event_id ON draws(event_id);
CREATE INDEX IF NOT EXISTS idx_draws_event_ticket_number ON draws(event_id, winning_ticket_number);
CREATE INDEX IF NOT EXISTS idx_draws_winning_order_id ON draws(winning_order_id);
