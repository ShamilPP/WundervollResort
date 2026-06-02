import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getAdvancePercentage } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function AdminSettingsPage() {
  const session = await auth()

  const [rooms, activeRooms, bookings, users, advancePercentage] = await Promise.all([
    prisma.room.count().catch(() => 0),
    prisma.room.count({ where: { isActive: true } }).catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    getAdvancePercentage(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-obsidian">Settings</h1>
        <p className="text-sm text-muted-foreground">Your admin account and resort configurations.</p>
      </div>

      {/* Dynamic Advance Setup Control */}
      <section>
        <SettingsForm initialAdvance={advancePercentage} />
      </section>

      {/* Account Info */}
      <section className="rounded-2xl border border-obsidian/5 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-obsidian">Your Admin Account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Name" value={session?.user?.name ?? '—'} />
          <Row label="Email" value={session?.user?.email ?? '—'} />
          <Row label="Role" value={session?.user?.role ?? '—'} />
        </dl>
      </section>

      {/* Statistics */}
      <section className="rounded-2xl border border-obsidian/5 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-obsidian">Site Overview</h2>
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
    <div className="flex justify-between border-b border-obsidian/5 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="font-bold text-obsidian">{value}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#FDFCFB] border border-obsidian/5 rounded-xl p-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-serif text-2xl font-black text-obsidian">{value}</dd>
    </div>
  )
}
