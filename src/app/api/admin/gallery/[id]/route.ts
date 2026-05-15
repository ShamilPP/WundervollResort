import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Attempt to delete physical file
    try {
      const filePath = path.join(process.cwd(), 'public', image.url)
      await unlink(filePath)
    } catch (fileErr) {
      console.warn('[GALLERY_FILE_DELETE_WARN] File might not exist locally:', fileErr)
    }

    // Delete database record
    await prisma.galleryImage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[GALLERY_DELETE_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
