import Link from 'next/link'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/db'
import { RoomForm } from '@/components/admin/room-form'

export default async function EditRoomPage({
  params,
}: {
  params: { id: string }
}) {
  const room = await prisma.room
    .findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })
    .catch(() => null)
  if (!room) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/rooms" className="text-sm text-muted-foreground hover:underline">
        ← All rooms
      </Link>
      <h1 className="mt-2 font-serif text-3xl">{room.name}</h1>
      <p className="mb-8 text-sm text-muted-foreground">Edit room details.</p>
      <RoomForm mode="edit" initial={room} />
    </div>
  )
}
