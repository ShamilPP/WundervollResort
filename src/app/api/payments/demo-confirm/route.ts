import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { sendBookingConfirmation } from '@/lib/email'

const schema = z.object({
  bookingId: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { room: true, payment: true },
  })
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (booking.status === 'CONFIRMED') {
    return NextResponse.json({ ok: true, already: true })
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CONFIRMED' },
  })

  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'SUCCEEDED', method: 'DEMO' },
    })
  } else {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: 'SUCCEEDED',
        method: 'DEMO',
      },
    })
  }

  await sendBookingConfirmation({
    to: booking.guestEmail,
    guestName: booking.guestName,
    bookingCode: booking.code,
    roomName: booking.room.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    total: booking.totalAmount,
    paidAmount: booking.totalAmount,
    nights: booking.nights,
  })

  return NextResponse.json({ ok: true })
}
