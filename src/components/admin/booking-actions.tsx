'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { BookingStatus } from '@prisma/client'

export function BookingActions({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: BookingStatus
}) {
  const router = useRouter()
  const [working, setWorking] = useState(false)

  async function setStatus(status: BookingStatus) {
    setWorking(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      toast.success(`Status → ${status}`)
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setWorking(false)
    }
  }

  async function refund() {
    if (!confirm('Mark this booking as REFUNDED? (Stripe refund is stubbed until keys are added.)')) return
    setStatus(BookingStatus.REFUNDED)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button disabled={working} onClick={() => setStatus(BookingStatus.CONFIRMED)} className={btn}>
        Mark Confirmed
      </button>
      <button disabled={working} onClick={() => setStatus(BookingStatus.CHECKED_IN)} className={btn}>
        Check In
      </button>
      <button disabled={working} onClick={() => setStatus(BookingStatus.CHECKED_OUT)} className={btn}>
        Check Out
      </button>
      <button disabled={working} onClick={() => setStatus(BookingStatus.CANCELLED)} className={`${btn} !border-destructive !text-destructive`}>
        Cancel
      </button>
      <button disabled={working} onClick={refund} className={`${btn} !border-destructive !text-destructive`}>
        Refund
      </button>
      <span className="ml-auto self-center text-xs text-muted-foreground">
        Current: {currentStatus}
      </span>
    </div>
  )
}

const btn =
  'rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50'
