# 📝 Booking & Payment Flow

End-to-end flow from browsing to booking confirmation.

---

## 🎬 High-Level Flow

```
1. Browse rooms
      ↓
2. Pick a room → check calendar
      ↓
3. Select dates + guest count → see live price
      ↓
4. Click "Book now"
      ↓
5. Login / sign up (if not authed)
      ↓
6. Fill guest info form
      ↓
7. Review summary
      ↓
8. Pay (Stripe) OR Demo Approve
      ↓
9. Webhook confirms → booking status = CONFIRMED
      ↓
10. Confirmation page + email sent
```

---

## 🧩 State Management (Zustand)

Keep the booking "draft" in a store so state persists through login.

```ts
// src/store/bookingDraftStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BookingDraft {
  roomId?: string
  checkIn?: Date
  checkOut?: Date
  guestCount: number
  specialRequests?: string
  setDraft: (draft: Partial<BookingDraft>) => void
  clear: () => void
}

export const useBookingDraft = create<BookingDraft>()(
  persist(
    (set) => ({
      guestCount: 1,
      setDraft: (draft) => set((s) => ({ ...s, ...draft })),
      clear: () => set({ roomId: undefined, checkIn: undefined, checkOut: undefined, guestCount: 1 }),
    }),
    { name: 'wdv-booking-draft' }
  )
)
```

---

## 📋 Step-by-Step Implementation

### Step 1 — Room page selects dates

`app/(public)/rooms/[slug]/page.tsx`:

```tsx
'use client'
// ...
const [range, setRange] = useState<DateRange>()
const draft = useBookingDraft()
const router = useRouter()

function handleBook() {
  if (!range?.from || !range?.to) return
  draft.setDraft({
    roomId: room.id,
    checkIn: range.from,
    checkOut: range.to,
  })
  router.push(`/booking/${room.id}`)
}
```

### Step 2 — Booking page

`app/booking/[roomId]/page.tsx`:

Multi-step form (can use tabs or stepper):

1. **Dates** (pre-filled from draft, editable)
2. **Guest info** (name, email, phone, special requests)
3. **Review** (breakdown of price)
4. **Payment**

### Step 3 — Create booking (PENDING)

Before showing payment, create the booking as `PENDING`:

```ts
// src/lib/fetchers/bookings.ts
export async function createBooking(data) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed')
  return res.json()
}
```

Server:
```ts
// app/api/bookings/route.ts
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()

  const body = createBookingSchema.parse(await req.json())
  const pricing = await calculateBookingPrice(body.roomId, body.checkIn, body.checkOut)

  // MongoDB transaction (Atlas / replica set) — race-safe
  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Re-check availability inside the transaction
      const conflicts = await tx.booking.count({
        where: {
          roomId: body.roomId,
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
          AND: [
            { checkIn: { lt: body.checkOut } },
            { checkOut: { gt: body.checkIn } },
          ],
        },
      })
      if (conflicts > 0) throw new Error('ROOM_UNAVAILABLE')

      return tx.booking.create({
        data: {
          ...body,
          userId: session.user.id,
          code: await generateBookingCode(),
          nights: pricing.nights,
          subtotal: pricing.subtotal,
          taxes: pricing.taxes,
          totalAmount: pricing.totalAmount,
          status: 'PENDING',
        },
      })
    })

    return Response.json({ data: booking })
  } catch (e: any) {
    if (e.message === 'ROOM_UNAVAILABLE') return error('ROOM_UNAVAILABLE', 409)
    throw e
  }
}
```

### Step 4 — Create Stripe Payment Intent

```ts
// app/api/payments/create-intent/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { bookingId } = await req.json()
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return error('NOT_FOUND', 404)

  const intent = await stripe.paymentIntents.create({
    amount: booking.totalAmount,  // already in paise — no conversion needed
    currency: 'inr',
    metadata: { bookingId: booking.id, code: booking.code },
    automatic_payment_methods: { enabled: true },
  })

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { stripePaymentIntentId: intent.id },
    create: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency: 'INR',
      stripePaymentIntentId: intent.id,
      method: 'STRIPE',
    },
  })

  return Response.json({ clientSecret: intent.client_secret })
}
```

### Step 5 — Client-side Stripe Checkout

```tsx
// components/booking/PaymentButton.tsx
'use client'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

export function PaymentButton({ bookingId }) {
  const [clientSecret, setClientSecret] = useState<string>()

  useEffect(() => {
    fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }).then(r => r.json()).then(d => setClientSecret(d.clientSecret))
  }, [bookingId])

  if (!clientSecret) return <Skeleton />

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm bookingId={bookingId} />
    </Elements>
  )
}

function CheckoutForm({ bookingId }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation/${bookingId}`,
      },
    })

    if (error) toast.error(error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  )
}
```

### Step 6 — Stripe Webhook Confirms Booking

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { sendBookingConfirmation } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const bookingId = intent.metadata.bookingId

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { user: true, room: true },
    })

    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'SUCCEEDED', stripeChargeId: intent.latest_charge as string },
    })

    await sendBookingConfirmation(booking)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    const bookingId = intent.metadata.bookingId
    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'FAILED' },
    })
  }

  return Response.json({ received: true })
}
```

