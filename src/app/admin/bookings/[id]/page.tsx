import Link from 'next/link'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'
import { BookingActions } from '@/components/admin/booking-actions'

export default async function AdminBookingDetail({
  params,
}: {
  params: { id: string }
}) {
  const booking = await prisma.booking
    .findUnique({
      where: { id: params.id },
      include: { room: true, user: true, payment: true },
    })
    .catch(() => null)
  if (!booking) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/bookings" className="text-sm text-muted-foreground hover:underline">
        ← All bookings
      </Link>

      <div className="mt-4 rounded-lg border bg-card p-6">
        <p className="text-xs text-muted-foreground">{booking.code}</p>
        <h1 className="mt-1 font-serif text-2xl">{booking.room.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(booking.checkIn).toLocaleDateString()} →{' '}
          {new Date(booking.checkOut).toLocaleDateString()} · {booking.nights}{' '}
          night{booking.nights === 1 ? '' : 's'}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Guest" value={booking.guestName} />
          <Info label="Email" value={booking.guestEmail} />
          <Info label="Phone" value={booking.guestPhone ?? '—'} />
          <Info label="Guests" value={String(booking.guestCount)} />
          <Info label="Status" value={booking.status} />
          <Info label="Subtotal" value={formatINR(booking.subtotal)} />
          <Info label="Taxes" value={formatINR(booking.taxes)} />
          <Info label="Total" value={formatINR(booking.totalAmount)} />
        </dl>

        {booking.specialRequests && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Special requests
            </p>
            <p className="mt-2 text-sm">{booking.specialRequests}</p>
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <h2 className="mb-3 font-serif text-lg">Actions</h2>
          <BookingActions id={booking.id} currentStatus={booking.status} />
        </div>
      </div>

      {booking.payment && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="font-serif text-lg">Payment</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Status" value={booking.payment.status} />
            <Info label="Method" value={booking.payment.method} />
            <Info label="Amount" value={formatINR(booking.payment.amount)} />
            <Info label="Stripe PI" value={booking.payment.stripePaymentIntentId ?? '—'} />
          </dl>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}
