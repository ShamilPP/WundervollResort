'use client'

import { RoomType } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Users, SortDesc, Filter, AlertCircle } from 'lucide-react'

export function RoomFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    type: params.get('type') ?? '',
    guests: params.get('guests') ?? '',
    sort: params.get('sort') ?? 'sortOrder',
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    adults: params.get('adults') ?? '1',
    children: params.get('children') ?? '0',
  }

  function update(next: Partial<typeof current>) {
    const sp = new URLSearchParams(params.toString())
    const merged = { ...current, ...next }

    // Sync guests if adults or children changed
    if (next.adults || next.children) {
      merged.guests = (parseInt(merged.adults) + parseInt(merged.children)).toString()
    }

    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }

    startTransition(() => router.push(`/rooms?${sp.toString()}`, { scroll: false }))
  }

  const totalGuests = parseInt(current.adults) + parseInt(current.children)
  const showCapacityWarning = totalGuests > 3

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Date & Capacity Search Bar (Primary) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Check-in
          </label>
          <input
            type="date"
            value={current.checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => update({ checkIn: e.target.value })}
            className="bg-transparent text-white border-b border-white/20 pb-2 focus:border-accent outline-none text-sm font-bold transition-colors [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Check-out
          </label>
          <input
            type="date"
            value={current.checkOut}
            min={current.checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => update({ checkOut: e.target.value })}
            className="bg-transparent text-white border-b border-white/20 pb-2 focus:border-accent outline-none text-sm font-bold transition-colors [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black flex items-center gap-2">
            <Users className="h-3 w-3" /> Adults
          </label>
          <select
            value={current.adults}
            onChange={(e) => update({ adults: e.target.value })}
            className="bg-transparent text-white border-b border-white/20 pb-2 focus:border-accent outline-none text-sm font-bold transition-colors appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n.toString()} className="bg-obsidian text-white">{n} Adult{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black flex items-center gap-2">
            <Users className="h-3 w-3" /> Children
          </label>
          <select
            value={current.children}
            onChange={(e) => update({ children: e.target.value })}
            className="bg-transparent text-white border-b border-white/20 pb-2 focus:border-accent outline-none text-sm font-bold transition-colors appearance-none cursor-pointer"
          >
            {[0, 1, 2, 3].map(n => (
              <option key={n} value={n.toString()} className="bg-obsidian text-white">{n} Child{n !== 1 ? 'ren' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black flex items-center gap-2">
            <SortDesc className="h-3 w-3" /> Sort By
          </label>
          <select
            value={current.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="bg-transparent text-white border-b border-white/20 pb-2 focus:border-accent outline-none text-sm font-bold transition-colors appearance-none cursor-pointer"
          >
            <option value="sortOrder" className="bg-obsidian text-white">Featured</option>
            <option value="price-asc" className="bg-obsidian text-white">Price: Low to High</option>
            <option value="price-desc" className="bg-obsidian text-white">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Capacity Warning */}
      {showCapacityWarning && (
        <div className="flex items-center gap-4 bg-accent/10 border border-accent/20 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5 text-accent shrink-0" />
          <p className="text-sm text-accent/90 font-medium">
            Our residences accommodate a <span className="font-black">maximum of 3 guests</span> each. For groups of {current.guests}, please consider selecting <span className="font-black">multiple rooms</span> to ensure comfort.
          </p>
        </div>
      )}

      {/* 2. Room Type Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-10">
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

      {isPending && (
        <div className="fixed top-8 right-8 z-50">
          <span className="text-[10px] uppercase tracking-[0.4em] text-accent animate-pulse font-black bg-obsidian/80 backdrop-blur-xl px-6 py-3 rounded-full border border-accent/20">
            Checking Sanctuary Availability…
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
