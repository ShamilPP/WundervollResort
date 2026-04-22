# 🛠️ Admin Panel

Complete specification for the Wundervoll Resort admin panel.

Access: `/admin/*`, protected by `middleware.ts` (role = `ADMIN`).

---

## 🧭 Navigation Structure

```
Admin Sidebar
├── 📊 Dashboard          /admin
├── 🏨 Rooms              /admin/rooms
├── 📅 Bookings           /admin/bookings
├── 🗓️  Master Calendar    /admin/calendar
├── 🚫 Availability       /admin/availability
├── 👥 Users              /admin/users
├── 📈 Analytics          /admin/analytics
└── ⚙️  Settings           /admin/settings
```

Top bar: user name, dark-mode toggle, logout.

---

## 📊 Dashboard (`/admin`)

**KPI Cards (top row)**

| Card | Metric |
|------|--------|
| Today's Check-ins | Count of bookings with checkIn = today, status = CONFIRMED |
| Today's Check-outs | Count of bookings with checkOut = today |
| Occupancy (Today) | Booked rooms / total active rooms |
| Revenue (This Month) | Sum of payments where succeeded & this month |
| Pending Bookings | Count with status = PENDING |
| Cancellations (This Week) | Count cancelled |

**Recent Activity**
- Last 10 bookings with status badges
- Link to full bookings list

**Charts**
- Revenue trend (last 30 days) — line chart
- Occupancy (last 30 days) — area chart

---

## 🏨 Rooms (`/admin/rooms`)

### List view
- Data table: thumbnail, name, type, base price, active toggle, booking count, actions
- "Create Room" button top-right
- Sort by: name, price, booking count
- Search by name

### Create/Edit form (`/admin/rooms/new`, `/admin/rooms/[id]/edit`)

Fields:
- **Basics**: name, slug (auto from name), type (select), short desc, full desc (textarea)
- **Capacity**: max guests, bed type, size (sqft)
- **Pricing**: base price, weekend price (optional)
- **Features**: multi-select checkboxes from `RoomFeature` enum
  - Beachside View, Front View, Ocean View, Garden View, Pool View, Mountain View
  - Private Balcony, Private Pool, Jacuzzi
  - King/Queen/Twin Beds
  - WiFi, AC, Mini Bar, Room Service, Smart TV, Coffee Machine, Safe, Bathtub
- **Images**: drag-drop upload area (Cloudinary)
  - Set primary image
  - Drag to reorder
  - Delete per image
- **Status**: active toggle, sort order (drag handle on list)

Validation with zod + React Hook Form. Submit with toast + redirect.

### Image Upload Flow

```tsx
// components/admin/ImageUploader.tsx
'use client'
import { CldUploadWidget } from 'next-cloudinary'

export function ImageUploader({ roomId, onUploaded }) {
  return (
    <CldUploadWidget
      uploadPreset="wundervoll_rooms"
      signatureEndpoint="/api/upload/signature"
      onUpload={async (result) => {
        await fetch(`/api/rooms/${roomId}/images`, {
          method: 'POST',
          body: JSON.stringify({
            url: result.info.secure_url,
            publicId: result.info.public_id,
          }),
        })
        onUploaded?.()
      }}
    >
      {({ open }) => (
        <button onClick={() => open()} className="border-dashed border-2 p-8 rounded">
          Drop photos or click to upload
        </button>
      )}
    </CldUploadWidget>
  )
}
```

---

## 📅 Bookings (`/admin/bookings`)

### List view

Table columns:
| # | Code | Guest | Room | Check-in | Check-out | Amount | Status | Actions |
|---|------|-------|------|----------|-----------|--------|--------|---------|

**Filters** (sidebar or top):
- Status (multi-select)
- Room (dropdown)
- Date range (check-in from/to)
- Search (guest name, email, booking code)

**Sort**: by created date, check-in, amount

**Actions**: Export CSV, Create manual booking

**Row action**: opens detail sheet on right

### Detail sheet
- Guest info (name, email, phone, ID if collected)
- Dates, nights, guest count
- Room info + link to room
- Payment details (method, status, transaction ID)
- Special requests
- Status actions:
  - Confirm (if pending)
  - Check in (if confirmed & check-in date)
  - Check out (if checked in & check-out date)
  - Cancel + Refund
  - Resend confirmation email

### Manual booking (`/admin/bookings/new`)
- Same form as user booking, but admin can:
  - Override price
  - Mark as paid without charging
  - Block specific dates
  - Add for any existing user or new guest

---

## 🗓️ Master Calendar (`/admin/calendar`)

