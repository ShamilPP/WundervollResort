'use client'

import { RoomType } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Users, SortDesc, Filter } from 'lucide-react'

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

    // { scroll: false } prevents the page from jumping back to the top
    startTransition(() => router.push(`/rooms?${sp.toString()}`, { scroll: false }))
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Room Type Selection */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FilterPill
          active={current.type === ''}
          onClick={() => update({ type: '' })}
          label="All Residences"
        />
        {Object.values(RoomType).map((t) => (
          <FilterPill
            key={t}
            active={current.type === t}
            onClick={() => update({ type: t })}
            label={t.charAt(0) + t.slice(1).toLowerCase()}
          />
        ))}
      </div>

      {/* 2. Secondary Filters: Capacity & Sort */}
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 border-t border-white/10 pt-10">
        {/* Capacity Selector */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 text-white/40">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em] font-black">Capacity</span>
          </div>
          <div className="flex items-center gap-6">
            {['', '2', '4', '6'].map((g) => (
              <button
                key={g}
                onClick={() => update({ guests: g })}
                className={cn(
                  "text-[13px] font-bold tracking-wide transition-all duration-300",
                  current.guests === g ? "text-accent underline underline-offset-[10px] decoration-2" : "text-white/60 hover:text-white"
                )}
              >
                {g === '' ? 'Any' : `${g}+ Guests`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 text-white/40">
            <SortDesc className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em] font-black">Sort By</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { id: 'sortOrder', label: 'Featured' },
              { id: 'price-asc', label: 'Price ↓' },
              { id: 'price-desc', label: 'Price ↑' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => update({ sort: s.id })}
                className={cn(
                  "text-[13px] font-bold tracking-wide transition-all duration-300",
                  current.sort === s.id ? "text-accent underline underline-offset-[10px] decoration-2" : "text-white/60 hover:text-white"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="absolute top-4 right-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-accent animate-pulse font-bold">
            Refreshing Gallery…
          </span>
        </div>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-8 py-3 text-[11px] uppercase tracking-[0.4em] transition-all duration-500 rounded-full border font-black',
        active
          ? 'bg-accent text-white border-accent shadow-xl shadow-accent/20'
          : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white',
      )}
    >
      {label}
    </button>
  )
}
