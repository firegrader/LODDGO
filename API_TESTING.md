# LODDGO API Testing Guide

## Milestone M3: API Routes Complete

All API endpoints are ready for testing. Make sure you have:
1. Database schema applied (`supabase/schema.sql`)
2. Database function applied (`supabase/functions.sql`)
3. Environment variables set in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ADMIN_KEY=your_secret_admin_key
   ```

## API Endpoints

### Public Endpoints

#### 1. Get Event by Code
```bash
GET /api/events/[code]

# Example:
curl http://localhost:3000/api/events/TEST001
```

**Response:**
```json
{
  "id": "uuid",
  "code": "TEST001",
  "title": "Test Event",
  "price_nok": 50,
  "status": "live",
  "draw_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2. Buy Tickets (Create Order)
```bash
POST /api/orders
Content-Type: application/json

# Example:
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "event_code": "TEST001",
    "buyer_display_name": "John Doe",
    "qty": 3,
    "idempotency_key": "unique-key-123"
  }'
```

**Request Body:**
- `event_code` (string, required): Event code
- `buyer_display_name` (string, optional): Buyer name
- `qty` (number, required): Number of tickets (1-200)
- `idempotency_key` (string, optional): For preventing duplicate orders

**Response (201):**
```json
{
  "order": {
    "id": "uuid",
    "event_id": "uuid",
    "buyer_display_name": "John Doe",
    "qty": 3,
    "amount_nok": 150,
    "paid": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": 1,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "ticket_number": 2,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "ticket_number": 3,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3. Get Draw Result
```bash
GET /api/events/[code]/result

# Example:
curl http://localhost:3000/api/events/TEST001/result
```

**Response:**
```json
{
  "draw": {
    "winning_ticket_number": 5,
    "method": "manual",
    "drawn_at": "2024-01-01T12:00:00Z"
  },
  "winner": {
    "buyer_display_name": "Jane Smith",
    "order_id": "uuid",
    "tickets_purchased": 2,
    "order_date": "2024-01-01T10:00:00Z"
  },
  "event": {
    "code": "TEST001",
    "title": "Test Event"
  }
}
```

### Admin Endpoints (Require x-admin-key header)

#### 4. Create Event
```bash
POST /api/admin/events
Content-Type: application/json
x-admin-key: your_admin_key

# Example:
curl -X POST http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your_admin_key" \
  -d '{
    "code": "TEST001",
    "title": "Test Event",
    "price_nok": 50,
    "status": "live",
    "draw_at": null
  }'
```

**Request Body:**
- `code` (string, required): Unique event code
- `title` (string, required): Event title
- `price_nok` (integer, required): Price per ticket in NOK
- `status` (string, optional): "draft" | "live" | "closed" | "drawn" (default: "live")
- `draw_at` (string, optional): Scheduled draw time (ISO timestamp)

**Response (201):**
```json
{
  "id": "uuid",
  "code": "TEST001",
  "title": "Test Event",
  "price_nok": 50,
  "status": "live",
  "draw_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 5. Run Draw
```bash
POST /api/admin/draws
Content-Type: application/json
x-admin-key: your_admin_key

# Example:
curl -X POST http://localhost:3000/api/admin/draws \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your_admin_key" \
  -d '{
    "event_code": "TEST001",
    "winning_ticket_number": 5,
    "winning_order_id": "uuid-of-winning-order",
    "method": "manual"
  }'
```

**Request Body:**
- `event_code` (string, required): Event code
- `winning_ticket_number` (integer, required): Winning ticket number
- `winning_order_id` (string, required): UUID of the winning order
- `method` (string, optional): Draw method (default: "manual")

**Response (201):**
```json
{
  "id": "uuid",
  "event_id": "uuid",
  "winning_ticket_number": 5,
  "winning_order_id": "uuid",
  "method": "manual",
  "drawn_at": "2024-01-01T12:00:00Z"
}
```

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized (Admin endpoints):**
```json
{
  "error": "Invalid or missing admin key"
}
```

**404 Not Found:**
```json
{
  "error": "Event not found"
}
```

**409 Conflict:**
```json
{
  "error": "Duplicate order detected (idempotency_key conflict)"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Testing Workflow

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create an event (Admin):**
   ```bash
   POST /api/admin/events
   ```

3. **Buy tickets (Public):**
   ```bash
   POST /api/orders
   ```

4. **Check event status:**
   ```bash
   GET /api/events/[code]
   ```

5. **Run draw (Admin):**
   ```bash
   POST /api/admin/draws
   ```

6. **View draw result (Public):**
   ```bash
   GET /api/events/[code]/result
   ```

## Notes

- All amounts are in NOK (Norwegian Kroner) as integers
- Ticket numbers are sequential per event (1, 2, 3, ...)
- Idempotency keys prevent duplicate orders
- Admin endpoints require `x-admin-key` header matching `ADMIN_KEY` env var
- Mock payment is used (paid=true) for MVP
