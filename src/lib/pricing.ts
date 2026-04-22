import { prisma } from '@/lib/db'
import { normalizeDate, nightsBetween } from '@/lib/dates'

const TAX_RATE = 0.12

type PriceBreakdown = {
  nights: number
  nightly: { date: string; amount: number }[]
  subtotal: number
  taxes: number
  total: number
}

export async function calculatePrice(
  roomId: string,
  checkIn: Date | string,
  checkOut: Date | string,
): Promise<PriceBreakdown> {
  const ci = normalizeDate(checkIn)
  const co = normalizeDate(checkOut)
  const nights = nightsBetween(ci, co)

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) throw new Error('ROOM_NOT_FOUND')

  const seasonalPrices = await prisma.seasonalPrice.findMany({
    where: {
      roomId,
      AND: [{ startDate: { lt: co } }, { endDate: { gt: ci } }],
    },
  })

  const nightly: PriceBreakdown['nightly'] = []
  let subtotal = 0

  for (let i = 0; i < nights; i++) {
    const day = new Date(ci)
    day.setUTCDate(day.getUTCDate() + i)
    const dow = day.getUTCDay()
    const isWeekend = dow === 5 || dow === 6

    const season = seasonalPrices.find(
      (s) => day >= normalizeDate(s.startDate) && day < normalizeDate(s.endDate),
    )

    const amount = season
      ? season.price
      : isWeekend && room.weekendPrice
        ? room.weekendPrice
        : room.basePrice

    nightly.push({ date: day.toISOString().split('T')[0], amount })
    subtotal += amount
  }

  const taxes = Math.round(subtotal * TAX_RATE)
  const total = subtotal + taxes

  return { nights, nightly, subtotal, taxes, total }
}
