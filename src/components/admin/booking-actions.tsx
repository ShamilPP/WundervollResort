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
    
    const promise = fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      return data
    })

    toast.promise(promise, {
      loading: `Updating reservation status to ${status.replace('_', ' ')}...`,
      success: () => {
        router.refresh()
        return `Reservation marked as ${status.replace('_', ' ')}`
      },
      error: (err) => (err as Error).message,
    })

    try {
      await promise
    } catch (err) {
      // Handled by toast.promise
    } finally {
      setWorking(false)
    }
  }

  async function refund() {
    if (!confirm('Mark this booking as REFUNDED? (Stripe refund is stubbed until keys are added.)')) return
    setStatus(BookingStatus.REFUNDED)
  }

  async function deleteBooking() {
    if (!confirm('Are you absolutely sure you want to delete this booking permanently? This action cannot be undone.')) return
    setWorking(true)

    const promise = fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      return data
    })

    toast.promise(promise, {
      loading: 'Deleting reservation permanently...',
      success: () => {
        router.push('/admin/bookings')
        router.refresh()
        return 'Reservation deleted successfully'
      },
      error: (err) => (err as Error).message,
    })

    try {
      await promise
    } catch (err) {
      // Handled by toast.promise
    } finally {
      setWorking(false)
    }
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
      <button disabled={working} onClick={deleteBooking} className={`${btn} !bg-red-600 !border-red-600 !text-white hover:!bg-red-700`}>
        Delete Booking
      </button>
      <span className="ml-auto self-center text-xs text-muted-foreground">
        Current: {currentStatus}
      </span>
    </div>
  )
}

const btn =
  'rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50'
