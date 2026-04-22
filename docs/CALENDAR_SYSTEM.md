# 📅 Calendar & Availability System

How availability works across guest-facing views and admin views.

---

## 🧠 Core Concept

A date for a given room is in **one of four states**:

| State | Meaning | How it's decided |
|-------|---------|------------------|
| `available` | Free to book | No booking overlaps; no admin block; room is active |
| `booked` | Already reserved | A `Booking` with status `CONFIRMED` / `CHECKED_IN` overlaps |
| `pending` | Held by pending booking | A `Booking` with status `PENDING` overlaps (released after 15 min) |
| `blocked` | Admin blocked | A `BlockedDate` row overlaps |

Priority (highest wins if overlap): `blocked` > `booked` > `pending` > `available`.

---

## 🔍 Core Availability Function

`src/lib/availability.ts`:

```ts
import { prisma } from './db'
import { eachDayOfInterval, isWithinInterval, startOfDay, isWeekend } from 'date-fns'

export interface DateAvailability {
  date: Date
  status: 'available' | 'booked' | 'pending' | 'blocked'
  price?: number   // in paise (divide by 100 for rupees)
}

export async function getRoomAvailability(
  roomId: string,
  from: Date,
  to: Date
): Promise<DateAvailability[]> {
  const [room, bookings, blocks, seasonalPrices] = await Promise.all([
    prisma.room.findUnique({ where: { id: roomId } }),

    prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        checkIn: { lte: to },
        checkOut: { gte: from },
      },
      select: { checkIn: true, checkOut: true, status: true },
    }),

    prisma.blockedDate.findMany({
      where: {
        roomId,
        startDate: { lte: to },
        endDate: { gte: from },
      },
    }),

    prisma.seasonalPrice.findMany({
      where: {
        roomId,
        startDate: { lte: to },
        endDate: { gte: from },
      },
    }),
  ])

  if (!room) throw new Error('Room not found')

  const days = eachDayOfInterval({ start: from, end: to })

  return days.map((date) => {
    const day = startOfDay(date)

    // Check blocks first
    const isBlocked = blocks.some(b =>
      isWithinInterval(day, { start: b.startDate, end: b.endDate })
    )
    if (isBlocked) return { date: day, status: 'blocked' }

    // Check confirmed bookings — note checkOut is exclusive
    const isBooked = bookings.some(b =>
      b.status !== 'PENDING' &&
      day >= startOfDay(b.checkIn) &&
      day < startOfDay(b.checkOut)
    )
    if (isBooked) return { date: day, status: 'booked' }

    const isPending = bookings.some(b =>
      b.status === 'PENDING' &&
      day >= startOfDay(b.checkIn) &&
      day < startOfDay(b.checkOut)
    )
    if (isPending) return { date: day, status: 'pending' }

    // Calculate price
    const seasonal = seasonalPrices.find(s =>
      isWithinInterval(day, { start: s.startDate, end: s.endDate })
    )
    const price = seasonal
      ? seasonal.price
      : isWeekend(day) && room.weekendPrice
        ? room.weekendPrice
        : room.basePrice

    return { date: day, status: 'available', price }
  })
}
```

---

## 🎯 Check if Range is Bookable

```ts
export async function isRangeAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  // checkOut is exclusive — we need every night from checkIn to checkOut-1
  const availability = await getRoomAvailability(
    roomId,
    checkIn,
    new Date(checkOut.getTime() - 86400000) // minus 1 day
  )
  return availability.every(d => d.status === 'available')
}
```

Also enforce:
- Minimum stay (e.g., 2 nights)
- Check-in is not in the past
- Check-out > check-in

---

## 💰 Price Calculation

`src/lib/pricing.ts`:

```ts
import { differenceInDays } from 'date-fns'
import { getRoomAvailability } from './availability'

const TAX_RATE = 0.18 // 18% GST

export async function calculateBookingPrice(
  roomId: string,
  checkIn: Date,
  checkOut: Date
) {
  const nights = differenceInDays(checkOut, checkIn)
  if (nights < 1) throw new Error('Invalid date range')

  const days = await getRoomAvailability(
    roomId,
    checkIn,
    new Date(checkOut.getTime() - 86400000)
  )

  const subtotal = days.reduce((sum, d) => sum + (d.price ?? 0), 0)
  const taxes = subtotal * TAX_RATE
  const total = subtotal + taxes

  return {
    nights,
    subtotal: Math.round(subtotal),
    taxes: Math.round(taxes),
    totalAmount: Math.round(total),
    breakdown: days.map(d => ({
      date: d.date,
      price: d.price,
    })),
  }
}
```

---

## 🗓️ Guest Calendar Component

