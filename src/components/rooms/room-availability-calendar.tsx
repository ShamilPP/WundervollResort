'use client'

import { useEffect, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { useSearchParams, useRouter } from 'next/navigation'
import 'react-day-picker/style.css'

import { formatINR } from '@/lib/money'
import { useBookingDraft } from '@/store/booking-draft'

type Props = {
  roomId: string
  slug: string
  basePrice: number
  weekendPrice?: number | null
}

type Unavailable = {
  booked: { from: string; to: string }[]
  blocked: { from: string; to: string }[]
}

type Quote = {
  available: boolean
  nights?: number
  subtotal?: number
  taxes?: number
  total?: number
  error?: string
}

export function RoomAvailabilityCalendar({ roomId, slug, basePrice }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize range from search params
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    if (checkIn && checkOut) {
      return { from: new Date(checkIn), to: new Date(checkOut) }
    }
    return undefined
  })

  const [disabled, setDisabled] = useState<Date[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const setRoom = useBookingDraft((s) => s.setRoom)
  const setDates = useBookingDraft((s) => s.setDates)
  const setGuestCount = useBookingDraft((s) => s.setGuestCount)
  const setGuestsSplit = useBookingDraft((s) => s.setGuestsSplit)

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/availability`)
      .then((r) => r.json())
      .then((data: Unavailable) => {
        const dates: Date[] = []
        const expand = (from: string, to: string) => {
          const f = new Date(from)
          const t = new Date(to)
          for (let d = new Date(f); d < t; d.setUTCDate(d.getUTCDate() + 1)) {
            dates.push(new Date(d))
          }
        }
        data.booked?.forEach((b) => expand(b.from, b.to))
        data.blocked?.forEach((b) => expand(b.from, b.to))
        setDisabled(dates)
      })
      .catch(() => { })
  }, [roomId])

  useEffect(() => {
    // Only call API if we have two different dates
    if (!range?.from || !range?.to || range.from.getTime() === range.to.getTime()) {
      setQuote(null)
      return
    }

    const adults = parseInt(searchParams.get('adults') ?? '2', 10)
    const children = parseInt(searchParams.get('children') ?? '0', 10)

    setLoading(true)
    fetch('/api/bookings/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        checkIn: range.from.toISOString(),
        checkOut: range.to.toISOString(),
        adults,
        children,
      }),
    })
      .then((r) => r.json())
      .then((q) => setQuote(q))
      .finally(() => setLoading(false))
  }, [range, roomId, searchParams])

  function proceed() {
    if (!range?.from || !range?.to) return
    setRoom(roomId)
    setDates(range.from.toISOString(), range.to.toISOString())
    
    const adults = searchParams.get('adults')
    const children = searchParams.get('children')
    const guests = searchParams.get('guests')

    if (adults && children) {
      setGuestsSplit(parseInt(adults, 10), parseInt(children, 10))
    } else if (guests) {
      setGuestCount(parseInt(guests, 10))
    }
    
    router.push(`/booking/${roomId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-4 bg-[#FDFCFB] rounded-3xl border border-brand-obsidian/5">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={[{ before: new Date() }, ...disabled]}
          numberOfMonths={1}
          className="!font-sans"
        />
      </div>

      <div className="space-y-6 pt-4 border-t border-brand-obsidian/5">
        {!range?.from ? (
          <p className="text-xs font-medium text-brand-obsidian/30 uppercase tracking-[0.2em] text-center">
            Pick check-in and check-out dates
          </p>
        ) : !range?.to || range.from.getTime() === range.to.getTime() ? (
          <p className="text-xs font-bold text-accent uppercase tracking-widest text-center animate-pulse">
            Now select your departure date
          </p>
        ) : loading ? (
          <p className="text-center text-brand-obsidian/40 italic">Calculating investment…</p>
        ) : quote?.available ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40">{quote.nights} night{quote.nights === 1 ? '' : 's'} stay</span>
                <span className="font-bold text-brand-obsidian">{formatINR(quote.subtotal!)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40">Luxury Taxes</span>
                <span className="font-bold text-brand-obsidian">{formatINR(quote.taxes!)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-brand-obsidian/5 pt-4">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-obsidian">Total</span>
              <span className="text-2xl font-serif font-bold text-accent">{formatINR(quote.total!)}</span>
            </div>

            <button
              onClick={proceed}
              className="w-full rounded-2xl bg-brand-obsidian py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-accent transition-all duration-500 shadow-xl shadow-brand-obsidian/10 active:scale-95"
            >
              Confirm Reservation
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 text-center">
            <p className="text-xs font-bold text-destructive uppercase tracking-widest">
              {quote?.error === 'ROOM_UNAVAILABLE'
                ? 'Dates already claimed'
                : 'Sanctuary unavailable'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/20">
          Residence {slug}
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/20">
          From {formatINR(basePrice)} / Night
        </p>
      </div>
    </div>
  )
}
