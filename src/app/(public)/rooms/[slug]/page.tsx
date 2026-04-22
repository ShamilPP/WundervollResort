import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RoomGallery } from '@/components/rooms/room-gallery'
import { RoomAvailabilityCalendar } from '@/components/rooms/room-availability-calendar'
import { featureLabels } from '@/lib/features'
import { formatINR } from '@/lib/money'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const room = await prisma.room.findUnique({ where: { slug: params.slug } }).catch(() => null)
  if (!room) return { title: 'Room not found · Wundervoll' }
  return {
    title: `${room.name} · Wundervoll Resort`,
    description: room.shortDesc,
  }
}

export default async function RoomDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const room = await prisma.room
    .findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })
    .catch(() => null)

  if (!room) notFound()

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-8">
          <Link href="/rooms" className="text-sm text-muted-foreground hover:underline">
            ← Back to rooms
          </Link>

          <div className="mt-4 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RoomGallery images={room.images} slug={room.slug} />

              <div className="mt-10">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {room.type}
                </p>
                <h1 className="mt-2 font-serif text-4xl md:text-5xl">{room.name}</h1>
                <p className="mt-4 text-muted-foreground">
                  {room.maxGuests} guests · {room.bedType} · {room.sizeSqft} sq ft
                </p>
                <p className="mt-6 text-base leading-relaxed">{room.description}</p>

                <h2 className="mt-10 font-serif text-2xl">In-room features</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {room.features.map((f) => (
                    <div key={f} className="rounded-md border bg-card px-3 py-2 text-sm">
                      {featureLabels[f]}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-medium">{formatINR(room.basePrice)}</span>
                  <span className="text-xs text-muted-foreground">per night</span>
                </div>
                {room.weekendPrice && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Weekends from {formatINR(room.weekendPrice)}
                  </p>
                )}
                <div className="mt-6">
                  <RoomAvailabilityCalendar
                    roomId={room.id}
                    slug={room.slug}
                    basePrice={room.basePrice}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
