import Link from 'next/link'
import type { Room, RoomImage } from '@prisma/client'
import { formatINR } from '@/lib/money'

type FeaturedRoom = Room & { images: RoomImage[] }

export function FeaturedRooms({ rooms }: { rooms: FeaturedRoom[] }) {
  return (
    <section id="featured" className="container py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Featured stays
        </p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Pick your view.</h2>
        <p className="mt-4 text-muted-foreground">
          Each residence is unique. Ocean, garden, mountain, or the intimacy of a
          private pavilion.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rooms.slice(0, 6).map((room) => {
          const primary = room.images.find((i) => i.isPrimary) ?? room.images[0]
          return (
            <Link
              key={room.id}
              href={`/rooms/${room.slug}`}
              className="group block overflow-hidden rounded-lg border bg-card transition hover:shadow-xl"
            >
              <div
                className="aspect-[4/3] w-full bg-cover bg-center transition duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${primary?.url ?? placeholderFor(room.slug)}')`,
                }}
              />
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {room.type}
                </p>
                <h3 className="mt-1 font-serif text-2xl">{room.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {room.shortDesc}
                </p>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-medium">{formatINR(room.basePrice)}</span>
                  <span className="text-xs text-muted-foreground">per night</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/rooms"
          className="inline-block rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          View all rooms
        </Link>
      </div>
    </section>
  )
}

function placeholderFor(slug: string) {
  const seed = Math.abs(
    slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0),
  )
  return `https://picsum.photos/seed/${seed}/800/600`
}
