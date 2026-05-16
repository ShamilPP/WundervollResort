'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import { formatINR } from '@/lib/money'
import { useBookingDraft } from '@/store/booking-draft'

type Props = {
  roomId: string
  roomName: string
  maxGuests: number
  user: { name?: string | null; email?: string | null }
}

type Quote = {
  available: boolean
  nights?: number
  subtotal?: number
  taxes?: number
  total?: number
  error?: string
}

export function BookingForm({ roomId, roomName, maxGuests, user }: Props) {
  const router = useRouter()
  const draft = useBookingDraft()
  const [checkIn, setCheckIn] = useState(draft.checkIn?.split('T')[0] ?? '')
  const [checkOut, setCheckOut] = useState(draft.checkOut?.split('T')[0] ?? '')
  const [adults, setAdults] = useState(draft.adults || 1)
  const [children, setChildren] = useState(draft.children || 0)
  const [guestName, setGuestName] = useState(user.name ?? '')
  const [guestEmail, setGuestEmail] = useState(user.email ?? '')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null)
      return
    }
    fetch('/api/bookings/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        adults,
        children,
      }),
    })
      .then((r) => r.json())
      .then(setQuote)
      .catch(() => setQuote(null))
  }, [checkIn, checkOut, roomId, adults, children])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!quote?.available) {
      toast.error('Please pick available dates first.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          checkIn: new Date(checkIn).toISOString(),
          checkOut: new Date(checkOut).toISOString(),
          adults,
          children,
          guestCount: adults + children,
          guestName,
          guestEmail,
          guestPhone: guestPhone || undefined,
          specialRequests: specialRequests || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create booking')
      draft.clear()
      toast.success('Booking created')
      router.push(`/booking/confirmation/${data.id}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-12 items-start">
      {/* Left Column: Form Details */}
      <div className="lg:col-span-8 space-y-12">

        {/* Section 1: Dates & Guests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-obsidian/5 p-6 md:p-10 shadow-sm space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">01</div>
            <h2 className="font-serif text-3xl text-obsidian tracking-tight">Stay Details</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-4">
            <Field label="Check-in">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Check-out">
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Adults">
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                className={inputCls}
              >
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
              </select>
            </Field>
            <Field label="Children">
              <select
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                className={inputCls}
              >
                {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>)}
              </select>
            </Field>
          </div>
        </motion.section>

        {/* Section 2: Guest Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border border-obsidian/5 p-6 md:p-10 shadow-sm space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">02</div>
            <h2 className="font-serif text-3xl text-obsidian tracking-tight">Guest Information</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Full Name">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="Enter your full name"
                className={inputCls}
              />
            </Field>
            <Field label="Email Address">
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputCls}
              />
            </Field>
            <Field label="Phone Number">
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 00000 00000"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Anything else we should know?">
            <textarea
              rows={4}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Allergies, arrival time, or special occasions..."
              className={cn(inputCls, "resize-none")}
            />
          </Field>
        </motion.section>
      </div>

      {/* Right Column: Sticky Summary */}
      <aside className="lg:col-span-4 lg:sticky lg:top-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-obsidian text-accent rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 border border-white/5"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Booking Summary</p>
            <h3 className="font-serif text-4xl tracking-tight leading-tight text-accent">{roomName}</h3>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            {quote?.available ? (
              <>
                <Row label={`${quote.nights} night${quote.nights === 1 ? '' : 's'}`} value={formatINR(quote.subtotal!)} />
                <Row label="Taxes & Fees" value={formatINR(quote.taxes!)} />
                <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Total Amount</span>
                  <span className="text-3xl font-serif text-accent">{formatINR(quote.total!)}</span>
                </div>
              </>
            ) : quote?.error ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-accent font-black uppercase tracking-widest text-center">
                  {quote.error === 'ROOM_UNAVAILABLE'
                    ? 'Dates already booked'
                    : 'Dates unavailable'}
                </p>
              </div>
            ) : (
              <p className="text-accent italic text-sm text-center py-4">Select dates to see price.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!quote?.available || submitting}
            className="w-full rounded-2xl bg-white py-5 text-[11px] border font-black uppercase tracking-[0.3em] text-obsidian transition-all duration-500 hover:bg-accent hover:text-white active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-white/5"
          >
            {submitting ? 'Reserving…' : 'Confirm & Reserve'}
          </button>

          <div className="flex items-center gap-3 justify-center text-[9px] font-bold uppercase tracking-widest text-accent">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Next Step: Payment Details</span>
          </div>
        </motion.div>
      </aside>
    </form>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-3", className)}>
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-obsidian/40">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-accent font-bold uppercase tracking-widest text-[10px]">{label}</span>
      <span className="font-serif text-xl text-accent">{value}</span>
    </div>
  )
}

const inputCls =
  'w-full rounded-2xl border border-obsidian/5 bg-[#FDFCFB] px-5 py-4 text-sm font-bold text-obsidian placeholder:text-obsidian/20 focus:outline-none focus:border-accent transition-all duration-300'
