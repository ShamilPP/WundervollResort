'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/rooms', label: 'Rooms', Icon: BedDouble },
  { href: '/admin/bookings', label: 'Bookings', Icon: CalendarDays },
  { href: '/admin/availability', label: 'Availability', Icon: Calendar },
  { href: '/admin/users', label: 'Users', Icon: Users },
  { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col border-r bg-card">
      <div className="border-b p-5">
        <Link href="/admin" className="font-serif text-xl">
          Wundervoll
        </Link>
        <p className="text-xs text-muted-foreground">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <item.Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <Home className="h-4 w-4" strokeWidth={1.75} />
          Back to site
        </Link>
      </div>
    </aside>
  )
}
