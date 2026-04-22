'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function PaymentPanel({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function pay() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/demo-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Payment failed')
      toast.success('Payment successful')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-dashed bg-secondary/50 p-4 text-sm">
        <p className="font-medium">Demo payment mode</p>
        <p className="mt-1 text-muted-foreground">
          Stripe keys aren&apos;t configured yet. Click below to simulate a
          successful payment and confirm this booking.
        </p>
      </div>
      <button
        onClick={pay}
        disabled={loading}
        className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Confirm & pay (Demo)'}
      </button>
    </div>
  )
}
