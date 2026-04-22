import { prisma } from '@/lib/db'
import { AvailabilityManager } from '@/components/admin/availability-manager'

export default async function AdminAvailabilityPage() {
  const [rooms, blocks, seasonal] = await Promise.all([
    prisma.room.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.blockedDate
      .findMany({
        orderBy: { startDate: 'asc' },
        include: { room: { select: { name: true } } },
      })
      .catch(() => []),
    prisma.seasonalPrice
      .findMany({
        orderBy: { startDate: 'asc' },
        include: { room: { select: { name: true } } },
      })
      .catch(() => []),
  ])

  return (
    <div>
      <h1 className="font-serif text-3xl">Availability</h1>
      <p className="text-sm text-muted-foreground">
        Block dates for maintenance and set seasonal pricing.
      </p>
      <AvailabilityManager rooms={rooms} blocks={blocks} seasonal={seasonal} />
    </div>
  )
}
