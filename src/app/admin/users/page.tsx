import { prisma } from '@/lib/db'

export default async function AdminUsersPage() {
  const users = await prisma.user
    .findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { bookings: true } } },
    })
    .catch(() => [])

  return (
    <div>
      <h1 className="font-serif text-3xl">Users</h1>
      <p className="text-sm text-muted-foreground">{users.length} user{users.length === 1 ? '' : 's'}</p>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Bookings</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <Td>{u.name ?? '—'}</Td>
                <Td>{u.email}</Td>
                <Td className="font-mono text-xs">{u.phone ?? '—'}</Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${u.role === 'ADMIN' ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                    {u.role}
                  </span>
                </Td>
                <Td>{u._count.bookings}</Td>
                <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{children}</th>
)
const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>
)
