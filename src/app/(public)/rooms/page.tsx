import { Prisma, RoomType } from '@prisma/client'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RoomsHero } from '@/components/rooms/rooms-hero'
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
      <main className="bg-ivory min-h-screen">
        <RoomsHero />

        <div className="container relative z-20 pb-32 pt-20">
          {rooms.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-muted-foreground italic">
                No residences match your current selection.
              </p>
            </div>
          ) : (
            <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
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
