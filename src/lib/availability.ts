import { prisma } from '@/lib/db'
import { normalizeDate } from '@/lib/dates'

export type DayStatus = 'available' | 'booked' | 'blocked' | 'past'

export async function getUnavailableRanges(roomId: string, from?: Date, to?: Date) {
  const where = {
    roomId,
    ...(from && to
      ? { AND: [{ startDate: { lt: to } }, { endDate: { gt: from } }] }
      : {}),
  }

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        ...(from && to
          ? { AND: [{ checkIn: { lt: to } }, { checkOut: { gt: from } }] }
          : {}),
      },
      select: { checkIn: true, checkOut: true, status: true },
    }),
    prisma.blockedDate.findMany({
      where,
      select: { startDate: true, endDate: true, reason: true },
    }),
  ])

  return {
    booked: bookings.map((b) => ({
      from: b.checkIn.toISOString(),
      to: b.checkOut.toISOString(),
      status: b.status,
    })),
    blocked: blocks.map((b) => ({
      from: b.startDate.toISOString(),
      to: b.endDate.toISOString(),
      reason: b.reason,
    })),
  }
}

export async function isRangeAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const ci = normalizeDate(checkIn)
  const co = normalizeDate(checkOut)

  const [bookingConflicts, blockConflicts] = await Promise.all([
    prisma.booking.count({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        AND: [{ checkIn: { lt: co } }, { checkOut: { gt: ci } }],
      },
    }),
    prisma.blockedDate.count({
      where: {
        roomId,
        AND: [{ startDate: { lt: co } }, { endDate: { gt: ci } }],
      },
    }),
  ])

  if (bookingConflicts > 0) return { ok: false, reason: 'ROOM_UNAVAILABLE' as const }
  if (blockConflicts > 0) return { ok: false, reason: 'DATES_BLOCKED' as const }
  return { ok: true as const }
}
