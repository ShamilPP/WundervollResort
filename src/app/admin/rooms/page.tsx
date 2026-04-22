import Link from 'next/link'
import { Plus } from 'lucide-react'

import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'

export default async function AdminRoomsPage() {
  const rooms = await prisma.room
    .findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { bookings: true } } },
    })
    .catch(() => [])

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage all {rooms.length} rooms.
          </p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New room
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Base price</Th>
              <Th>Guests</Th>
              <Th>Bookings</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-t">
                <Td>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.slug}</p>
                  </div>
                </Td>
                <Td>{r.type}</Td>
                <Td>{formatINR(r.basePrice)}</Td>
                <Td>{r.maxGuests}</Td>
                <Td>{r._count.bookings}</Td>
                <Td>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      r.isActive ? 'bg-green-100 text-green-900' : 'bg-muted'
                    }`}
                  >
                    {r.isActive ? 'Active' : 'Hidden'}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`/admin/rooms/${r.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
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
