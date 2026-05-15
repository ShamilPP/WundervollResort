'use client'

import { useEffect, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'
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
  const [range, setRange] = useState<DateRange | undefined>()
  const [disabled, setDisabled] = useState<Date[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const setRoom = useBookingDraft((s) => s.setRoom)
  const setDates = useBookingDraft((s) => s.setDates)

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
      }),
    })
      .then((r) => r.json())
      .then((q) => setQuote(q))
      .finally(() => setLoading(false))
  }, [range, roomId])

  function proceed() {
    if (!range?.from || !range?.to) return
    setRoom(roomId)
    setDates(range.from.toISOString(), range.to.toISOString())
    router.push(`/booking/${roomId}`)
  }

  return (
    <div>
      <div className='flex items-center justify-center'>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={[{ before: new Date() }, ...disabled]}
          numberOfMonths={1}
          className="!font-sans"
        />
      </div>

      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
        {!range?.from ? (
          <p className="text-muted-foreground">
            Pick check-in and check-out dates to see pricing.
          </p>
        ) : !range?.to || range.from.getTime() === range.to.getTime() ? (
          <p className="text-brand-obsidian font-bold">
            Now select your departure date.
          </p>
        ) : loading ? (
          <p className="text-muted-foreground">Calculating…</p>
        ) : quote?.available ? (
          <>
            <div className="flex justify-between text-muted-foreground">
              <span>{quote.nights} night{quote.nights === 1 ? '' : 's'}</span>
              <span>{formatINR(quote.subtotal!)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes</span>
              <span>{formatINR(quote.taxes!)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-medium">
              <span>Total</span>
              <span>{formatINR(quote.total!)}</span>
            </div>
            <button
              onClick={proceed}
              className="mt-3 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Reserve now
            </button>
          </>
        ) : (
          <p className="text-destructive">
            {quote?.error === 'ROOM_UNAVAILABLE'
              ? 'Those dates are already booked.'
              : 'Those dates are unavailable.'}
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        From {formatINR(basePrice)} per night · Room {slug}
      </p>
    </div>
  )
}
