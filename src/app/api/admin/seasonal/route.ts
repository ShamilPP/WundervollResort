import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { normalizeDate } from '@/lib/dates'

const schema = z.object({
  roomId: z.string().min(1),
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  price: z.number().int().min(0),
})

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }
  const season = await prisma.seasonalPrice.create({
    data: {
      roomId: parsed.data.roomId,
      name: parsed.data.name,
      startDate: normalizeDate(parsed.data.startDate),
      endDate: normalizeDate(parsed.data.endDate),
      price: parsed.data.price,
    },
  })
  return NextResponse.json({ id: season.id }, { status: 201 })
}
