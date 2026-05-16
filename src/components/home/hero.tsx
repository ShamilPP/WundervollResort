'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Users, Search } from 'lucide-react'

export function Hero() {
  const router = useRouter()
  const [search, setSearch] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0'
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (search.checkIn) sp.set('checkIn', search.checkIn)
    if (search.checkOut) sp.set('checkOut', search.checkOut)
    sp.set('adults', search.adults)
    sp.set('children', search.children)
    // For backward compatibility or combined guest count if needed:
    sp.set('guests', (parseInt(search.adults) + parseInt(search.children)).toString())
    router.push(`/rooms?${sp.toString()}`)
  }

  return (
    <section className="relative h-[120vh] w-full overflow-hidden bg-obsidian gpu-layer">
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
          className="w-full max-w-6xl space-y-12"
        >
          <div className="space-y-6">
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
          </div>

          {/* Quick Search Panel */}
          <motion.form 
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mx-auto w-full max-w-5xl bg-white/5 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-stretch gap-6"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Check In */}
              <div className="flex flex-col gap-3 p-4 text-left border-r border-white/5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 group-hover:text-white transition-colors">
                  <Calendar className="h-3 w-3" /> Check-In
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={search.checkIn}
                    onChange={(e) => setSearch(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="bg-transparent text-base font-bold text-white outline-none w-full cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="flex flex-col gap-3 p-4 text-left border-r border-white/5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 group-hover:text-white transition-colors">
                  <Calendar className="h-3 w-3" /> Check-Out
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={search.checkOut}
                    min={search.checkIn}
                    onChange={(e) => setSearch(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="bg-transparent text-base font-bold text-white outline-none w-full cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Adults */}
              <div className="flex flex-col gap-3 p-4 text-left border-r border-white/5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 group-hover:text-white transition-colors">
                  <Users className="h-3 w-3" /> Adults
                </label>
                <select 
                  value={search.adults}
                  onChange={(e) => setSearch(prev => ({ ...prev, adults: e.target.value }))}
                  className="bg-transparent text-base font-bold text-white outline-none w-full appearance-none cursor-pointer group-hover:text-accent transition-colors"
                >
                  {[1,2,3,4].map(n => <option key={n} value={n} className="bg-obsidian text-white">{n} Adult{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {/* Children */}
              <div className="flex flex-col gap-3 p-4 text-left group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 group-hover:text-white transition-colors">
                  <Users className="h-3 w-3" /> Children
                </label>
                <select 
                  value={search.children}
                  onChange={(e) => setSearch(prev => ({ ...prev, children: e.target.value }))}
                  className="bg-transparent text-base font-bold text-white outline-none w-full appearance-none cursor-pointer group-hover:text-accent transition-colors"
                >
                  {[0,1,2,3].map(n => <option key={n} value={n} className="bg-obsidian text-white">{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="bg-accent hover:bg-white text-white hover:text-accent px-10 py-6 rounded-[2rem] transition-all duration-500 shadow-xl shadow-accent/20 group active:scale-95 flex items-center justify-center gap-4 min-w-[200px]"
            >
              <Search className="h-5 w-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Check Availability</span>
            </button>
          </motion.form>

          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/60 md:text-xl italic">
            {"\"A beautiful beachfront resort on the Konkan coast. Relax, recharge, and enjoy the ocean view.\""}
          </p>
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
