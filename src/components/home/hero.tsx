'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative h-[110vh] w-full overflow-hidden bg-obsidian gpu-layer">
      {/* Cinematic Background Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/60" />

      {/* Background Image (Atmospheric Parallax) */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
          alt="Luxury Resort Sanctuary"
          fill
          priority
          className="object-cover opacity-70"
        />
      </motion.div>

      {/* Hero Content */}
      <div className="container relative z-20 flex h-full flex-col items-center justify-center text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60">
              Welcome to the Sanctuary
            </span>
            <div className="h-px w-12 bg-white/40" />
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-[10rem] font-light leading-[0.9] tracking-tighter">
            Wundervoll <br />
            <span className="italic text-white/90">Resort</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/80 md:text-xl italic">
            {"\"A beautiful beachfront resort on the Konkan coast. Relax, recharge, and enjoy the ocean view.\""}
          </p>

          <div className="pt-12">
            <Link
              href="/rooms"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-14 py-6 text-[12px] font-bold uppercase tracking-[0.4em] text-obsidian shadow-[0_20px_50px_-15px_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 text-accent">Explore Our Rooms</span>
              <div className="absolute inset-0 z-0 bg-slate-100 group-hover:bg-accent/10 transition-colors duration-500" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating Discovery Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 rotate-90 mb-8">
            Discovery
          </span>
          <div className="h-24 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  )
}
