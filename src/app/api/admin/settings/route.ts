import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/admin'
import { getAdvancePercentage, setSetting } from '@/lib/settings'

const schema = z.object({
  advancePercentage: z.number().min(0).max(100),
})

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const advancePercentage = await getAdvancePercentage()
  return NextResponse.json({ advancePercentage })
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  await setSetting('advance_percentage', String(parsed.data.advancePercentage))
  return NextResponse.json({ ok: true })
}
