import { NextResponse } from 'next/server'
import { z } from 'zod'
import { BookingStatus } from '@prisma/client'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

const schema = z.object({ status: z.nativeEnum(BookingStatus) })

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })

  if (parsed.data.status === BookingStatus.REFUNDED) {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: params.id },
    })
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      })
    }
    // Real Stripe refund would go here when keys are present.
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: { bookingId: params.id },
    }),
    prisma.booking.delete({
      where: { id: params.id },
    }),
  ])

  return NextResponse.json({ ok: true })
}
