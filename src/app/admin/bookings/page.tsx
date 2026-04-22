import Link from 'next/link'
import { BookingStatus, type Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const where: Prisma.BookingWhereInput = {}
  if (
    searchParams.status &&
    Object.values(BookingStatus).includes(searchParams.status as BookingStatus)
  ) {
    where.status = searchParams.status as BookingStatus
  }
  if (searchParams.q) {
    where.OR = [
      { code: { contains: searchParams.q, mode: 'insensitive' } },
      { guestEmail: { contains: searchParams.q, mode: 'insensitive' } },
      { guestName: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const bookings = await prisma.booking
    .findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { name: true } } },
      take: 200,
    })
    .catch(() => [])

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {bookings.length} result{bookings.length === 1 ? '' : 's'}
          </p>
        </div>
        <a
          href={`/api/admin/bookings/export${
            searchParams.status ? `?status=${searchParams.status}` : ''
          }`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6 flex gap-2 rounded-lg border bg-card p-4">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search code, name, email…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(BookingStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <Th>Code</Th>
              <Th>Room</Th>
              <Th>Guest</Th>
              <Th>Dates</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <Td>{b.code}</Td>
                <Td>{b.room.name}</Td>
                <Td>
                  <p>{b.guestName}</p>
                  <p className="text-xs text-muted-foreground">{b.guestEmail}</p>
                </Td>
                <Td>
                  {new Date(b.checkIn).toLocaleDateString()} →{' '}
                  {new Date(b.checkOut).toLocaleDateString()}
                </Td>
                <Td>{formatINR(b.totalAmount)}</Td>
                <Td>{b.status.replace('_', ' ')}</Td>
                <Td>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="text-primary hover:underline"
                  >
                    Open
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </th>
)
const Td = ({ children }: { children?: React.ReactNode }) => (
  <td className="px-4 py-3">{children}</td>
)
