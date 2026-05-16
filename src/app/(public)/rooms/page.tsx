import { Prisma, RoomType } from '@prisma/client'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RoomsHero } from '@/components/rooms/rooms-hero'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilters } from '@/components/rooms/room-filters'
import { getAvailableRoomIds } from '@/lib/availability'

export const metadata: Metadata = {
  title: 'Rooms · Wundervoll Resort',
  description: 'Nine private residences, each with its own character.',
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { 
    type?: string; 
    guests?: string; 
    sort?: string;
    checkIn?: string;
    checkOut?: string;
  }
}) {
  const where: Prisma.RoomWhereInput = { isActive: true }

  // 1. Filter by Type
  if (searchParams.type && Object.values(RoomType).includes(searchParams.type as RoomType)) {
    where.type = searchParams.type as RoomType
  }

  // 2. Filter by Guests (Standard logic)
  if (searchParams.guests) {
    const min = parseInt(searchParams.guests, 10)
    if (!isNaN(min)) {
      // If guests > 3, we still show rooms but we'll add a warning in the UI/Filters
      // For now, we filter by maxGuests
      where.maxGuests = { gte: Math.min(min, 3) } 
    }
  }

  // 3. Filter by Availability
  if (searchParams.checkIn && searchParams.checkOut) {
    try {
      const availableIds = await getAvailableRoomIds(
        new Date(searchParams.checkIn),
        new Date(searchParams.checkOut)
      )
      where.id = { in: availableIds }
    } catch (e) {
      console.error('Availability filter failed', e)
    }
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
