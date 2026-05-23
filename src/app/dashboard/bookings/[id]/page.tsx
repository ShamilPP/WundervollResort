import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, CreditCard, ChevronLeft, Hotel, MapPin, ReceiptText } from 'lucide-react'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { formatINR } from '@/lib/money'

export default async function BookingDetailPage({
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

  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-4xl">

          {/* Editorial Navigation */}
          <div className="mb-12">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-obsidian/40 hover:text-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Portal
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                Your Itinerary
              </span>
            </div>
            <h1 className="font-serif text-6xl md:text-8xl text-obsidian tracking-tighter leading-none">
              Stay <span className="text-accent italic font-light">Details</span>
            </h1>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 items-start">

            {/* Primary Detail Manifesto */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white rounded-[2.5rem] border border-obsidian/5 p-10 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-obsidian/20">Booking Reference</p>
                    <p className="text-sm font-bold text-obsidian">{booking.code}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="space-y-6">
                  <h2 className="font-serif text-5xl text-obsidian tracking-tight">{booking.room.name}</h2>

                  <div className="grid grid-cols-2 gap-10 pt-6 border-t border-obsidian/5">
                    <Detail icon={Calendar} label="Check-In" value={new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                    <Detail icon={Calendar} label="Check-Out" value={new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                  </div>
                </div>

                <div className="pt-10 border-t border-obsidian/5 grid grid-cols-2 gap-10">
                  <Detail icon={User} label="Guest" value={booking.guestName} />
                  <Detail icon={ReceiptText} label="Stay Duration" value={`${booking.nights} Night${booking.nights === 1 ? '' : 's'}`} />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex gap-4">
                <Link
                  href="/rooms"
                  className="flex-1 rounded-2xl bg-obsidian px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-white hover:bg-accent transition-all"
                >
                  Explore More Rooms
                </Link>
                <Link
                  href={`/rooms/${booking.room.slug}`}
                  className="flex-1 rounded-2xl border border-obsidian/10 px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-obsidian hover:bg-obsidian transition-all"
                >
                  View Room Gallery
                </Link>
              </div>
            </div>

            {/* Financial & Status Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-obsidian rounded-[2.5rem] p-10 shadow-2xl space-y-8 border border-white/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Investment Breakdown</p>
                  <h3 className="font-serif text-3xl text-accent">Pricing</h3>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <Row label="Stay Subtotal" value={formatINR(booking.subtotal)} />
                  <Row label="Taxes & Fees" value={formatINR(booking.taxes)} />
                  {booking.payment && booking.payment.amount < booking.totalAmount && (
                    <>
                      <Row label="Advance Paid" value={formatINR(booking.payment.amount)} />
                      <Row label="Balance at Check-in" value={formatINR(booking.totalAmount - booking.payment.amount)} />
                    </>
                  )}
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Total Amount</span>
                    <span className="text-3xl font-serif text-accent">{formatINR(booking.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    {booking.payment 
                      ? booking.payment.amount < booking.totalAmount 
                        ? `30% Advance Secured` 
                        : `Fully Paid via ${booking.payment.method}` 
                      : 'Payment Pending'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-obsidian/5 p-10 shadow-sm space-y-6 text-center">
                <MapPin className="h-8 w-8 text-accent mx-auto" />
                <div className="space-y-2">
                  <h4 className="font-serif text-xl text-obsidian">Resort Location</h4>
                  <p className="text-xs text-obsidian/40 italic leading-relaxed">
                    Wundervoll Resort, Coast Road,<br />
                    Konkan Coast, India.
                  </p>
                </div>
              </div>
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
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-obsidian leading-tight">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-accent font-bold uppercase tracking-widest text-[9px]">{label}</span>
      <span className="font-serif text-lg text-accent">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'CONFIRMED' || status === 'CHECKED_IN'

  return (
    <span className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${isConfirmed ? 'bg-accent/10 text-accent border-accent/20' : 'bg-obsidian/5 text-obsidian/40 border-obsidian/10'
      }`}>
      {status.replace('_', ' ')}
    </span>
  )
}
