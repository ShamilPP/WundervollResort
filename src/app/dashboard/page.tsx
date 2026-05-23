import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, Tag, ChevronRight, LogOut, ShieldCheck, Hotel } from 'lucide-react'

import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { formatINR } from '@/lib/money'
import * as motion from 'framer-motion/m'

async function logoutAction() {
  'use server'
  await signOut({ redirectTo: '/' })
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const bookings = await prisma.booking
    .findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { name: true, slug: true } }, payment: true },
    })
    .catch(() => [])

  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-5xl">

          {/* Editorial Header */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-obsidian/5 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                  Your Account
                </span>
              </div>
              <h1 className="font-serif text-6xl md:text-7xl text-obsidian tracking-tighter leading-none">
                Welcome back, <br />
                <span className="text-accent italic font-light">{session.user.name?.split(' ')[0] ?? session.user.email}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-2xl border border-obsidian/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-obsidian hover:bg-obsidian transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <form action={logoutAction}>
                <button className="flex items-center gap-2 rounded-2xl bg-accent border border-obsidian/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-accent transition-all">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Bookings Section */}
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-4xl text-obsidian tracking-tight">My Bookings</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-obsidian/20">{bookings.length} reservations found</p>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-obsidian/5 p-20 text-center space-y-8 shadow-sm">
                <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Hotel className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif text-3xl text-obsidian">No journeys planned yet</p>
                  <p className="text-sm text-obsidian/40 italic">Explore our selection of beachfront sanctuaries to begin your stay.</p>
                </div>
                <Link
                  href="/rooms"
                  className="inline-block rounded-2xl bg-obsidian px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-accent transition-all"
                >
                  Browse Our Rooms
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/bookings/${b.id}`}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between bg-white rounded-[2.5rem] border border-obsidian/5 p-8 transition-all hover:-translate-y-1"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                      <div className="h-16 w-16 rounded-3xl bg-[#FDFCFB] flex items-center justify-center border border-obsidian/5 text-accent shadow-sm">
                        <Hotel className="h-6 w-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={b.status} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian/20">{b.code}</span>
                        </div>
                        <h3 className="font-serif text-3xl text-obsidian group-hover:text-accent transition-colors">{b.room.name}</h3>
                        <div className="flex items-center gap-4 text-xs font-medium text-obsidian/40 italic">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()}</span>
                          </div>
                          <span>·</span>
                          <span>{b.nights} Night{b.nights === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-10">
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-obsidian/20">Total: {formatINR(b.totalAmount)}</p>
                        {b.payment ? (
                          b.payment.amount < b.totalAmount ? (
                            <div className="text-[11px] leading-tight mt-1 font-bold">
                              <p className="text-[#10B981]">Paid: {formatINR(b.payment.amount)}</p>
                              <p className="text-accent">Balance: {formatINR(b.totalAmount - b.payment.amount)}</p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#10B981] font-bold mt-1">Fully Paid</p>
                          )
                        ) : (
                          <p className="text-[11px] text-obsidian/40 font-bold italic mt-1">Payment Pending</p>
                        )}
                      </div>
                      <div className="h-12 w-12 rounded-full border border-obsidian/5 flex items-center justify-center group-hover:bg-obsidian group-hover:text-white transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'CONFIRMED' || status === 'CHECKED_IN'
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED'

  return (
    <span className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${isConfirmed ? 'bg-accent/10 text-accent border-accent/20' :
      isCancelled ? 'bg-red-50 text-red-600 border-red-100' :
        'bg-obsidian/5 text-obsidian/40 border-obsidian/10'
      }`}>
      {status.replace('_', ' ')}
    </span>
  )
}
