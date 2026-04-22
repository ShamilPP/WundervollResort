import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { normalizeDate } from '@/lib/dates'

const schema = z.object({
  roomId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
})

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }
  const block = await prisma.blockedDate.create({
    data: {
      roomId: parsed.data.roomId,
      startDate: normalizeDate(parsed.data.startDate),
      endDate: normalizeDate(parsed.data.endDate),
      reason: parsed.data.reason || null,
    },
  })
  return NextResponse.json({ id: block.id }, { status: 201 })
}
