'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const links = [
  { href: '/rooms', label: 'Rooms' },
  { href: '/amenities', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isSolid = !transparentAtTop || scrolled

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex justify-center pt-4 md:pt-6 px-4 md:px-6 pointer-events-none">
      <div className="w-full max-w-7xl flex justify-center pointer-events-auto">
        <motion.div
          animate={{
            backgroundColor: isSolid ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: isSolid ? 'blur(24px)' : 'blur(12px)',
            boxShadow: isSolid ? '0 20px 50px -12px rgba(0,0,0,0.15)' : '0 4px 20px -2px rgba(0,0,0,0.05)',
            borderColor: isSolid ? 'rgba(0, 51, 102, 0.08)' : 'rgba(255,255,255,0.15)',
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={cn(
            "relative flex h-16 md:h-20 w-full items-center justify-between rounded-[2rem] md:rounded-[3rem] border px-6 md:px-12 blur-layer fluid-layer",
            !isSolid ? "text-white" : "text-obsidian"
          )}
        >
          {/* Brand Identity */}
          <Link href="/" className="font-serif text-xl md:text-3xl tracking-[0.3em] md:tracking-[0.4em] font-light flex-shrink-0">
            WUNDERVOLL
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-14 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12px] font-bold uppercase tracking-[0.4em] opacity-70 transition-all hover:opacity-100 hover:tracking-[0.5em] hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Action Center */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:block">
              {status === 'loading' ? (
                <div className="h-1.5 w-16 rounded-full bg-obsidian/10 animate-pulse" />
              ) : session?.user ? (
                <UserMenu
                  name={session.user.name ?? session.user.email ?? 'Account'}
                  role={session.user.role}
                  isSolid={isSolid}
                />
              ) : (
                <div className="flex items-center gap-10">
                  <Link
                    href="/login"
                    className="text-[12px] font-bold uppercase tracking-[0.3em] opacity-60 hover:opacity-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/rooms"
                    className={cn(
                      "rounded-full px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl",
                      isSolid
                        ? "bg-accent text-white shadow-accent/20"
                        : "bg-white text-gray-600 shadow-white/10"
                    )}
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-obsidian/5 transition-colors flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 md:top-28 inset-x-4 z-[90] overflow-hidden rounded-[2.5rem] border border-obsidian/10 bg-white p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] lg:hidden pointer-events-auto"
          >
            <nav className="flex flex-col gap-6">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-serif text-obsidian/80 hover:text-obsidian"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-obsidian/5">
                <Link
                  href="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-full bg-accent py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white"
                >
                  Book Now
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function UserMenu({
  name,
  role,
  isSolid,
}: {
  name: string
  role: 'USER' | 'ADMIN'
  isSolid: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-4 rounded-full px-6 py-3 transition-all duration-300 border shadow-sm",
          isSolid
            ? "border-obsidian/10 bg-white hover:bg-obsidian/5"
            : "border-white/20 bg-white/5 hover:bg-white/10"
        )}
      >
        <User className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-[12px] font-bold uppercase tracking-widest hidden md:inline">{name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 opacity-40 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute right-0 mt-6 w-72 overflow-hidden rounded-[2.5rem] border border-obsidian/10 bg-white p-3 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] z-[110] transform-gpu"
          >
            <div className="p-6 border-b border-obsidian/5">
              <p className="text-base font-bold truncate text-accent">{"\""}{name}{"\""}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mt-1">
                {role === 'ADMIN' ? 'Administrator' : 'Guest'}
              </p>
            </div>
            <nav className="p-3 space-y-2">
              <MenuLink href="/dashboard" onClick={() => setOpen(false)}>My Bookings</MenuLink>
              <MenuLink href="/dashboard" onClick={() => setOpen(false)}>My Account</MenuLink>
              {role === 'ADMIN' && (
                <MenuLink href="/admin" onClick={() => setOpen(false)}>Admin Panel</MenuLink>
              )}
              <div className="pt-2">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full rounded-2xl px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all flex items-center justify-between group"
                >
                  <span>Sign out</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-2xl px-6 py-4 text-[13px] font-bold text-accent hover:bg-obsidian/5 hover:translate-x-1 transition-all"
    >
      {children}
    </Link>
  )
}
