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
  Image as ImageIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', Icon: CalendarDays },
  { href: '/admin/rooms', label: 'Rooms', Icon: BedDouble },
  { href: '/admin/availability', label: 'Availability', Icon: Calendar },
  { href: '/admin/gallery', label: 'Gallery', Icon: ImageIcon },
  { href: '/admin/users', label: 'Users', Icon: Users },
  { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 z-40 flex w-full flex-col border-b bg-obsidian text-white lg:h-screen lg:w-64 lg:flex-shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-white/5 p-4 lg:p-6 lg:flex-col lg:items-start">
        <div className="space-y-0.5">
          <Link href="/admin" className="font-serif text-xl tracking-widest text-accent">
            Wundervoll
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Command Suite</p>
        </div>

        {/* Mobile Toggle would go here if we had many links, but for now a simple horizontal scroll is elegant */}
      </div>

      <nav className="flex flex-row overflow-x-auto p-2 scrollbar-hide lg:flex-1 lg:flex-col lg:space-y-2 lg:p-4 lg:overflow-y-auto">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-300',
                active
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'hover:bg-white/5 text-black',
              )}
            >
              <item.Icon className={cn("h-4 w-4", active ? "text-white" : "text-accent")} strokeWidth={1.75} />
              <span className="lg:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="hidden border-t border-white/5 p-4 lg:block">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-black"
        >
          <Home className="h-4 w-4 text-accent" strokeWidth={1.75} />
          Back to Sanctuary
        </Link>
      </div>
    </aside>
  )
}
