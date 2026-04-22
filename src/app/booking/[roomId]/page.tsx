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
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Booking
            </p>
            <h1 className="mt-3 font-serif text-4xl">{room.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Confirm your dates and details to continue.
            </p>
          </div>
          <BookingForm
            roomId={room.id}
            roomName={room.name}
            maxGuests={room.maxGuests}
            user={{ name: session.user.name, email: session.user.email }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
