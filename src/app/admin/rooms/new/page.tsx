import Link from 'next/link'
import { RoomForm } from '@/components/admin/room-form'

export default function NewRoomPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/rooms" className="text-sm text-muted-foreground hover:underline">
        ← All rooms
      </Link>
      <h1 className="mt-2 font-serif text-3xl">New room</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Create a new room listing.
      </p>
      <RoomForm mode="create" />
    </div>
  )
}
