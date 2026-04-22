import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 503 },
    )
  }
  // Validate signature, handle payment_intent.succeeded, mark booking CONFIRMED.
  const _body = await req.text()
  return NextResponse.json({ received: true })
}
