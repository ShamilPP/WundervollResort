import { NextResponse } from 'next/server'
import { z } from 'zod'
import { RoomType, RoomFeature } from '@prisma/client'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

const schema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  type: z.nativeEnum(RoomType),
  description: z.string(),
  shortDesc: z.string(),
  maxGuests: z.number().int().min(1),
  bedType: z.string(),
  sizeSqft: z.number().int().min(50),
  basePrice: z.number().int().min(0),
  weekendPrice: z.number().int().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  features: z.array(z.nativeEnum(RoomFeature)),
  imageUrls: z.array(z.string().url()).optional().default([]),
})

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
  const { imageUrls, ...data } = parsed.data

  await prisma.room.update({ where: { id: params.id }, data })

  // Reset images.
  await prisma.roomImage.deleteMany({ where: { roomId: params.id } })
  for (const [i, url] of imageUrls.entries()) {
    await prisma.roomImage.create({
      data: {
        roomId: params.id,
        url,
        publicId: `manual-${params.id}-${i}`,
        isPrimary: i === 0,
        sortOrder: i,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const bookings = await prisma.booking.count({ where: { roomId: params.id } })
  if (bookings > 0) {
    return NextResponse.json(
      { error: 'room has bookings — set inactive instead of deleting' },
      { status: 409 },
    )
  }

  await prisma.roomImage.deleteMany({ where: { roomId: params.id } })
  await prisma.blockedDate.deleteMany({ where: { roomId: params.id } })
  await prisma.seasonalPrice.deleteMany({ where: { roomId: params.id } })
  await prisma.room.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
