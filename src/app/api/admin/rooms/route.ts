import { NextResponse } from 'next/server'
import { RoomType, RoomFeature } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: Request) {
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
    
    // Handle features (passed as a JSON string or multiple fields)
    const featuresStr = formData.get('features') as string
    const features = JSON.parse(featuresStr || '[]') as RoomFeature[]

    // Check for existing slug
    const existing = await prisma.room.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 })
    }

    // Create the room record first
    const room = await prisma.room.create({
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

    // Handle File Uploads
    const files = formData.getAll('images') as File[]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms')
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true })

    for (const [i, file] of files.entries()) {
      if (!file.name) continue

      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name)
      const fileName = `${slug}-${Date.now()}-${i}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)
      const publicPath = `/uploads/rooms/${fileName}`

      await writeFile(filePath, buffer)

      await prisma.roomImage.create({
        data: {
          roomId: room.id,
          url: publicPath,
          publicId: fileName, // Use filename as local ID
          isPrimary: i === 0,
          sortOrder: i,
        },
      })
    }

    return NextResponse.json({ id: room.id }, { status: 201 })
  } catch (err) {
    console.error('[ROOM_CREATE_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
