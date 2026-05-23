'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, CreditCard, Loader2 } from 'lucide-react'
import { formatINR } from '@/lib/money'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentPanel({
  bookingId,
  amount,
  guestName,
  guestEmail,
  guestPhone
}: {
  bookingId: string
  amount: number
  guestName: string
  guestEmail: string
  guestPhone?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('advance')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function initiatePayment() {
    if (!scriptLoaded) {
      toast.error('Payment gateway is still loading. Please wait a moment.')
      return
    }

    setLoading(true)
    try {
      // 1. Create order on the server
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentType }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error ?? 'Failed to initiate payment')

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Wundervoll Resort',
        description: 'Secure Booking Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setLoading(true)
          try {
            // 3. Verify payment on the server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error ?? 'Verification failed')

            toast.success('Payment verified! Redirecting to your confirmation...')
            router.push(`/booking/success/${bookingId}`)
          } catch (err) {
            toast.error((err as Error).message)
            setLoading(false)
          }
        },
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone || '',
        },
        theme: {
          color: '#0F0F0F', // Obsidian
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  const advanceAmount = Math.round(amount * 0.30)
  const remainingAmount = amount - advanceAmount

  return (
    <div className="space-y-6">
      {/* Dynamic Payment Option Tab Selector */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-[0.3em] text-obsidian/40 font-black pl-1 block">
          Choose Your Reservation Guarantee Preference
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-obsidian/[0.03] p-1.5 border border-obsidian/5">
          <button
            type="button"
            onClick={() => setPaymentType('advance')}
            className={`flex flex-col items-center justify-center rounded-xl py-3 px-4 transition-all duration-300 ${paymentType === 'advance'
                ? 'bg-white text-obsidian shadow-sm border border-obsidian/5 font-bold'
                : 'text-obsidian/40 hover:text-obsidian/70'
              }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">30% Secure Deposit</span>
            <span className="text-xs font-serif font-bold mt-1 text-accent animate-in fade-in">
              {formatINR(advanceAmount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentType('full')}
            className={`flex flex-col items-center justify-center rounded-xl py-3 px-4 transition-all duration-300 ${paymentType === 'full'
                ? 'bg-white text-obsidian shadow-sm border border-obsidian/5 font-bold'
                : 'text-obsidian/40 hover:text-obsidian/70'
              }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">Sanctuary Guarantee (100%)</span>
            <span className="text-xs font-serif font-bold mt-1 text-obsidian animate-in fade-in">
              {formatINR(amount)}
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic breakdown message */}
      <div className="rounded-2xl border border-obsidian/5 bg-[#FDFCFB] p-5 space-y-3 animate-in fade-in duration-300">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-obsidian/50 uppercase tracking-wider text-[10px]">
            {paymentType === 'advance' ? 'Pay Advance Now' : 'Total Amount Now'}
          </span>
          <span className="font-serif font-bold text-lg text-accent">
            {formatINR(paymentType === 'advance' ? advanceAmount : amount)}
          </span>
        </div>

        {paymentType === 'advance' && (
          <div className="flex justify-between items-center text-xs border-t border-obsidian/5 pt-3 animate-in fade-in">
            <span className="font-bold text-obsidian/50 uppercase tracking-wider text-[10px]">Balance on Arrival</span>
            <span className="font-bold text-obsidian">
              {formatINR(remainingAmount)}
            </span>
          </div>
        )}
      </div>

      <div className="bg-accent/5 rounded-[2rem] border border-accent/10 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent">Protected Gateway</p>
            <h4 className="font-serif text-xl text-obsidian">Sanctuary Secure Routing</h4>
          </div>
        </div>

        <p className="text-xs text-obsidian/40 italic leading-relaxed">
          Your reservation investment is routed through a fully encrypted security environment. Your financial safety and peace of mind are our ultimate guarantee.
        </p>

        <div className="flex items-center gap-2 pt-2 border-t border-accent/10">
          <div className="h-1 w-1 rounded-full bg-accent" />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent/60">100% Encrypted & Authenticated Transaction</p>
        </div>
      </div>

      <button
        onClick={initiatePayment}
        disabled={loading || !scriptLoaded}
        className="group relative flex items-center justify-center gap-3 w-full rounded-2xl bg-accent py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all duration-500 hover:bg-accent active:scale-95 shadow-xl shadow-obsidian/10 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Securing Connection…</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            <span>Book your stay</span>
          </>
        )}
      </button>

      {!scriptLoaded && (
        <p className="text-center text-[9px] font-bold uppercase tracking-widest text-obsidian/20 animate-pulse">
          Establishing Secure Channel…
        </p>
      )}
    </div>
  )
}
