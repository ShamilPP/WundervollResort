import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getRazorpay } from '@/lib/razorpay'
import { getAdvancePercentage } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, paymentType } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { totalAmount: true, userId: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate secure amount (full vs dynamic advance deposit)
    let finalAmount = booking.totalAmount
    if (paymentType === 'advance') {
      const advancePercent = await getAdvancePercentage()
      finalAmount = Math.round(booking.totalAmount * (advancePercent / 100))
    }

    // Razorpay works in Paisa (1 INR = 100 Paisa)
    const options = {
      amount: finalAmount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    }

    const order = await getRazorpay().orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    console.error('[RAZORPAY_ORDER_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
