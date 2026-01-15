# LODDGO Testing Flow Guide

## Complete Testing Workflow

Follow these steps to test the full LODDGO flow from organizer to participant.

### Prerequisites
- Dev server running: `npm run dev`
- Database schema applied in Supabase
- Admin key set in `.env.local`

---

## Step 1: Organizer Creates Event

1. **Go to Admin Page:**
   - Open: http://localhost:3000/admin

2. **Fill in the form:**
   - **Admin Key:** Enter your `ADMIN_KEY` from `.env.local`
   - **Event Code:** Enter a unique code (e.g., `SCHOOL2024`)
   - **Event Title:** Enter a title (e.g., `School Fundraiser 2024`)
   - **Price per Ticket:** Enter amount in NOK (e.g., `50`)
   - **Status:** Select `Live`

3. **Click "Create Event"**
   - You'll see a success message
   - You'll be redirected to the event page automatically

**Result:** Event is created and ready for ticket sales!

---

## Step 2: Participants Buy Tickets

1. **Share the Event Link:**
   - The event page URL is: `/e/[event-code]`
   - Example: http://localhost:3000/e/SCHOOL2024

2. **Participants visit the event page:**
   - They see the event title and price
   - They can enter their name (optional)
   - They select number of tickets (1-10)
   - They see the total amount

3. **Click "Buy Tickets"**
   - Tickets are purchased instantly (mock payment)
   - They're redirected to the confirmation page

**Result:** Tickets purchased with sequential numbers!

---

## Step 3: View Order Confirmation

After purchasing, participants see:
- Order confirmation message
- Order ID
- Number of tickets purchased
- Individual ticket numbers
- Total amount paid
- Link to view draw results

**Result:** Clear confirmation of purchase!

---

## Step 4: Organizer Runs Draw

1. **Get the winning order ID:**
   - Check Supabase dashboard → `orders` table
   - Or check the order confirmation page URL: `/order/[order-id]`
   - Note the `order_id` and `ticket_number` you want to win

2. **Run the draw via API:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/draws" `
     -Method POST `
     -Headers @{
       "Content-Type" = "application/json"
       "x-admin-key" = "your-admin-key"
     } `
     -Body '{
       "event_code": "SCHOOL2024",
       "winning_ticket_number": 1,
       "winning_order_id": "order-uuid-here",
       "method": "manual"
     }'
   ```

**Result:** Draw is recorded and event status updated to "drawn"!

---

## Step 5: View Draw Results

1. **Anyone can view results:**
   - Visit: `/e/[event-code]/result`
   - Example: http://localhost:3000/e/SCHOOL2024/result

2. **See the winner:**
   - Winning ticket number (large display)
   - Winner's name (if provided)
   - Number of tickets they purchased
   - Draw method and timestamp

**Result:** Transparent, public draw results!

---

## Quick Test Checklist

- [ ] Organizer creates event at `/admin`
- [ ] Event appears at `/e/[code]`
- [ ] Participant buys tickets
- [ ] Confirmation page shows correct tickets
- [ ] Organizer runs draw via API
- [ ] Results page shows winner
- [ ] All ticket numbers are sequential
- [ ] No duplicate ticket numbers

---

## Example Test Sequence

1. **Create Event:**
   - Code: `TEST2024`
   - Title: `Test Raffle`
   - Price: `50 NOK`

2. **Buy Tickets (as Participant 1):**
   - Name: `Alice`
   - Quantity: `3 tickets`
   - Gets tickets: `#1, #2, #3`

3. **Buy Tickets (as Participant 2):**
   - Name: `Bob`
   - Quantity: `2 tickets`
   - Gets tickets: `#4, #5`

4. **Run Draw:**
   - Winning ticket: `#3`
   - Winner: `Alice`

5. **View Results:**
   - See winner displayed publicly

---

## Troubleshooting

**Event not found:**
- Check event code is correct
- Verify event was created successfully

**Can't buy tickets:**
- Check event status is "live"
- Verify event exists in database

**Order not found:**
- Check order ID is correct
- Verify order was created successfully

**Draw not found:**
- Draw hasn't been run yet
- Check event code is correct

---

## Next Steps

After testing, you can:
- Customize the UI styling
- Add more features (M5 polish)
- Deploy to production
- Integrate real payment (Vipps)
