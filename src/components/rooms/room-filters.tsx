'use client'

import { RoomType } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Users, SortDesc, Filter, AlertCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/style.css'

export function RoomFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [openDropdown, setOpenDropdown] = useState<'checkIn' | 'checkOut' | 'adults' | 'children' | 'sort' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  }

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
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* 1. Date & Capacity Search Bar (Primary) */}
      <div ref={containerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 bg-slate-50/60 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100/80 relative">
        <div className="flex flex-col gap-3 relative cursor-pointer">
          <label className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-black flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Check-in
          </label>
          <div
            onClick={() => setOpenDropdown(openDropdown === 'checkIn' ? null : 'checkIn')}
            className="bg-transparent text-slate-800 border-b border-slate-200/80 pb-2 outline-none text-sm font-bold transition-colors flex justify-between items-center w-full cursor-pointer hover:text-accent group"
          >
            <span>{current.checkIn ? format(new Date(current.checkIn), 'MMM d, yyyy') : 'Select Date'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <AnimatePresence>
            {openDropdown === 'checkIn' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
              >
                <DayPicker
                  mode="single"
                  selected={current.checkIn ? new Date(current.checkIn) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      update({ checkIn: format(date, 'yyyy-MM-dd') })
                      setOpenDropdown('checkOut')
                    }
                  }}
                  disabled={[{ before: new Date() }]}
                  className="!font-sans text-black"
                  style={{
                    '--rdp-color': 'black',
                    '--rdp-background': 'transparent',
                    '--rdp-accent-color': 'var(--accent)',
                  } as any}
                  modifiersClassNames={{
                    selected: 'bg-accent text-white hover:bg-accent hover:text-white',
                    today: 'text-accent font-bold'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 relative cursor-pointer">
          <label className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-black flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Check-out
          </label>
          <div
            onClick={() => setOpenDropdown(openDropdown === 'checkOut' ? null : 'checkOut')}
            className="bg-transparent text-slate-800 border-b border-slate-200/80 pb-2 outline-none text-sm font-bold transition-colors flex justify-between items-center w-full cursor-pointer hover:text-accent group"
          >
            <span>{current.checkOut ? format(new Date(current.checkOut), 'MMM d, yyyy') : 'Select Date'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <AnimatePresence>
            {openDropdown === 'checkOut' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
              >
                <DayPicker
                  mode="single"
                  selected={current.checkOut ? new Date(current.checkOut) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      update({ checkOut: format(date, 'yyyy-MM-dd') })
                      setOpenDropdown(null)
                    }
                  }}
                  disabled={[{ before: current.checkIn ? new Date(current.checkIn) : new Date() }]}
                  className="!font-sans text-black"
                  style={{
                    '--rdp-color': 'black',
                    '--rdp-background': 'transparent',
                    '--rdp-accent-color': 'var(--accent)',
                  } as any}
                  modifiersClassNames={{
                    selected: 'bg-accent text-white hover:bg-accent hover:text-white',
                    today: 'text-accent font-bold'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 relative cursor-pointer">
          <label className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-black flex items-center gap-2">
            <Users className="h-3 w-3" /> Adults
          </label>
          <div
            onClick={() => setOpenDropdown(openDropdown === 'adults' ? null : 'adults')}
            className="bg-transparent text-slate-800 border-b border-slate-200/80 pb-2 outline-none text-sm font-bold transition-colors flex justify-between items-center w-full cursor-pointer hover:text-accent group"
          >
            <span>{current.adults} Adult{parseInt(current.adults) > 1 ? 's' : ''}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <AnimatePresence>
            {openDropdown === 'adults' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 w-full min-w-[150px] bg-white border border-black/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              >
                {[1, 2, 3, 4].map(n => (
                  <div
                    key={n}
                    onClick={() => {
                      update({ adults: n.toString() })
                      setOpenDropdown(null)
                    }}
                    className="px-6 py-3 text-black hover:bg-black/5 cursor-pointer text-sm font-bold transition-colors"
                  >
                    {n} Adult{n > 1 ? 's' : ''}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 relative cursor-pointer">
          <label className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-black flex items-center gap-2">
            <Users className="h-3 w-3" /> Children
          </label>
          <div
            onClick={() => setOpenDropdown(openDropdown === 'children' ? null : 'children')}
            className="bg-transparent text-slate-800 border-b border-slate-200/80 pb-2 outline-none text-sm font-bold transition-colors flex justify-between items-center w-full cursor-pointer hover:text-accent group"
          >
            <span>{current.children} Child{parseInt(current.children) !== 1 ? 'ren' : ''}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <AnimatePresence>
            {openDropdown === 'children' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 w-full min-w-[150px] bg-white border border-black/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              >
                {[0, 1, 2, 3].map(n => (
                  <div
                    key={n}
                    onClick={() => {
                      update({ children: n.toString() })
                      setOpenDropdown(null)
                    }}
                    className="px-6 py-3 text-black hover:bg-black/5 cursor-pointer text-sm font-bold transition-colors"
                  >
                    {n} Child{n !== 1 ? 'ren' : ''}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 relative cursor-pointer">
          <label className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-black flex items-center gap-2">
            <SortDesc className="h-3 w-3" /> Sort By
          </label>
          <div
            onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
            className="bg-transparent text-slate-800 border-b border-slate-200/80 pb-2 outline-none text-sm font-bold transition-colors flex justify-between items-center w-full cursor-pointer hover:text-accent group"
          >
            <span>
              {current.sort === 'price-asc' ? 'Price: Low to High' : current.sort === 'price-desc' ? 'Price: High to Low' : 'Featured'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <AnimatePresence>
            {openDropdown === 'sort' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white border border-black/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              >
                {[
                  { value: 'sortOrder', label: 'Featured' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      update({ sort: opt.value })
                      setOpenDropdown(null)
                    }}
                    className="px-6 py-3 text-black hover:bg-black/5 cursor-pointer text-sm font-bold transition-colors"
                  >
                    {opt.label}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-t border-slate-100 pt-10">
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
        'px-4 sm:px-8 py-2.5 sm:py-3 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] transition-all duration-500 rounded-full border font-black',
        active
          ? 'bg-accent text-white border-accent shadow-xl shadow-accent/20'
          : 'bg-slate-100 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-accent hover:border-accent/40',
      )}
    >
      {label}
    </button>
  )
}
