import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

import { prisma } from '@/lib/db'
import { formatINR } from '@/lib/money'
import { cn } from '@/lib/utils'

export default async function AdminRoomsPage() {
  const rooms = await prisma.room
    .findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { bookings: true } } },
    })
    .catch(() => [])

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-obsidian tracking-tight">Residence <span className="text-accent italic font-light">Inventory</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-obsidian/30 mt-1">
            Managing {rooms.length} curated sanctuaries.
          </p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Residence
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[2.5rem] border border-obsidian/5 bg-white shadow-sm scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-obsidian/5">
              <Th>Residence</Th>
              <Th>Type</Th>
              <Th>Investment</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian/[0.02]">
            {rooms.map((r) => (
              <tr key={r.id} className="group hover:bg-obsidian/[0.01] transition-colors">
                <Td>
                  <div className="min-w-[200px]">
                    <p className="text-[13px] font-bold text-obsidian">{r.name}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-obsidian/20">{r.slug}</p>
                  </div>
                </Td>
                <Td>
                  <span className="text-[10px] font-black uppercase tracking-widest text-obsidian/40">{r.type}</span>
                </Td>
                <Td>
                  <span className="text-[13px] font-bold text-obsidian">{formatINR(r.basePrice)}</span>
                </Td>
                <Td>
                  <span
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest",
                      r.isActive ? "bg-green-50 text-green-700" : "bg-obsidian/5 text-obsidian/30"
                    )}
                  >
                    {r.isActive ? 'Active' : 'Archived'}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`/admin/rooms/${r.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-obsidian/5 text-obsidian/40 hover:bg-accent hover:text-white transition-all shadow-sm"
                  >
                    <span className="sr-only">Edit</span>
                    <Pencil className="h-3.5 w-3.5" />
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
  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-obsidian/30 border-b border-obsidian/5 bg-[#FDFCFB]/50">
    {children}
  </th>
)
const Td = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <td className={cn("px-8 py-6", className)}>{children}</td>
)