`src/components/rooms/RoomAvailabilityCalendar.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { useQuery } from '@tanstack/react-query'
import { addMonths, startOfMonth, endOfMonth } from 'date-fns'
import 'react-day-picker/dist/style.css'

export function RoomAvailabilityCalendar({ roomId, onSelect }) {
  const [month, setMonth] = useState(new Date())
  const [range, setRange] = useState<DateRange | undefined>()

  const { data: availability } = useQuery({
    queryKey: ['availability', roomId, month],
    queryFn: async () => {
      const from = startOfMonth(month).toISOString()
      const to = endOfMonth(addMonths(month, 1)).toISOString()
      const res = await fetch(
        `/api/rooms/${roomId}/availability?from=${from}&to=${to}`
      )
      return res.json()
    },
  })

  const bookedDates = availability?.dates
    .filter(d => d.status === 'booked')
    .map(d => new Date(d.date)) ?? []

  const blockedDates = availability?.dates
    .filter(d => d.status === 'blocked')
    .map(d => new Date(d.date)) ?? []

  return (
    <DayPicker
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={(r) => {
        setRange(r)
        if (r?.from && r?.to) onSelect(r)
      }}
      month={month}
      onMonthChange={setMonth}
      disabled={[
        { before: new Date() },
        ...bookedDates.map(d => ({ from: d, to: d })),
        ...blockedDates.map(d => ({ from: d, to: d })),
      ]}
      modifiers={{
        booked: bookedDates,
        blocked: blockedDates,
      }}
      modifiersClassNames={{
        booked: 'line-through text-danger/50',
        blocked: 'text-stone/30 bg-mist',
        selected: 'bg-ink text-cream',
      }}
    />
  )
}
```

---

## 🛠️ Admin Master Calendar

Uses **FullCalendar** with a resource-timeline view (rooms × dates).

```tsx
'use client'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'

export function MasterCalendar({ rooms, bookings, blocks }) {
  const resources = rooms.map(r => ({ id: r.id, title: r.name }))

  const events = [
    ...bookings.map(b => ({
      id: b.id,
      resourceId: b.roomId,
      start: b.checkIn,
      end: b.checkOut,
      title: `${b.guestName} · ${b.code}`,
      backgroundColor: statusColor(b.status),
      extendedProps: { type: 'booking', booking: b },
    })),
    ...blocks.map(bl => ({
      id: `block-${bl.id}`,
      resourceId: bl.roomId,
      start: bl.startDate,
      end: bl.endDate,
      title: bl.reason ?? 'Blocked',
      backgroundColor: '#6B6660',
      extendedProps: { type: 'block' },
    })),
  ]

  return (
    <FullCalendar
      plugins={[resourceTimelinePlugin, interactionPlugin]}
      initialView="resourceTimelineMonth"
      resources={resources}
      events={events}
      editable={false}
      selectable
      select={(info) => {
        // Open "add booking" or "block dates" dialog
      }}
      eventClick={(info) => {
        // Open booking or block detail sheet
      }}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear',
      }}
      resourceAreaHeaderContent="Rooms"
      height="auto"
    />
  )
}

function statusColor(status) {
  return {
    CONFIRMED: '#3F8A5C',
    PENDING: '#C99A3F',
    CHECKED_IN: '#2E7A87',
    CHECKED_OUT: '#6B6660',
    CANCELLED: '#B94A3B',
  }[status]
}
```

---

## ⏰ Pending Booking Cleanup

Pending bookings that never got paid should free up the dates. Run a cron:

```ts
// src/lib/jobs/cleanup-pending.ts
import { prisma } from '@/lib/db'
import { subMinutes } from 'date-fns'

export async function cleanupPendingBookings() {
  const cutoff = subMinutes(new Date(), 15)

  const expired = await prisma.booking.updateMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: cutoff },
    },
    data: { status: 'CANCELLED' },
  })

  console.log(`Cancelled ${expired.count} expired bookings`)
}
```

Run via **Vercel Cron**:

```ts
// app/api/cron/cleanup/route.ts
import { cleanupPendingBookings } from '@/lib/jobs/cleanup-pending'

export async function GET(req) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 })
  await cleanupPendingBookings()
  return Response.json({ ok: true })
}
```

`vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "*/5 * * * *" }
  ]
}
```

---

## ⚠️ Race Condition Protection

Two users could book the same dates simultaneously. Protect with a **MongoDB transaction** (works on Atlas or Docker replica sets):

```ts
await prisma.$transaction(async (tx) => {
  // Re-check availability INSIDE the transaction — the snapshot
  // is isolated from other concurrent transactions
  const conflicts = await tx.booking.count({
    where: {
      roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      AND: [
        { checkIn: { lt: checkOut } },
        { checkOut: { gt: checkIn } },
      ],
    },
  })
  if (conflicts > 0) throw new Error('ROOM_UNAVAILABLE')

  return tx.booking.create({
    data: { ... },
  })
})
```

> ⚠️ Replica-set transactions on MongoDB use snapshot isolation plus write-conflict detection. If two transactions try to write the same document concurrently, one gets a `TransientTransactionError` and Prisma retries it — effectively preventing double-booking. Just make sure you're on Atlas or a replica-set Docker setup (plain `mongod` will reject `$transaction` calls).

---

## 🧪 Edge Cases to Test

- [ ] Same-day check-in and check-out (reject)
- [ ] Check-out in the past (reject)
- [ ] Back-to-back bookings (check-out day == next booking's check-in day → should be valid)
- [ ] Booking spanning a blocked date (reject)
- [ ] Seasonal price during weekend (seasonal wins)
- [ ] Minimum stay violation
- [ ] Max guests > room capacity
- [ ] Pending booking expires mid-flow
- [ ] Two users race-booking same dates

---

## 🗓️ Calendar Legend (UI)

| Style | Meaning |
|-------|---------|
| Plain date | Available, priced |
| Gray + strike | Booked |
| Light gray | Blocked |
| Dark background | Selected range |
| Border highlight | Today |
| Dot underneath | Seasonal pricing |
