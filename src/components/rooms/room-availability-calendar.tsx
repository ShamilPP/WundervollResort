'use client'

import { useEffect, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { useSearchParams, useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import 'react-day-picker/style.css'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { formatINR } from '@/lib/money'
import { useBookingDraft } from '@/store/booking-draft'

type Props = {
  roomId: string
  slug: string
  basePrice: number
  weekendPrice?: number | null
  maxGuests?: number
  extraAdultPrice?: number | null
  extraChildPrice?: number | null
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

export function RoomAvailabilityCalendar({ roomId, slug, basePrice, maxGuests, extraAdultPrice, extraChildPrice }: Props) {
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
  const [adults, setAdults] = useState(() => parseInt(searchParams.get('adults') ?? '2', 10))
  const [children, setChildren] = useState(() => parseInt(searchParams.get('children') ?? '0', 10))
  
  const setRoom = useBookingDraft((s) => s.setRoom)
  const setDates = useBookingDraft((s) => s.setDates)
  const setGuestCount = useBookingDraft((s) => s.setGuestCount)
  const setGuestsSplit = useBookingDraft((s) => s.setGuestsSplit)
  const setStoreSpecialRequests = useBookingDraft((s) => s.setSpecialRequests)
  const draftNote = useBookingDraft((s) => s.specialRequests)

  const [specialRequests, setSpecialRequests] = useState(draftNote || '')

  const { data: session } = useSession()
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setGuestName(session.user.name)
      if (session.user.email) setGuestEmail(session.user.email)
    }
  }, [session])

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
  }, [range, roomId, adults, children])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!range?.from || !range?.to) {
      toast.error('Please pick check-in and check-out dates.')
      return
    }
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Please complete all guest details.')
      return
    }
    if (!quote?.available) {
      toast.error('These dates are no longer available.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          checkIn: range.from.toISOString(),
          checkOut: range.to.toISOString(),
          adults,
          children,
          guestCount: adults + children,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests: specialRequests || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create booking')
      
      // Clear drafts
      setRoom('')
      setDates('', '')
      setStoreSpecialRequests('')
      
      toast.success('Reservation created successfully!')
      router.push(`/booking/confirmation/${data.id}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSubmitting(true)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-brand-obsidian/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-brand-obsidian">Adults</p>
            <p className="text-[9px] text-brand-obsidian/40 uppercase tracking-widest mt-1">
              12+ yrs &bull; +{formatINR(extraAdultPrice || 1500)}/night after 2
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className="w-8 h-8 rounded-full border border-brand-obsidian/10 flex items-center justify-center hover:bg-brand-obsidian/5"
            >
              <Minus className="w-3 h-3 text-brand-obsidian" />
            </button>
            <span className="text-sm font-bold w-4 text-center">{adults}</span>
            <button
              type="button"
              onClick={() => {
                if (!maxGuests || adults + children < maxGuests) {
                  setAdults(adults + 1)
                }
              }}
              className="w-8 h-8 rounded-full border border-brand-obsidian/10 flex items-center justify-center hover:bg-brand-obsidian/5 opacity-80 hover:opacity-100"
            >
              <Plus className="w-3 h-3 text-brand-obsidian" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-brand-obsidian/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-brand-obsidian">Children</p>
            <p className="text-[9px] text-brand-obsidian/40 uppercase tracking-widest mt-1">
              0-11 yrs &bull; +{formatINR(extraChildPrice || 750)}/night
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChildren(Math.max(0, children - 1))}
              className="w-8 h-8 rounded-full border border-brand-obsidian/10 flex items-center justify-center hover:bg-brand-obsidian/5"
            >
              <Minus className="w-3 h-3 text-brand-obsidian" />
            </button>
            <span className="text-sm font-bold w-4 text-center">{children}</span>
            <button
              type="button"
              onClick={() => {
                if (!maxGuests || adults + children < maxGuests) {
                  setChildren(children + 1)
                }
              }}
              className="w-8 h-8 rounded-full border border-brand-obsidian/10 flex items-center justify-center hover:bg-brand-obsidian/5 opacity-80 hover:opacity-100"
            >
              <Plus className="w-3 h-3 text-brand-obsidian" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.3em] text-brand-obsidian/40 font-black pl-1">
          Special Requests or Notes
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests or notes for your stay?"
          rows={2}
          className="w-full rounded-2xl border border-brand-obsidian/10 bg-white p-4 text-sm font-bold text-brand-obsidian placeholder:text-brand-obsidian/20 focus:outline-none focus:border-accent transition-all resize-none shadow-sm"
        />
      </div>

      <div className="p-3 bg-brand-obsidian/5 rounded-xl border border-brand-obsidian/10 mt-2">
        <p className="text-[10px] text-brand-obsidian/60 italic leading-relaxed text-center">
          * Note: The base room rate includes up to 2 adults. Maximum room capacity is {maxGuests || 3} guests. Extra guest charges are applied per night.
        </p>
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
            {/* Direct Guest Information fields inside sanctuary sidebar */}
            <div className="space-y-4 pt-4 border-t border-brand-obsidian/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                  Guest Information
                </span>
                <div className="h-px flex-1 bg-accent/10" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-brand-obsidian/40 font-bold block pl-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    placeholder="Your Full Name"
                    className="w-full rounded-xl border border-brand-obsidian/10 bg-[#FDFCFB] px-4 py-3.5 text-sm font-bold text-brand-obsidian placeholder:text-brand-obsidian/20 focus:outline-none focus:border-accent transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-brand-obsidian/40 font-bold block pl-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-brand-obsidian/10 bg-[#FDFCFB] px-4 py-3.5 text-sm font-bold text-brand-obsidian placeholder:text-brand-obsidian/20 focus:outline-none focus:border-accent transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-brand-obsidian/40 font-bold block pl-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    placeholder="+91 00000 00000"
                    className="w-full rounded-xl border border-brand-obsidian/10 bg-[#FDFCFB] px-4 py-3.5 text-sm font-bold text-brand-obsidian placeholder:text-brand-obsidian/20 focus:outline-none focus:border-accent transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-brand-obsidian/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40">{quote.nights} night{quote.nights === 1 ? '' : 's'} stay</span>
                <span className="font-bold text-brand-obsidian">{formatINR(quote.subtotal!)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40">Luxury Taxes (12%)</span>
                <span className="font-bold text-brand-obsidian">{formatINR(quote.taxes!)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-brand-obsidian/5 pt-4">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-obsidian">Total</span>
              <span className="text-2xl font-serif font-bold text-accent">{formatINR(quote.total!)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-brand-obsidian py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-accent transition-all duration-500 shadow-xl shadow-brand-obsidian/10 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Creating Sanctuary Draft...' : 'Confirm Reservation'}
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
    </form>
  )
}
