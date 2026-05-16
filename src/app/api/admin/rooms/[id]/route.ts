import { NextResponse } from 'next/server'
import { RoomType, RoomFeature } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    
    // Extract basic fields
    const slug = formData.get('slug') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as RoomType
    const description = formData.get('description') as string
    const shortDesc = formData.get('shortDesc') as string
    const maxGuests = parseInt(formData.get('maxGuests') as string)
    const bedType = formData.get('bedType') as string
    const sizeSqft = parseInt(formData.get('sizeSqft') as string)
    const basePrice = parseInt(formData.get('basePrice') as string)
    const weekendPriceStr = formData.get('weekendPrice') as string
    const weekendPrice = weekendPriceStr ? parseInt(weekendPriceStr) : null
    const isActive = formData.get('isActive') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string)
    const featuresStr = formData.get('features') as string
    const features = JSON.parse(featuresStr || '[]') as RoomFeature[]

    // Update basic info
    await prisma.room.update({
      where: { id: params.id },
      data: {
        slug,
        name,
        type,
        description,
        shortDesc,
        maxGuests,
        bedType,
        sizeSqft,
        basePrice,
        weekendPrice,
        isActive,
        sortOrder,
        features
      }
    })

    // Handle Image Reconciliation
    const existingImagesStr = formData.get('existingImages') as string
    const existingImages = JSON.parse(existingImagesStr || '[]') as { url: string, publicId: string }[]
    
    // Handle New File Uploads
    const newFiles = formData.getAll('images') as File[]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms')
    await mkdir(uploadDir, { recursive: true })

    // Reset images for this room
    await prisma.roomImage.deleteMany({ where: { roomId: params.id } })

    let currentSort = 0

    // 1. Re-add existing images that were kept
    for (const img of existingImages) {
      await prisma.roomImage.create({
        data: {
          roomId: params.id,
          url: img.url,
          publicId: img.publicId,
          isPrimary: currentSort === 0,
          sortOrder: currentSort++,
        }
      })
    }

    // 2. Add new uploaded files
    for (const file of newFiles) {
      if (!file.name) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name)
      const fileName = `${slug}-${Date.now()}-${currentSort}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)
      const publicPath = `/uploads/rooms/${fileName}`

      await writeFile(filePath, buffer)

      await prisma.roomImage.create({
        data: {
          roomId: params.id,
          url: publicPath,
          publicId: fileName,
          isPrimary: currentSort === 0,
          sortOrder: currentSort++,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ROOM_UPDATE_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
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
