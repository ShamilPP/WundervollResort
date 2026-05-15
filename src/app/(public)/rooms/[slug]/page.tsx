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
      <main className="min-h-screen bg-[#FDFCFB] pt-24 pb-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 pt-16">

            {/* Left Column: The Narrative Experience */}
            <div className="lg:col-span-7 space-y-24">

              {/* Cinematic Header */}
              <div className="space-y-12">
                <div className="relative overflow-hidden rounded-[3rem] shadow-2xl">
                  <RoomGallery images={room.images} slug={room.slug} />
                  <div className="absolute top-6 left-6 md:top-12 md:left-12 pointer-events-none">
                    <span className="font-serif text-5xl md:text-8xl text-white/10 select-none">
                      {room.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="space-y-8 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-accent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">
                      The Sanctuary Narrative
                    </span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl text-brand-obsidian leading-[1.1] tracking-tight">
                    {room.name}
                  </h1>
                  <p className="text-xl font-light leading-relaxed text-brand-obsidian/70 italic border-l-2 border-accent/20 pl-8">
                    {room.description}
                  </p>
                </div>
              </div>

              {/* Categorized Amenities */}
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl text-brand-obsidian">Sanctuary Essentials</h2>
                  <p className="text-sm font-medium text-brand-obsidian/30 uppercase tracking-widest">Curated for your comfort</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-accent border-b border-accent/10 pb-4">The Residence</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-obsidian/40">Occupancy</span>
                        <span className="font-bold">{room.maxGuests} Guests</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-obsidian/40">Bedding</span>
                        <span className="font-bold">{room.bedType}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-obsidian/40">Total Area</span>
                        <span className="font-bold">{room.sizeSqft} SQ FT</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-accent border-b border-accent/10 pb-4">Services & Tech</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {room.features.slice(0, 6).map((f) => (
                        <div key={f} className="flex items-center gap-3">
                          <div className="h-1 w-1 rounded-full bg-accent" />
                          <span className="text-[13px] font-bold text-brand-obsidian/60 uppercase tracking-wide">
                            {featureLabels[f]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Reservation */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-40 space-y-8">
                <div className="rounded-[2.5rem] bg-white p-6 shadow-2xl shadow-brand-obsidian/10 border border-brand-obsidian/5">
                  <RoomAvailabilityCalendar
                    roomId={room.id}
                    slug={room.slug}
                    basePrice={room.basePrice}
                    weekendPrice={room.weekendPrice}
                  />
                </div>

                <div className="text-center py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-obsidian/20">
                    Bespoke Concierge Service Available
                  </p>
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
