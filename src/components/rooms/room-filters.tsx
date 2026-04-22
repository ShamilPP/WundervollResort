'use client'

import { RoomType } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function RoomFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    type: params.get('type') ?? '',
    guests: params.get('guests') ?? '',
    sort: params.get('sort') ?? 'sortOrder',
  }

  function update(next: Partial<typeof current>) {
    const sp = new URLSearchParams(params.toString())
    const merged = { ...current, ...next }
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    startTransition(() => router.push(`/rooms?${sp.toString()}`))
  }

  return (
    <div className="mb-8 flex flex-wrap gap-3 rounded-lg border bg-card p-4">
      <select
        value={current.type}
        onChange={(e) => update({ type: e.target.value })}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">All room types</option>
        {Object.values(RoomType).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={current.guests}
        onChange={(e) => update({ guests: e.target.value })}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Any capacity</option>
        <option value="2">2+ guests</option>
        <option value="4">4+ guests</option>
        <option value="6">6+ guests</option>
      </select>
      <select
        value={current.sort}
        onChange={(e) => update({ sort: e.target.value })}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="sortOrder">Featured</option>
        <option value="price-asc">Price: low → high</option>
        <option value="price-desc">Price: high → low</option>
      </select>
      {isPending && <span className="self-center text-xs text-muted-foreground">updating…</span>}
    </div>
  )
}
