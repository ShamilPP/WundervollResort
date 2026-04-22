import { NextResponse } from 'next/server'
import { BookingStatus, type Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const url = new URL(req.url)
  const status = url.searchParams.get('status')

  const where: Prisma.BookingWhereInput = {}
  if (status && Object.values(BookingStatus).includes(status as BookingStatus)) {
    where.status = status as BookingStatus
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { room: { select: { name: true } } },
  })

  const headers = [
    'code',
    'room',
    'guestName',
    'guestEmail',
    'guestPhone',
    'guestCount',
    'checkIn',
    'checkOut',
    'nights',
    'subtotal',
    'taxes',
    'total',
    'status',
    'createdAt',
  ]
  const rows = bookings.map((b) => [
    b.code,
    b.room.name,
    b.guestName,
    b.guestEmail,
    b.guestPhone ?? '',
    b.guestCount,
    b.checkIn.toISOString(),
    b.checkOut.toISOString(),
    b.nights,
    b.subtotal,
    b.taxes,
    b.totalAmount,
    b.status,
    b.createdAt.toISOString(),
  ])

  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
