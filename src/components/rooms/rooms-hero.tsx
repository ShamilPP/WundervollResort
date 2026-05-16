'use client'

import { motion } from 'framer-motion'
import { RoomFilters } from './room-filters'

export function RoomsHero() {
  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-obsidian">
      {/* Immersive Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="h-full w-full bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />
      </motion.div>

      {/* Centered High-Impact Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-start px-4 pt-48 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-accent mb-6 block">
            Limited Collection
          </span>
          <h1 className="font-serif text-6xl md:text-9xl text-white tracking-tight leading-none mb-8">
            The Residences
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 font-light italic leading-relaxed">
            {"\"Nine private sanctuaries where the architecture serves only to frame the rhythm of the ocean.\""}
          </p>
        </motion.div>
      </div>

      {/* Integrated Action Bar (Understandable UI) */}
      <div className="absolute inset-x-0 bottom-6 z-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-5xl rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl shadow-obsidian/50"
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
                Find your perfect sanctuary
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <RoomFilters />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
