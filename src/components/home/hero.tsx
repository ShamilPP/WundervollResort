'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Search, ChevronDown } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/style.css'

export function Hero() {
  const router = useRouter()
  const [search, setSearch] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0'
  })

  const [openDropdown, setOpenDropdown] = useState<'checkIn' | 'checkOut' | 'adults' | 'children' | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Helper for animated dropdowns
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
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
            ref={formRef}
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mx-auto w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-5 md:p-6 lg:p-8 border border-slate-100/80 shadow-2xl flex flex-col lg:flex-row items-stretch gap-6 shadow-black/5"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Check In */}
              <div className="flex flex-col gap-2 p-3 sm:p-4 text-left border-b border-slate-100 lg:border-b-0 lg:border-r lg:border-slate-200/60 group relative cursor-pointer">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 transition-colors">
                  <Calendar className="h-3.5 w-3.5 text-accent/60" /> Check-In
                </label>
                <div
                  onClick={() => setOpenDropdown(openDropdown === 'checkIn' ? null : 'checkIn')}
                  className="bg-transparent text-base font-bold text-slate-800 outline-none w-full cursor-pointer flex justify-between items-center group-hover:text-accent transition-colors py-1"
                >
                  <span>{search.checkIn ? format(new Date(search.checkIn), 'MMM d, yyyy') : 'Select Date'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
                <AnimatePresence>
                  {openDropdown === 'checkIn' && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full lg:top-auto lg:bottom-full left-0 mt-2 lg:mt-0 lg:mb-4 origin-top lg:origin-bottom bg-white border border-black/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                      <DayPicker
                        mode="single"
                        selected={search.checkIn ? new Date(search.checkIn) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setSearch(prev => ({ ...prev, checkIn: format(date, 'yyyy-MM-dd') }))
                            setOpenDropdown('checkOut')
                          }
                        }}
                        disabled={[{ before: new Date() }]}
                        className="!font-sans text-black"
                        style={{
                          '--rdp-color': 'black',
                          '--rdp-background': 'transparent',
                          '--rdp-accent-color': 'var(--accent)',
                        } as React.CSSProperties}
                        modifiersClassNames={{
                          selected: 'bg-accent text-white hover:bg-accent hover:text-white',
                          today: 'text-accent font-bold'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Check Out */}
              <div className="flex flex-col gap-2 p-3 sm:p-4 text-left border-b border-slate-100 lg:border-b-0 lg:border-r lg:border-slate-200/60 group relative cursor-pointer">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 transition-colors">
                  <Calendar className="h-3.5 w-3.5 text-accent/60" /> Check-Out
                </label>
                <div
                  onClick={() => setOpenDropdown(openDropdown === 'checkOut' ? null : 'checkOut')}
                  className="bg-transparent text-base font-bold text-slate-800 outline-none w-full cursor-pointer flex justify-between items-center group-hover:text-accent transition-colors py-1"
                >
                  <span>{search.checkOut ? format(new Date(search.checkOut), 'MMM d, yyyy') : 'Select Date'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
                <AnimatePresence>
                  {openDropdown === 'checkOut' && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full lg:top-auto lg:bottom-full left-0 mt-2 lg:mt-0 lg:mb-4 origin-top lg:origin-bottom bg-white border border-black/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                      <DayPicker
                        mode="single"
                        selected={search.checkOut ? new Date(search.checkOut) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setSearch(prev => ({ ...prev, checkOut: format(date, 'yyyy-MM-dd') }))
                            setOpenDropdown(null)
                          }
                        }}
                        disabled={[{ before: search.checkIn ? new Date(search.checkIn) : new Date() }]}
                        className="!font-sans text-black"
                        style={{
                          '--rdp-color': 'black',
                          '--rdp-background': 'transparent',
                          '--rdp-accent-color': 'var(--accent)',
                        } as React.CSSProperties}
                        modifiersClassNames={{
                          selected: 'bg-accent text-white hover:bg-accent hover:text-white',
                          today: 'text-accent font-bold'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Adults */}
              <div className="flex flex-col gap-2 p-3 sm:p-4 text-left border-b border-slate-100 lg:border-b-0 lg:border-r lg:border-slate-200/60 group relative cursor-pointer">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 transition-colors">
                  <Users className="h-3.5 w-3.5 text-accent/60" /> Adults
                </label>
                <div
                  onClick={() => setOpenDropdown(openDropdown === 'adults' ? null : 'adults')}
                  className="bg-transparent text-base font-bold text-slate-800 outline-none w-full cursor-pointer flex justify-between items-center group-hover:text-accent transition-colors py-1"
                >
                  <span>{search.adults} Adult{parseInt(search.adults) > 1 ? 's' : ''}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
                <AnimatePresence>
                  {openDropdown === 'adults' && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full lg:top-auto lg:bottom-full left-0 mt-2 lg:mt-0 lg:mb-4 origin-top lg:origin-bottom w-full min-w-[140px] bg-white border border-black/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <div
                          key={n}
                          onClick={() => {
                            setSearch(prev => ({ ...prev, adults: n.toString() }))
                            setOpenDropdown(null)
                          }}
                          className="px-6 py-3 text-black hover:bg-black/5 cursor-pointer text-base font-bold transition-colors"
                        >
                          {n} Adult{n > 1 ? 's' : ''}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Children */}
              <div className="flex flex-col gap-2 p-3 sm:p-4 text-left group relative cursor-pointer">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2 transition-colors">
                  <Users className="h-3.5 w-3.5 text-accent/60" /> Children
                </label>
                <div
                  onClick={() => setOpenDropdown(openDropdown === 'children' ? null : 'children')}
                  className="bg-transparent text-base font-bold text-slate-800 outline-none w-full cursor-pointer flex justify-between items-center group-hover:text-accent transition-colors py-1"
                >
                  <span>{search.children} Child{parseInt(search.children) !== 1 ? 'ren' : ''}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
                <AnimatePresence>
                  {openDropdown === 'children' && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full lg:top-auto lg:bottom-full left-0 mt-2 lg:mt-0 lg:mb-4 origin-top lg:origin-bottom w-full min-w-[140px] bg-white border border-black/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      {[0, 1, 2, 3].map(n => (
                        <div
                          key={n}
                          onClick={() => {
                            setSearch(prev => ({ ...prev, children: n.toString() }))
                            setOpenDropdown(null)
                          }}
                          className="px-6 py-3 text-black hover:bg-black/5 cursor-pointer text-base font-bold transition-colors"
                        >
                          {n} Child{n !== 1 ? 'ren' : ''}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              className="bg-accent hover:bg-slate-900 text-white px-10 py-6 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 shadow-xl shadow-accent/20 group active:scale-95 flex items-center justify-center gap-4 min-w-[200px] w-full lg:w-auto self-stretch lg:self-center"
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
