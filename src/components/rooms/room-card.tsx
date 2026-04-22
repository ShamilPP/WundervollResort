import Link from 'next/link'
import type { Room, RoomImage } from '@prisma/client'
import { formatINR } from '@/lib/money'

export function RoomCard({ room }: { room: Room & { images: RoomImage[] } }) {
  const img = room.images.find((i) => i.isPrimary) ?? room.images[0]
  const url = img?.url ?? placeholderFor(room.slug)
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition hover:shadow-lg"
    >
      <div
        className="aspect-[4/3] bg-cover bg-center transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${url}')` }}
      />
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {room.type}
        </p>
        <h3 className="mt-1 font-serif text-xl">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{room.shortDesc}</p>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="font-medium">{formatINR(room.basePrice)}</span>
          <span className="text-xs text-muted-foreground">
            {room.maxGuests} guests · {room.sizeSqft} sq ft
          </span>
        </div>
      </div>
    </Link>
  )
}

function placeholderFor(slug: string) {
  const seed = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return `https://picsum.photos/seed/${seed}/800/600`
}
