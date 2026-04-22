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

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { imageUrls, ...data } = parsed.data

  const existing = await prisma.room.findUnique({ where: { slug: data.slug } })
  if (existing) {
    return NextResponse.json({ error: 'slug already exists' }, { status: 409 })
  }

  const room = await prisma.room.create({ data })

  for (const [i, url] of imageUrls.entries()) {
    await prisma.roomImage.create({
      data: {
        roomId: room.id,
        url,
        publicId: `manual-${room.id}-${i}`,
        isPrimary: i === 0,
        sortOrder: i,
      },
    })
  }

  return NextResponse.json({ id: room.id }, { status: 201 })
}
