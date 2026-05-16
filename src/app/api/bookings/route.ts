import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { isRangeAvailable } from '@/lib/availability'
import { calculatePrice } from '@/lib/pricing'
import { normalizeDate, nightsBetween } from '@/lib/dates'
import { generateBookingCode } from '@/lib/booking-code'

const schema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestCount: z.number().int().min(1),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const ci = normalizeDate(parsed.data.checkIn)
  const co = normalizeDate(parsed.data.checkOut)
  if (co <= ci) {
    return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
  }

  const avail = await isRangeAvailable(parsed.data.roomId, ci, co)
  if (!avail.ok) {
    return NextResponse.json({ error: avail.reason }, { status: 409 })
  }

  const adults = parsed.data.adults ?? parsed.data.guestCount ?? 1
  const children = parsed.data.children ?? 0

  const price = await calculatePrice(parsed.data.roomId, ci, co, adults, children)

  const booking = await prisma.booking.create({
    data: {
      code: generateBookingCode(),
      userId: session.user.id,
      roomId: parsed.data.roomId,
      checkIn: ci,
      checkOut: co,
      nights: nightsBetween(ci, co),
      adults: adults,
      children: children,
      guestCount: adults + children,
      guestName: parsed.data.guestName,
      guestEmail: parsed.data.guestEmail,
      guestPhone: parsed.data.guestPhone,
      specialRequests: parsed.data.specialRequests,
      subtotal: price.subtotal,
      taxes: price.taxes,
      totalAmount: price.total,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ id: booking.id, code: booking.code }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { room: { select: { name: true, slug: true } } },
  })
  return NextResponse.json(bookings)
}
