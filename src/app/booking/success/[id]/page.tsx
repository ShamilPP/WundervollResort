import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Home, Calendar, ArrowRight } from 'lucide-react'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { formatINR } from '@/lib/money'

export default async function BookingSuccessPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const booking = await prisma.booking
    .findUnique({
      where: { id: params.id },
      include: { room: true },
    })

  if (!booking) notFound()
  if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
    notFound()
  }

  // If not confirmed yet (webhook might be slow), we still show success if they just came from payment
  // but usually verify API confirms it before redirecting.

  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 relative">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />

        <div className="container max-w-2xl relative z-10">
          <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-obsidian/5 p-6 sm:p-10 md:p-16 shadow-2xl shadow-obsidian/5 text-center space-y-10">

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-ping" />
                <div className="relative h-24 w-24 bg-accent rounded-full flex items-center justify-center text-white shadow-xl shadow-accent/40">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Payment Successful</p>
              <h1 className="font-serif text-5xl md:text-7xl text-obsidian tracking-tighter leading-none">
                Your Stay is <span className="text-accent italic font-light">Confirmed</span>
              </h1>
              <p className="text-sm font-light text-obsidian/40 italic max-w-sm mx-auto">
                Welcome to Wundervoll Resort. Your sanctuary in {booking.room.name} awaits your arrival.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-8 border-y border-obsidian/5">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-obsidian/20">Confirmation Code</p>
                <p className="text-sm font-bold text-obsidian">{booking.code}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-obsidian/20">Total Investment</p>
                <p className="text-sm font-bold text-accent">{formatINR(booking.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-center gap-6 text-xs text-obsidian/60">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-20" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-2xl bg-accent px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-accent transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                >
                  <Home className="h-4 w-4" /> Go to Dashboard
                </Link>
                <Link
                  href={`/booking/confirmation/${booking.id}`}
                  className="flex-1 rounded-2xl border border-obsidian/10 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-obsidian hover:bg-obsidian/5 transition-all active:scale-95"
                >
                  View Details
                </Link>
              </div>
            </div>

            <p className="text-[10px] font-bold text-obsidian/20 uppercase tracking-[0.2em]">
              A confirmation receipt has been sent to your email.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
