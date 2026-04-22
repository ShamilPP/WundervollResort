import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { formatINR } from '@/lib/money'

async function logoutAction() {
  'use server'
  await signOut({ redirectTo: '/' })
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const bookings = await prisma.booking
    .findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { name: true, slug: true } }, payment: true },
    })
    .catch(() => [])

  return (
    <>
      <Navbar />
      <main className="container pt-28">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              My account
            </p>
            <h1 className="mt-2 font-serif text-4xl">
              Welcome, {session.user.name ?? session.user.email}
            </h1>
          </div>
          <div className="flex gap-2">
            {session.user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Admin panel
              </Link>
            )}
            <form action={logoutAction}>
              <button className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <section>
          <h2 className="mb-4 font-serif text-2xl">My bookings</h2>
          {bookings.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t made a booking yet.
              </p>
              <Link
                href="/rooms"
                className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Browse rooms
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/bookings/${b.id}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-5 transition hover:shadow-md"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{b.code}</p>
                    <p className="mt-1 font-serif text-lg">{b.room.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(b.checkIn).toLocaleDateString()} →{' '}
                      {new Date(b.checkOut).toLocaleDateString()} ·{' '}
                      {b.nights} night{b.nights === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status} />
                    <p className="mt-2 text-sm font-medium">
                      {formatINR(b.totalAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-900',
    CONFIRMED: 'bg-green-100 text-green-900',
    CHECKED_IN: 'bg-blue-100 text-blue-900',
    CHECKED_OUT: 'bg-gray-100 text-gray-900',
    CANCELLED: 'bg-red-100 text-red-900',
    REFUNDED: 'bg-purple-100 text-purple-900',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] ?? 'bg-muted'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
