import { NextResponse } from 'next/server'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured. Use /api/payments/demo-confirm in the meantime.',
      },
      { status: 503 },
    )
  }
  // Real Stripe integration goes here.
  return NextResponse.json({ error: 'not implemented' }, { status: 501 })
}
