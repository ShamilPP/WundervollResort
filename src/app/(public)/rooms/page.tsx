import { Prisma, RoomType } from '@prisma/client'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilters } from '@/components/rooms/room-filters'

export const metadata: Metadata = {
  title: 'Rooms · Wundervoll Resort',
  description: 'Nine private residences, each with its own character.',
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { type?: string; guests?: string; sort?: string }
}) {
  const where: Prisma.RoomWhereInput = { isActive: true }

  if (searchParams.type && Object.values(RoomType).includes(searchParams.type as RoomType)) {
    where.type = searchParams.type as RoomType
  }
  if (searchParams.guests) {
    const min = parseInt(searchParams.guests, 10)
    if (!isNaN(min)) where.maxGuests = { gte: min }
  }

  let orderBy: Prisma.RoomOrderByWithRelationInput = { sortOrder: 'asc' }
  if (searchParams.sort === 'price-asc') orderBy = { basePrice: 'asc' }
  if (searchParams.sort === 'price-desc') orderBy = { basePrice: 'desc' }

  const rooms = await prisma.room
    .findMany({ where, orderBy, include: { images: true } })
    .catch(() => [])

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Our rooms
            </p>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">
              Choose your view.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Every room has its own story. Ocean, garden, mountain, or a
              pavilion with a plunge pool.
            </p>
          </div>

          <RoomFilters />

          {rooms.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No rooms match your filters.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
