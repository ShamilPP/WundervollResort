import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'

export default async function AdminAnalyticsPage() {
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const [confirmed, pending, cancelled, refunded, revenueAgg, byRoom] = await Promise.all([
    prisma.booking.count({ where: { status: 'CONFIRMED' } }).catch(() => 0),
    prisma.booking.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.booking.count({ where: { status: 'CANCELLED' } }).catch(() => 0),
    prisma.booking.count({ where: { status: 'REFUNDED' } }).catch(() => 0),
    prisma.booking
      .aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED', createdAt: { gte: since } },
      })
      .catch(() => ({ _sum: { totalAmount: 0 } })),
    prisma.booking
      .groupBy({
        by: ['roomId'],
        _count: { id: true },
        _sum: { totalAmount: true },
        where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] } },
      })
      .catch(() => [] as { roomId: string; _count: { id: number }; _sum: { totalAmount: number | null } }[]),
  ])

  const rooms = await prisma.room.findMany().catch(() => [])
  const roomById = new Map(rooms.map((r) => [r.id, r.name]))
  const topRooms = (byRoom as { roomId: string; _count: { id: number }; _sum: { totalAmount: number | null } }[])
    .map((r) => ({
      name: roomById.get(r.roomId) ?? r.roomId,
      count: r._count.id,
      revenue: r._sum.totalAmount ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  const revenue90d = revenueAgg._sum.totalAmount ?? 0
  const maxRevenue = Math.max(1, ...topRooms.map((r) => r.revenue))

  return (
    <div>
      <h1 className="font-serif text-3xl">Analytics</h1>
      <p className="text-sm text-muted-foreground">Last 90 days.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Kpi label="Confirmed" value={String(confirmed)} />
        <Kpi label="Pending" value={String(pending)} />
        <Kpi label="Cancelled" value={String(cancelled)} />
        <Kpi label="Refunded" value={String(refunded)} />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Revenue (90 days)
        </p>
        <p className="mt-1 font-serif text-3xl">{formatINR(revenue90d)}</p>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl">Top rooms by revenue</h2>
        {topRooms.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <div className="space-y-2 rounded-lg border bg-card p-6">
            {topRooms.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="text-muted-foreground">
                    {r.count} booking{r.count === 1 ? '' : 's'} · {formatINR(r.revenue)}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  )
}
