'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

const links = [
  { href: '/rooms', label: 'Rooms' },
  { href: '/amenities', label: 'Amenities' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = !transparentAtTop || scrolled

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid
          ? 'border-b bg-background/90 backdrop-blur-md'
          : 'bg-transparent text-white',
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wider">
          WUNDERVOLL
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide opacity-80 transition hover:opacity-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <span className="h-8 w-20 animate-pulse rounded-md bg-muted/40" />
          ) : session?.user ? (
            <UserMenu
              name={session.user.name ?? session.user.email ?? 'Account'}
              role={session.user.role}
              solid={solid}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm opacity-80 hover:opacity-100 md:inline"
              >
                Sign in
              </Link>
              <Link
                href="/rooms"
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition',
                  solid
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-white text-primary hover:bg-white/90',
                )}
              >
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function UserMenu({
  name,
  role,
  solid,
}: {
  name: string
  role: 'USER' | 'ADMIN'
  solid: boolean
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
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
          solid
            ? 'border hover:bg-muted'
            : 'border border-white/30 hover:bg-white/10',
        )}
      >
        <User className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden max-w-[140px] truncate md:inline">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border bg-card text-foreground shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">
              {role === 'ADMIN' ? 'Administrator' : 'Guest'}
            </p>
          </div>
          <nav className="py-1 text-sm">
            <MenuLink href="/dashboard" onClick={() => setOpen(false)}>
              My bookings
            </MenuLink>
            <MenuLink href="/dashboard" onClick={() => setOpen(false)}>
              My account
            </MenuLink>
            {role === 'ADMIN' && (
              <MenuLink href="/admin" onClick={() => setOpen(false)}>
                Admin panel
              </MenuLink>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full border-t px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
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
      className="block px-4 py-2 hover:bg-muted"
    >
      {children}
    </Link>
  )
}
