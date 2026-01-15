# LODDGO

LODDGO is a simple, live raffle app for schools and organizations.
Inspired by the energy of Kahoot, but built for digital raffles.

Core principles:
- No accounts required for participants
- Phone number used only as a temporary user reference
- Live, transparent draws
- Simple MVP first, scalable later

## Setup

1. Install dependencies:
   `npm install`

2. Create `.env.local`:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and service role key
   - Set `ADMIN_KEY` for admin endpoints

3. Apply database schema and functions in Supabase SQL Editor:
   - Run `supabase/schema.sql`
   - Run `supabase/functions.sql`
   - If you need multiple draws per event, run `supabase/migrations/20260115_update_draws.sql`

## Run locally

`npm run dev`

Open `http://localhost:3000`

## Usage

- Organizer creates event: `/admin`
- Participants buy tickets: `/e/[event-code]`
- Organizer control panel: `/e/[event-code]/control`
- Participant purchases list: `/order/[id]/purchases`
- Draw results: `/e/[event-code]/result`

## Vipps integration (future)

TODO:
- Vipps ePayment for real payments
- Vipps Login for participant identity (replace manual display name)