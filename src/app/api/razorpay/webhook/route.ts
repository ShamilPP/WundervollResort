import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    
    // Handle the payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      if (orderId) {
        // Find the booking by razorpayOrderId
        const booking = await prisma.booking.findFirst({
          where: { 
            payment: {
              razorpayOrderId: orderId
            }
          },
          include: { payment: true }
        })

        if (booking) {
          // Atomic update of booking and payment record
          await prisma.$transaction([
            prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'CONFIRMED' }
            }),
            prisma.payment.update({
              where: { bookingId: booking.id },
              data: {
                status: 'SUCCEEDED',
                razorpayPaymentId: payment.id,
                method: 'RAZORPAY',
                metadata: {
                  webhook_event: event.id,
                  captured_at: new Date().toISOString()
                }
              }
            })
          ])
          console.log(`[WEBHOOK_SUCCESS] Booking ${booking.code} confirmed via webhook.`)
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('[RAZORPAY_WEBHOOK_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
