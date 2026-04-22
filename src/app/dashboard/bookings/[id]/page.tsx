import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { formatINR } from '@/lib/money'

export default async function BookingDetailPage({
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

  return (
    <>
      <Navbar />
      <main className="container pt-28">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to dashboard
        </Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-xs text-muted-foreground">{booking.code}</p>
              <h1 className="mt-1 font-serif text-3xl">{booking.room.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(booking.checkIn).toLocaleDateString()} →{' '}
                {new Date(booking.checkOut).toLocaleDateString()} ·{' '}
                {booking.nights} night{booking.nights === 1 ? '' : 's'}
              </p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="Guest" value={booking.guestName} />
                <Info label="Email" value={booking.guestEmail} />
                <Info label="Phone" value={booking.guestPhone ?? '—'} />
                <Info label="Guests" value={String(booking.guestCount)} />
                <Info label="Status" value={booking.status.replace('_', ' ')} />
                <Info label="Created" value={new Date(booking.createdAt).toLocaleString()} />
              </dl>

              {booking.specialRequests && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Special requests
                  </p>
                  <p className="mt-2 text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          <aside>
            <div className="rounded-lg border bg-card p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Payment
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(booking.subtotal)} />
                <Row label="Taxes" value={formatINR(booking.taxes)} />
                <Row label="Total" value={formatINR(booking.totalAmount)} bold />
              </div>

              {booking.status === 'PENDING' && !booking.payment && (
                <Link
                  href={`/booking/confirmation/${booking.id}`}
                  className="mt-6 block rounded-md bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Complete payment
                </Link>
              )}
              {booking.payment && (
                <p className="mt-6 rounded-md bg-secondary p-3 text-sm">
                  Paid via {booking.payment.method} ·{' '}
                  <span className="font-medium">{booking.payment.status}</span>
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
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