Local dev webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🎭 Demo Payment Mode (Fallback)

If Stripe keys aren't set, use a fake approve button.

```tsx
// components/booking/DemoPaymentButton.tsx
'use client'
export function DemoPaymentButton({ bookingId }) {
  const [state, setState] = useState<'idle' | 'processing' | 'done'>('idle')
  const router = useRouter()

  async function handleApprove() {
    setState('processing')
    await new Promise(r => setTimeout(r, 2000)) // realistic delay
    await fetch('/api/payments/demo-approve', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    })
    setState('done')
    await new Promise(r => setTimeout(r, 800))
    router.push(`/booking/confirmation/${bookingId}`)
  }

  return (
    <Button onClick={handleApprove} disabled={state !== 'idle'} className="w-full h-14">
      {state === 'idle' && 'Approve Demo Payment'}
      {state === 'processing' && <Spinner /> && 'Processing...'}
      {state === 'done' && <Check /> && 'Approved ✓'}
    </Button>
  )
}
```

Server:
```ts
// app/api/payments/demo-approve/route.ts
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()
  const { bookingId } = await req.json()

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking || booking.userId !== session.user.id) return forbidden()

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    }),
    prisma.payment.upsert({
      where: { bookingId },
      update: { status: 'SUCCEEDED', method: 'DEMO' },
      create: {
        bookingId,
        amount: booking.totalAmount,
        status: 'SUCCEEDED',
        method: 'DEMO',
      },
    }),
  ])

  const full = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, room: true },
  })
  await sendBookingConfirmation(full)

  return Response.json({ success: true })
}
```

Toggle via `.env`:
```env
NEXT_PUBLIC_PAYMENT_MODE=demo   # or 'stripe'
```

---

## ✉️ Email Confirmation

```tsx
// emails/BookingConfirmation.tsx
import { Html, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

export default function BookingConfirmation({ booking, room, user }) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FBF7F1' }}>
        <Container>
          <Heading>Your stay is confirmed, {user.name}</Heading>
          <Text>Booking code: <strong>{booking.code}</strong></Text>
          <Text>{room.name}</Text>
          <Text>Check-in: {booking.checkIn.toDateString()}</Text>
          <Text>Check-out: {booking.checkOut.toDateString()}</Text>
          <Text>Total paid: ₹{(booking.totalAmount / 100).toLocaleString('en-IN')}</Text>
          <Hr />
          <Button href={`https://wundervoll.com/dashboard/bookings/${booking.id}`}>
            View booking
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

Send it:
```ts
// src/lib/email.ts
import { Resend } from 'resend'
import BookingConfirmation from '../../emails/BookingConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(booking) {
  await resend.emails.send({
    from: 'Wundervoll Resort <bookings@wundervoll.com>',
    to: booking.user.email,
    subject: `Booking confirmed — ${booking.code}`,
    react: BookingConfirmation({ booking, room: booking.room, user: booking.user }),
  })
}
```

---

## 🧪 Stripe Test Cards

| Card | Outcome |
|------|---------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined — insufficient funds |
| `4000 0000 0000 0002` | Declined — generic |

Use any future expiry + any 3-digit CVC.

---

## ❌ Cancellation Flow

```ts
// app/api/bookings/[id]/cancel/route.ts
export async function POST(req: Request, { params }) {
  const session = await auth()
  const booking = await prisma.booking.findUnique({ where: { id: params.id } })

  if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return forbidden()
  }

  // Policy: free cancellation > 7 days before; 50% refund 3–7 days; no refund <3
  const daysUntil = differenceInDays(booking.checkIn, new Date())
  let refundPercent = 0
  if (daysUntil >= 7) refundPercent = 100
  else if (daysUntil >= 3) refundPercent = 50

  // Refund via Stripe if applicable
  if (refundPercent > 0 && booking.payment?.method === 'STRIPE') {
    await stripe.refunds.create({
      charge: booking.payment.stripeChargeId,
      amount: Math.round(booking.totalAmount * refundPercent / 100),  // already paise
    })
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status: refundPercent > 0 ? 'REFUNDED' : 'CANCELLED' },
  })

  return Response.json({ success: true, refundPercent })
}
```

---

## 🛡️ Security Notes

- Always verify the user owns the booking before any mutation
- Verify Stripe webhook signatures
- Use DB transactions to prevent double-booking
- Validate all inputs with zod
- Rate-limit booking creation (5/min per user)
- Never trust client-calculated totals — recalculate on server
- Use HTTPS only in production (Vercel enforces)
