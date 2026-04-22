import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-16 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl">Wundervoll</p>
          <p className="mt-3 text-sm opacity-70">
            A luxury beachfront resort experience on the Konkan coast.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest opacity-60">Stay</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/rooms" className="opacity-80 hover:opacity-100">Rooms</Link></li>
            <li><Link href="/amenities" className="opacity-80 hover:opacity-100">Amenities</Link></li>
            <li><Link href="/gallery" className="opacity-80 hover:opacity-100">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest opacity-60">Company</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="opacity-80 hover:opacity-100">About</Link></li>
            <li><Link href="/contact" className="opacity-80 hover:opacity-100">Contact</Link></li>
            <li><a href="mailto:stay@wundervoll.com" className="opacity-80 hover:opacity-100">stay@wundervoll.com</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest opacity-60">Newsletter</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-primary-foreground/20 bg-transparent px-3 py-2 text-sm placeholder:text-primary-foreground/40 focus:outline-none"
            />
            <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Wundervoll Resort. All rights reserved.
      </div>
    </footer>
  )
}
