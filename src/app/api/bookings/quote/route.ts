import { NextResponse } from 'next/server'
import { z } from 'zod'

import { isRangeAvailable } from '@/lib/availability'
import { calculatePrice } from '@/lib/pricing'
import { normalizeDate } from '@/lib/dates'

const schema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  const ci = normalizeDate(parsed.data.checkIn)
  const co = normalizeDate(parsed.data.checkOut)
  if (co <= ci) {
    return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
  }

  const avail = await isRangeAvailable(parsed.data.roomId, ci, co)
  if (!avail.ok) {
    return NextResponse.json({ error: avail.reason, available: false }, { status: 409 })
  }

  try {
    const breakdown = await calculatePrice(parsed.data.roomId, ci, co)
    return NextResponse.json({ available: true, ...breakdown })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
