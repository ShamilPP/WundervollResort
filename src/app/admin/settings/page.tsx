import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export default async function AdminSettingsPage() {
  const session = await auth()

  const [rooms, activeRooms, bookings, users] = await Promise.all([
    prisma.room.count().catch(() => 0),
    prisma.room.count({ where: { isActive: true } }).catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl">Settings</h1>
      <p className="text-sm text-muted-foreground">Your admin account and site overview.</p>

      <section className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="font-serif text-xl">Your account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Name" value={session?.user?.name ?? '—'} />
          <Row label="Email" value={session?.user?.email ?? '—'} />
          <Row label="Role" value={session?.user?.role ?? '—'} />
        </dl>
      </section>

      <section className="mt-6 rounded-lg border bg-card p-6">
        <h2 className="font-serif text-xl">Site overview</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Total rooms" value={rooms} />
          <Stat label="Active rooms" value={activeRooms} />
          <Stat label="Total bookings" value={bookings} />
          <Stat label="Registered users" value={users} />
        </dl>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  )
}
