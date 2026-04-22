'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { formatINR } from '@/lib/money'
import { toPaise } from '@/lib/money'

type Room = { id: string; name: string }
type Block = {
  id: string
  roomId: string
  startDate: Date
  endDate: Date
  reason: string | null
  room: { name: string }
}
type Season = {
  id: string
  roomId: string
  name: string
  startDate: Date
  endDate: Date
  price: number
  room: { name: string }
}

export function AvailabilityManager({
  rooms,
  blocks,
  seasonal,
}: {
  rooms: Room[]
  blocks: Block[]
  seasonal: Season[]
}) {
  const router = useRouter()
  const [block, setBlock] = useState({
    roomId: rooms[0]?.id ?? '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [season, setSeason] = useState({
    roomId: rooms[0]?.id ?? '',
    name: '',
    startDate: '',
    endDate: '',
    priceRupees: 20000,
  })

  async function addBlock(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block),
    })
    if (!res.ok) return toast.error('Could not add block')
    toast.success('Block added')
    router.refresh()
  }
  async function removeBlock(id: string) {
    const res = await fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Delete failed')
    router.refresh()
  }

  async function addSeason(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/seasonal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...season, price: toPaise(season.priceRupees) }),
    })
    if (!res.ok) return toast.error('Could not add season')
    toast.success('Seasonal price added')
    router.refresh()
  }
  async function removeSeason(id: string) {
    const res = await fetch(`/api/admin/seasonal/${id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Delete failed')
    router.refresh()
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 font-serif text-xl">Blocked dates</h2>
        <form onSubmit={addBlock} className="space-y-3 rounded-lg border bg-card p-4">
          <select value={block.roomId} onChange={(e) => setBlock({ ...block, roomId: e.target.value })} className={ic}>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" required value={block.startDate} onChange={(e) => setBlock({ ...block, startDate: e.target.value })} className={ic} />
            <input type="date" required value={block.endDate} onChange={(e) => setBlock({ ...block, endDate: e.target.value })} className={ic} />
          </div>
          <input placeholder="Reason (optional)" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} className={ic} />
          <button className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground">Add block</button>
        </form>

        <ul className="mt-4 space-y-2">
          {blocks.length === 0 && <li className="text-sm text-muted-foreground">No blocks yet.</li>}
          {blocks.map((b) => (
            <li key={b.id} className="flex items-start justify-between rounded-md border bg-card p-3 text-sm">
              <div>
                <p className="font-medium">{b.room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </p>
                {b.reason && <p className="mt-1 text-xs">{b.reason}</p>}
              </div>
              <button onClick={() => removeBlock(b.id)} className="text-xs text-destructive hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl">Seasonal pricing</h2>
        <form onSubmit={addSeason} className="space-y-3 rounded-lg border bg-card p-4">
          <select value={season.roomId} onChange={(e) => setSeason({ ...season, roomId: e.target.value })} className={ic}>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input placeholder="Label (e.g. Christmas peak)" required value={season.name} onChange={(e) => setSeason({ ...season, name: e.target.value })} className={ic} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" required value={season.startDate} onChange={(e) => setSeason({ ...season, startDate: e.target.value })} className={ic} />
            <input type="date" required value={season.endDate} onChange={(e) => setSeason({ ...season, endDate: e.target.value })} className={ic} />
          </div>
          <input type="number" placeholder="Price per night (₹)" value={season.priceRupees} onChange={(e) => setSeason({ ...season, priceRupees: Number(e.target.value) })} className={ic} />
          <button className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground">Add season</button>
        </form>

        <ul className="mt-4 space-y-2">
          {seasonal.length === 0 && <li className="text-sm text-muted-foreground">No seasonal pricing yet.</li>}
          {seasonal.map((s) => (
            <li key={s.id} className="flex items-start justify-between rounded-md border bg-card p-3 text-sm">
              <div>
                <p className="font-medium">{s.name} · {s.room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()} · {formatINR(s.price)}
                </p>
              </div>
              <button onClick={() => removeSeason(s.id)} className="text-xs text-destructive hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const ic = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
