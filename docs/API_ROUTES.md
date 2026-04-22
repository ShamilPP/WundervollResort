# 🔌 API Routes

Every API endpoint in **Wundervoll Resort**. All return JSON; all use zod validation.

Base path: `/api`

---

## 🔐 Auth

Handled by NextAuth.js at a single catch-all route.

| Method | Path | Purpose |
|--------|------|---------|
| `*` | `/api/auth/[...nextauth]` | Sign in, sign out, callbacks, session |

**File**: `app/api/auth/[...nextauth]/route.ts`

---

## 🏨 Rooms

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/rooms` | Public | List all active rooms (supports `?view=&minPrice=&maxPrice=&maxGuests=`) |
| `POST` | `/api/rooms` | Admin | Create a new room |
| `GET` | `/api/rooms/[id]` | Public | Get single room |
| `PATCH` | `/api/rooms/[id]` | Admin | Update room |
| `DELETE` | `/api/rooms/[id]` | Admin | Delete/deactivate room |
| `GET` | `/api/rooms/[id]/availability` | Public | Get availability for a date range (`?from=&to=`) |
| `POST` | `/api/rooms/[id]/images` | Admin | Add images |
| `DELETE` | `/api/rooms/[id]/images/[imageId]` | Admin | Remove image |

### Example: `GET /api/rooms/[id]/availability?from=2026-05-01&to=2026-05-31`

Response:
```json
{
  "roomId": "65f8a2b4e1c9d34a5b6e7f89",
  "dates": [
    { "date": "2026-05-01", "status": "available", "price": 1450000 },
    { "date": "2026-05-02", "status": "booked" },
    { "date": "2026-05-03", "status": "blocked" },
    { "date": "2026-05-04", "status": "available", "price": 1800000 }
  ]
}
```

> Prices are in **paise** (₹1 = 100 paise). ₹14,500 = 1,450,000 paise. The client divides by 100 for display.

---

## 📅 Bookings

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/bookings` | User | List my bookings |
| `POST` | `/api/bookings` | User | Create booking (status: PENDING) |
| `GET` | `/api/bookings/[id]` | User/Admin | Get single booking |
| `PATCH` | `/api/bookings/[id]` | Admin | Update status |
| `POST` | `/api/bookings/[id]/cancel` | User/Admin | Cancel booking |
| `POST` | `/api/bookings/quote` | Public | Get price quote without committing |

### Example: `POST /api/bookings`

Request:
```json
{
  "roomId": "65f8a2b4e1c9d34a5b6e7f89",
  "checkIn": "2026-05-15",
  "checkOut": "2026-05-18",
  "guestCount": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+919876543210",
  "specialRequests": "Early check-in please"
}
```

Response:
```json
{
  "id": "65f8a2b4e1c9d34a5b6e7f89",
  "code": "WDV-2026-0042",
  "status": "PENDING",
  "subtotal": 4350000,
  "taxes": 783000,
  "totalAmount": 5133000,
  "nights": 3
}
```

> IDs are 24-char hex MongoDB ObjectIds. Money is in **paise** (₹51,330 = 5,133,000 paise).

### Example: `POST /api/bookings/quote`

Same input as create, but just returns the calculated total without creating a record. Used live as user picks dates.

---

## 💳 Payments

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/payments/create-intent` | User | Create Stripe PaymentIntent for a booking |
| `POST` | `/api/payments/demo-approve` | User | Mark payment as SUCCEEDED (demo mode) |
| `POST` | `/api/payments/[id]/refund` | Admin | Refund a payment |

### Example: `POST /api/payments/create-intent`

Request:
```json
{ "bookingId": "65f8a2b4e1c9d34a5b6e7f89" }
```

Response:
```json
{
  "clientSecret": "pi_3N...secret_xyz",
  "paymentIntentId": "pi_3N..."
}
```

### Example: `POST /api/payments/demo-approve`

Request:
```json
{ "bookingId": "65f8a2b4e1c9d34a5b6e7f89" }
```

Response:
```json
{ "success": true, "bookingId": "65f8a2b4e1c9d34a5b6e7f89", "status": "CONFIRMED" }
```

---

## 🪝 Webhooks

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/webhooks/stripe` | Handles `payment_intent.succeeded`, `payment_intent.failed`, `charge.refunded` |

Must verify signature using `stripe.webhooks.constructEvent()`.

---

## 🛠️ Admin

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/stats` | Dashboard KPIs |
| `GET` | `/api/admin/stats/revenue` | Revenue by day/week/month |
| `GET` | `/api/admin/stats/occupancy` | Occupancy data |
| `GET` | `/api/admin/bookings` | All bookings (with filters) |
| `GET` | `/api/admin/bookings/export` | CSV export |
| `GET` | `/api/admin/users` | List all users |
| `PATCH` | `/api/admin/users/[id]` | Update user role / status |
| `GET` | `/api/admin/calendar` | All bookings + blocks across rooms (for master calendar) |

### Example: `GET /api/admin/stats`

Response:
```json
{
  "todayCheckIns": 3,
  "todayCheckOuts": 2,
  "occupancyToday": 0.67,
  "occupancyThisMonth": 0.78,
  "revenueThisMonth": 48500000,
  "pendingBookings": 5,
  "recentBookings": [...]
}
```

---

## 🚫 Availability Management

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/admin/availability/block` | Block a date range for a room |
| `DELETE` | `/api/admin/availability/block/[id]` | Unblock |
| `POST` | `/api/admin/availability/seasonal` | Add seasonal price |
| `DELETE` | `/api/admin/availability/seasonal/[id]` | Remove seasonal price |

---

## 🖼️ Uploads

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/upload/signature` | Get a signed upload token for Cloudinary direct-upload |

---

## 📧 Emails (internal helper)

Not exposed publicly — called from server actions.

```ts
// src/lib/email.ts
sendBookingConfirmation(booking)
sendPaymentReceipt(payment)
sendCancellationEmail(booking)
sendAdminNotification(booking)
```

---

## ✅ Validation with Zod

Every `POST`/`PATCH` uses a zod schema in `src/lib/validators/`.

Example — `src/lib/validators/booking.ts`:
```ts
import { z } from 'zod'

export const createBookingSchema = z.object({
  roomId: z.string().length(24),  // MongoDB ObjectId
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guestCount: z.number().int().min(1).max(10),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
}).refine(
  (data) => data.checkOut > data.checkIn,
  { message: 'Check-out must be after check-in', path: ['checkOut'] }
)
```

---

## 🔒 Authorization Pattern

Every route starts with this:

```ts
// app/api/admin/rooms/route.ts
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(req: Request) {
  await requireAdmin()          // Throws if not admin
  const body = await req.json()
  const data = createRoomSchema.parse(body)
  // ... proceed
}
```

Helper:
```ts
// src/lib/auth-helpers.ts
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Response('Unauthorized', { status: 401 })
  }
  return session
}
```

---

## 📦 Response Format

All responses follow:
```json
// Success
{ "data": { ... } }

// Error
{ "error": { "message": "...", "code": "INVALID_DATES" } }
```

---

## 🐛 Error Codes

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Not logged in |
| `FORBIDDEN` | Insufficient role |
| `NOT_FOUND` | Resource missing |
| `VALIDATION_ERROR` | zod failed |
| `ROOM_UNAVAILABLE` | Dates already booked |
| `INVALID_DATES` | Check-out before check-in |
| `PAYMENT_FAILED` | Stripe error |
| `INTERNAL_ERROR` | 500 |
