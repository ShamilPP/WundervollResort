import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, CreditCard, Calendar, User, MapPin } from 'lucide-react'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { formatINR } from '@/lib/money'
import { PaymentPanel } from '@/components/booking/payment-panel'
import * as motion from 'framer-motion/m'

export default async function ConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const booking = await prisma.booking
    .findUnique({
      where: { id: params.id },
      include: { room: true, payment: true },
    })
    .catch(() => null)

  if (!booking) notFound()
  if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
    notFound()
  }

  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-4xl">

          {/* Header Section */}
          <div className="mb-16 space-y-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                {isConfirmed ? 'Reservation Confirmed' : 'Payment Required'}
              </span>
              <div className="h-px w-12 bg-accent" />
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl text-obsidian tracking-tighter leading-none">
              {isConfirmed ? (
                <>Your Journey <span className="text-accent italic font-light">Begins</span></>
              ) : (
                <>Secure Your <span className="text-accent italic font-light">Sanctuary</span></>
              )}
            </h1>

            <p className="text-lg font-light text-obsidian/40 italic">
              {isConfirmed
                ? `A confirmation email has been sent to ${booking.guestEmail}.`
                : "Complete your payment to finalize your stay at Wundervoll Resort."}
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Booking Details Card */}
            <div className="lg:col-span-6 space-y-10">
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-obsidian/5 p-4 sm:p-6 md:p-10 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-obsidian/20">Booking Code</p>
                    <p className="text-sm font-bold text-obsidian">{booking.code}</p>
                  </div>
                  <div className={isConfirmed ? "text-accent" : "text-obsidian/20"}>
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="font-serif text-4xl text-obsidian">{booking.room.name}</h2>

                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-obsidian/5">
                    <Detail icon={Calendar} label="Dates" value={`${new Date(booking.checkIn).toLocaleDateString()} — ${new Date(booking.checkOut).toLocaleDateString()}`} />
                    <Detail icon={User} label="Guests" value={`${booking.guestCount} Guest${booking.guestCount === 1 ? '' : 's'}`} />
                  </div>
                </div>

                <div className="pt-8 border-t border-obsidian/5 space-y-4">
                  <Row label="Stay Subtotal" value={formatINR(booking.subtotal)} />
                  <Row label="Taxes & Fees" value={formatINR(booking.taxes)} />
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-obsidian/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-obsidian/40">Total Amount</span>
                    <span className="text-3xl font-serif text-accent">{formatINR(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {isConfirmed && (
                <div className="flex gap-4">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex-1 rounded-2xl border border-obsidian/10 px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-obsidian hover:bg-obsidian hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                  <Link
                    href="/rooms"
                    className="flex-1 rounded-2xl bg-accent px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-white hover:bg-accent transition-all"
                  >
                    Browse More
                  </Link>
                </div>
              )}
            </div>

            {/* Payment / Status Side Column */}
            <div className="lg:col-span-6">
              {!isConfirmed ? (
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-obsidian/5 p-4 sm:p-6 md:p-10 shadow-xl space-y-8">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-obsidian">Payment Gateway</h3>
                  </div>
                  <PaymentPanel
                    bookingId={booking.id}
                    amount={booking.totalAmount}
                    guestName={booking.guestName}
                    guestEmail={booking.guestEmail}
                    guestPhone={booking.guestPhone}
                  />
                  <p className="text-[10px] font-bold text-obsidian/30 uppercase tracking-widest text-center">
                    Secure 256-bit SSL encrypted payment
                  </p>
                </div>
              ) : (
                <div className="bg-obsidian text-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-8 text-center border border-white/5">
                  <MapPin className="h-10 w-10 text-accent mx-auto" />
                  <div className="space-y-4 text-accent">
                    <h3 className="font-serif text-3xl">Find Us</h3>
                    <p className="text-sm font-light italic leading-relaxed">
                      Wundervoll Resort, Coast Road,<br />
                      Konkan Coast, India.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">Arrival Policy</p>
                    <p className="text-xs font-light">Check-in: 2:00 PM · Check-out: 11:00 AM</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-obsidian/30">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-obsidian">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-obsidian/40 font-bold uppercase tracking-widest text-[9px]">{label}</span>
      <span className="font-serif text-lg text-obsidian">{value}</span>
    </div>
  )
}