Gantt-style resource timeline (FullCalendar).

- Rows = rooms
- Columns = dates
- Cells colored by booking status
- Views: Week, Month, Quarter
- Click booking → detail sheet
- Click empty cell → dropdown:
  - Add booking for this room/date
  - Block these dates
- Drag to extend/move bookings (admin only)

See [`CALENDAR_SYSTEM.md`](./CALENDAR_SYSTEM.md) for implementation.

---

## 🚫 Availability (`/admin/availability`)

Two sections:

### Blocked Dates
- Table of all active blocks: room, range, reason, created
- "Block Dates" button → modal:
  - Select room(s)
  - Date range
  - Reason (optional)
- Delete block button per row

### Seasonal Pricing
- Table: name, room, range, price, status
- "Add Seasonal Price" button → modal:
  - Name (e.g. "Christmas Week")
  - Select room(s)
  - Date range
  - Override price
- Edit/Delete per row

---

## 👥 Users (`/admin/users`)

### List view
- Name, email, role, phone, bookings count, joined date
- Search by name/email
- Filter by role

### Detail (`/admin/users/[id]`)
- Profile info
- Booking history
- Total spent
- Actions:
  - Promote to Admin / Demote
  - Suspend account
  - Send password reset email

---

## 📈 Analytics (`/admin/analytics`)

**Charts**:
- Revenue — line chart (last 90 days, daily)
- Bookings count — bar chart (last 90 days)
- Room popularity — horizontal bar or pie
- Lead time distribution — histogram
- Occupancy heatmap (calendar grid)
- Cancellation reasons — pie (if collected)

**Stats table**:
- Average booking value
- Average nights per stay
- Repeat guest rate
- Cancellation rate
- Top-performing room

**Export**:
- CSV/Excel for any chart's data
- PDF monthly report (optional)

---

## ⚙️ Settings (`/admin/settings`)

### General
- Site maintenance mode toggle
- Demo payment mode toggle
- Default currency
- Tax rate
- Min stay nights
- Max advance booking days

### Homepage Content
- Hero headline, subheadline, video URL
- Amenities section intro
- About section text

### Policies
- Cancellation policy (rich text)
- House rules
- Check-in/out times

### Admin Users
- List of admins
- Add new admin (by email)
- Remove admin

---

## 🧱 Admin Layout

`app/admin/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  return (
    <div className="flex min-h-screen bg-sand-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-cream px-8 py-4">
          <h1 className="font-serif text-2xl">Admin</h1>
          <UserMenu user={session.user} />
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
```

Sidebar:
```tsx
const nav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/rooms', icon: Bed, label: 'Rooms' },
  { href: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/admin/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/admin/availability', icon: CalendarX, label: 'Availability' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]
```

---

## 📤 CSV Export

```ts
// app/api/admin/bookings/export/route.ts
export async function GET(req: Request) {
  await requireAdmin()
  const bookings = await prisma.booking.findMany({
    include: { user: true, room: true },
  })

  const rows = [
    ['Code', 'Guest', 'Email', 'Room', 'Check-in', 'Check-out', 'Nights', 'Amount', 'Status'],
    ...bookings.map(b => [
      b.code, b.guestName, b.guestEmail, b.room.name,
      b.checkIn.toISOString().split('T')[0],
      b.checkOut.toISOString().split('T')[0],
      b.nights, b.totalAmount, b.status,
    ]),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=bookings.csv',
    },
  })
}
```

---

## 🎨 Admin Styling

- Uses same design system as public site
- But can enable dark mode toggle (via `next-themes`)
- Tables use `@tanstack/react-table` for sorting/filtering
- Forms use shadcn `<Form>` with React Hook Form + zod
- Modals via shadcn `<Dialog>` / `<Sheet>` for edit panels

---

## 🔔 Real-time Features (Optional)

If you want live updates:
- Use **Pusher** or **Ably** for WebSocket-based notifications
- New bookings ping admin dashboard
- Stripe webhook → push notification

Or simpler: **polling** via React Query with `refetchInterval: 30000`.

---

## 🧪 Admin Testing Checklist

- [ ] Non-admin tries `/admin` → redirected to `/`
- [ ] Admin creates room → appears on public rooms page
- [ ] Admin blocks dates → user calendar reflects block
- [ ] Admin cancels booking → user receives email
- [ ] Admin exports CSV → file downloads correctly
- [ ] Admin creates seasonal price → pricing updates for new bookings
- [ ] Admin refunds payment → Stripe charge is actually refunded
- [ ] Analytics match reality (cross-check with DB)
