import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const room = await prisma.room.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!room) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(room)
}
