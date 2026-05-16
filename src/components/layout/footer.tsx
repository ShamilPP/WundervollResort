import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-[#FDFCFB] pt-16 pb-10 overflow-hidden border-t border-obsidian/5">
      <div className="container relative z-10">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 border-b border-obsidian/5">

          {/* Identity Column */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl tracking-widest text-obsidian">WUNDERVOLL</h3>
            <p className="text-sm font-light leading-relaxed text-obsidian/50 italic max-w-xs">
              {"\"A curated sanctuary where architecture meets the infinite tide.\""}
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="h-10 w-10 rounded-full border border-obsidian/10 flex items-center justify-center text-obsidian hover:bg-obsidian transition-all cursor-pointer shadow-sm group"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Directory: Residency */}
          <div className="space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent">Stay</p>
            <ul className="space-y-3">
              <li><FooterLink href="/rooms">Our Rooms</FooterLink></li>
              <li><FooterLink href="/amenities">Services</FooterLink></li>
              <li><FooterLink href="/gallery">Gallery</FooterLink></li>
              <li><FooterLink href="/booking">Book Now</FooterLink></li>
            </ul>
          </div>

          {/* Directory: Company */}
          <div className="space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent">About Us</p>
            <ul className="space-y-3">
              <li><FooterLink href="/about">Our Story</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
            </ul>
          </div>

          {/* Inquiry Column */}
          <div className="space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent">Newsletter</p>
            <p className="text-sm font-light text-obsidian/40 italic leading-relaxed">Subscribe to get the latest news and updates from our resort.</p>
            <form className="relative flex items-center pt-2">
              <input
                type="email"
                placeholder="Guest Email"
                className="w-full bg-transparent border-b border-obsidian/10 px-0 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-obsidian/20 text-obsidian"
              />
              <button className="absolute right-0 text-[11px] font-black uppercase tracking-widest text-accent hover:text-obsidian transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Refined Brand Signature (Compact) */}
        <div className="pt-10 pb-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-obsidian/20">
              © {new Date().getFullYear()} Wundervoll Resort. All rights reserved.
            </p>
          </div>
          <h2 className="font-serif text-2xl tracking-[0.4em] text-obsidian/10 select-none">
            WUNDERVOLL
          </h2>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs font-bold text-obsidian/60 hover:text-accent hover:translate-x-2 transition-all inline-block"
    >
      {children}
    </Link>
  )
}
