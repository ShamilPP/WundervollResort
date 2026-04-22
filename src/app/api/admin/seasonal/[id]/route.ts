import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  await prisma.seasonalPrice.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
