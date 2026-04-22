import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { formatINR } from '@/lib/money'
import { PaymentPanel } from '@/components/booking/payment-panel'

export default async function ConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const booking = await prisma.booking
    .findUnique({
      where: { id: params.id },
      include: { room: true, payment: true },
    })
    .catch(() => null)

  if (!booking) notFound()
  if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
    notFound()
  }

  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <>
      <Navbar />
      <main className="container pt-28">
        <div className="mx-auto max-w-2xl">
          {isConfirmed ? (
            <div className="mb-8 flex items-start gap-4 rounded-lg border bg-green-50 p-6 dark:bg-green-950/20">
              <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-green-600" />
              <div>
                <h1 className="font-serif text-2xl">Your stay is confirmed.</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirmation email sent to {booking.guestEmail}.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Final step
              </p>
              <h1 className="mt-3 font-serif text-3xl">Complete your booking</h1>
            </div>
          )}

          <div className="rounded-lg border bg-card p-6">
            <p className="text-xs text-muted-foreground">{booking.code}</p>
            <h2 className="mt-1 font-serif text-2xl">{booking.room.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {new Date(booking.checkIn).toLocaleDateString()} →{' '}
              {new Date(booking.checkOut).toLocaleDateString()} · {booking.nights}{' '}
              night{booking.nights === 1 ? '' : 's'} · {booking.guestCount} guest
              {booking.guestCount === 1 ? '' : 's'}
            </p>

            <div className="mt-6 space-y-2 border-t pt-4 text-sm">
              <Row label="Subtotal" value={formatINR(booking.subtotal)} />
              <Row label="Taxes" value={formatINR(booking.taxes)} />
              <Row label="Total" value={formatINR(booking.totalAmount)} bold />
            </div>

            <div className="mt-8">
              {isConfirmed ? (
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex-1 rounded-md border px-4 py-3 text-center text-sm hover:bg-muted"
                  >
                    View in dashboard
                  </Link>
                  <Link
                    href="/rooms"
                    className="flex-1 rounded-md bg-primary px-4 py-3 text-center text-sm text-primary-foreground hover:opacity-90"
                  >
                    Browse more rooms
                  </Link>
                </div>
              ) : (
                <PaymentPanel bookingId={booking.id} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'border-t pt-2 font-medium' : 'text-muted-foreground'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
