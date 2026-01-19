-- Migration: Add user identity tracking
-- Tracks which name/nickname each user uses per event

-- User event identities table: tracks which name/nickname each user uses per event
CREATE TABLE IF NOT EXISTS user_event_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Will reference auth.users(id) when real auth is added, for now stores simulated user_id
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    buyer_display_name TEXT NOT NULL,
    is_nickname BOOLEAN NOT NULL DEFAULT false,
    first_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Add user_id and identity_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT NULL; -- Will be UUID when real auth is added
ALTER TABLE orders ADD COLUMN IF NOT EXISTS identity_id UUID REFERENCES user_event_identities(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_identities_user_id ON user_event_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_identities_event_id ON user_event_identities(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_identity_id ON orders(identity_id);
