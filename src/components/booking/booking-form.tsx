'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
  const [guestCount, setGuestCount] = useState(draft.guestCount || 1)
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
      }),
    })
      .then((r) => r.json())
      .then(setQuote)
      .catch(() => setQuote(null))
  }, [checkIn, checkOut, roomId])

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
          guestCount,
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
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-xl">Dates & guests</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            <Field label="Guests">
              <input
                type="number"
                min={1}
                max={maxGuests}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                required
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-xl">Guest details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Special requests (optional)" className="mt-4">
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Summary
          </p>
          <p className="mt-1 font-serif text-xl">{roomName}</p>

          <div className="mt-6 space-y-2 border-t pt-4 text-sm">
            {quote?.available ? (
              <>
                <Row label={`${quote.nights} night${quote.nights === 1 ? '' : 's'}`} value={formatINR(quote.subtotal!)} muted />
                <Row label="Taxes" value={formatINR(quote.taxes!)} muted />
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatINR(quote.total!)}</span>
                </div>
              </>
            ) : quote?.error ? (
              <p className="text-destructive">
                {quote.error === 'ROOM_UNAVAILABLE'
                  ? 'Those dates are already booked.'
                  : 'Those dates are unavailable.'}
              </p>
            ) : (
              <p className="text-muted-foreground">Pick dates to see pricing.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!quote?.available || submitting}
            className="mt-6 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating booking…' : 'Create booking'}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            You&apos;ll review and pay on the next step.
          </p>
        </div>
      </aside>
    </form>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-muted-foreground' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
