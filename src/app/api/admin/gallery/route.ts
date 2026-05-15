import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    // Runtime Safety Guard
    if (!(prisma as any).galleryImage) {
      console.error('[GALLERY_SYNC_ERROR] Prisma Client is out of sync. Please restart the dev server.')
      return NextResponse.json({ error: 'Database model not yet synchronized. Please restart your dev server.' }, { status: 503 })
    }

    // @ts-ignore
    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(images)
  } catch (err) {
    console.error('[GALLERY_GET_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    // Runtime Safety Guard
    if (!(prisma as any).galleryImage) {
      console.error('[GALLERY_SYNC_ERROR] Prisma Client is out of sync. Please restart the dev server.')
      return NextResponse.json({ error: 'Database model not yet synchronized. Please restart your dev server.' }, { status: 503 })
    }

    const formData = await req.formData()
    const files = formData.getAll('images') as File[]
    const category = (formData.get('category') as string) || 'GENERAL'

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery')
    await mkdir(uploadDir, { recursive: true })

    const createdImages = []

    for (const [i, file] of files.entries()) {
      if (!file.name || file.size === 0) continue

      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name)
      const fileName = `gallery-${Date.now()}-${i}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)
      const publicPath = `/uploads/gallery/${fileName}`

      await writeFile(filePath, buffer)

      // @ts-ignore
      const img = await prisma.galleryImage.create({
        data: {
          url: publicPath,
          alt: file.name,
          category,
          sortOrder: 0
        },
      })
      createdImages.push(img)
    }

    return NextResponse.json(createdImages, { status: 201 })
  } catch (err) {
    console.error('[GALLERY_UPLOAD_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
