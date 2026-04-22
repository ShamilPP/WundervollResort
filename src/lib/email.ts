type BookingEmailPayload = {
  to: string
  guestName: string
  bookingCode: string
  roomName: string
  checkIn: Date | string
  checkOut: Date | string
  total: number
}

export async function sendBookingConfirmation(payload: BookingEmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email:stub] Booking confirmation →', payload.to, payload.bookingCode)
    return { ok: true, stub: true }
  }
  // Swap this with the real Resend call when keys are present.
  console.log('[email] would send booking confirmation', payload)
  return { ok: true, stub: false }
}
