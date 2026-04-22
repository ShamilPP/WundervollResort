import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'

export default async function AdminDashboard() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [rooms, users, bookings, recent, revenueAgg] = await Promise.all([
    prisma.room.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.booking
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { room: { select: { name: true } } },
      })
      .catch(() => []),
    prisma.booking
      .aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED', createdAt: { gte: since } },
      })
      .catch(() => ({ _sum: { totalAmount: 0 } })),
  ])

  const revenue30d = revenueAgg._sum.totalAmount ?? 0

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of your resort.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Kpi label="Rooms" value={String(rooms)} />
        <Kpi label="Users" value={String(users)} />
        <Kpi label="Total bookings" value={String(bookings)} />
        <Kpi label="Revenue (30d)" value={formatINR(revenue30d)} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl">Recent bookings</h2>
        {recent.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <Th>Code</Th>
                  <Th>Room</Th>
                  <Th>Guest</Th>
                  <Th>Dates</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-t">
                    <Td>{b.code}</Td>
                    <Td>{b.room.name}</Td>
                    <Td>{b.guestName}</Td>
                    <Td>
                      {new Date(b.checkIn).toLocaleDateString()} →{' '}
                      {new Date(b.checkOut).toLocaleDateString()}
                    </Td>
                    <Td>{formatINR(b.totalAmount)}</Td>
                    <Td>{b.status.replace('_', ' ')}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  )
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </th>
)
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3">{children}</td>
)
