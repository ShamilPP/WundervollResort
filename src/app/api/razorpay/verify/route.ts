import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getRazorpay } from '@/lib/razorpay'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json()

    console.log(`[razorpay:verify] Request received for bookingId: "${bookingId}"`)
    console.log(`[razorpay:verify] Received signature parameters: order_id="${razorpay_order_id}", payment_id="${razorpay_payment_id}"`)
    
    // Verify the signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    console.log(`[razorpay:verify] expectedSignature="${expectedSignature}"`)
    console.log(`[razorpay:verify] razorpay_signature="${razorpay_signature}"`)

    const isSignatureValid = expectedSignature === razorpay_signature
    console.log(`[razorpay:verify] isSignatureValid=${isSignatureValid}`)

    if (!isSignatureValid) {
      console.warn(`[razorpay:verify] Signature mismatch! expected="${expectedSignature}" received="${razorpay_signature}"`)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Fetch booking to verify existence
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      console.warn(`[razorpay:verify] Booking "${bookingId}" not found in database!`)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Fetch secure order paid amount from Razorpay
    console.log(`[razorpay:verify] Fetching order details from Razorpay API...`)
    const order = await getRazorpay().orders.fetch(razorpay_order_id)
    const paidAmount = typeof order.amount === 'string' ? parseInt(order.amount, 10) : Number(order.amount)
    console.log(`[razorpay:verify] Razorpay order fetched. paidAmount=${paidAmount} paise`)

    // Update booking and create payment record in a transaction
    console.log(`[razorpay:verify] Starting DB transaction to confirm booking and write payment record...`)
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: paidAmount,
          status: 'SUCCEEDED',
          method: 'RAZORPAY',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        update: {
          amount: paidAmount,
          status: 'SUCCEEDED',
          method: 'RAZORPAY',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
    ])
    console.log(`[razorpay:verify] DB transaction committed successfully.`)

    // Query room detail & guest information to compile pristine bill receipt
    const detailedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    })

    if (detailedBooking) {
      console.log(`[razorpay:verify] Triggering sendBookingConfirmation to guest email: "${detailedBooking.guestEmail}"`)
      await sendBookingConfirmation({
        to: detailedBooking.guestEmail,
        guestName: detailedBooking.guestName,
        bookingCode: detailedBooking.code,
        roomName: detailedBooking.room.name,
        checkIn: detailedBooking.checkIn,
        checkOut: detailedBooking.checkOut,
        total: detailedBooking.totalAmount,
        paidAmount: paidAmount,
        nights: detailedBooking.nights,
      }).then(() => {
        console.log(`[razorpay:verify] sendBookingConfirmation complete.`)
      }).catch((e) => {
        console.error('[razorpay:verify] sendBookingConfirmation failed with error:', e)
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[RAZORPAY_VERIFY_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
