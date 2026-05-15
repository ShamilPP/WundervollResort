import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookingForm } from '@/components/booking/booking-form'

export default async function BookingPage({
  params,
}: {
  params: { roomId: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/booking/${params.roomId}`)
  }

  const room = await prisma.room.findUnique({ where: { id: params.roomId } })
  if (!room) notFound()

  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container">
          {/* Editorial Header */}
          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                Reservations
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-8xl text-obsidian tracking-tighter">
              Confirm Your <span className="text-accent italic font-light">Stay</span>
            </h1>
          </div>

          {/* Redesigned Booking Form Component */}
          <BookingForm
            roomId={room.id}
            roomName={room.name}
            maxGuests={room.maxGuests}
            user={{ name: session.user.name, email: session.user.email }}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
