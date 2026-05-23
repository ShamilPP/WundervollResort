'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function ExperienceStrip() {
  return (
    <section className="relative py-20 lg:py-0 lg:h-[80vh] lg:min-h-[700px] w-full overflow-hidden bg-[#FDFCFB] flex items-center justify-center">
      {/* Dreamy Light Visual Integration */}
      <motion.div
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 15, ease: "linear" }}
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80"
          alt="The Wundervoll Experience"
          fill
          className="h-full w-full object-cover opacity-30"
        />
      </motion.div>

      {/* Narrative Content (High Contrast Highlighted) */}
      <div className="container relative z-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 lg:space-y-12"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="h-px w-10 sm:w-16 bg-obsidian/10" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.8em] text-accent">
              Our Story
            </span>
            <div className="h-px w-10 sm:w-16 bg-obsidian/10" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[6.5rem] font-medium leading-[1.1] sm:leading-[1] tracking-tighter text-obsidian px-4">
            Mornings by the <span className="text-accent italic">ocean</span>. <br className="hidden sm:inline" />
            Afternoons in the <span className="text-accent italic">spa</span>. <br className="hidden sm:inline" />
            Evenings under the <span className="text-accent italic">stars</span>.
          </h2>

          <div className="mx-auto max-w-2xl pt-4 md:pt-8 px-4">
            <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-obsidian/60 italic border-t border-obsidian/5 pt-6 md:pt-10">
              {"\"A peaceful place by the sea, built with natural materials and traditional methods. A perfect spot to slow down and enjoy nature.\""}
            </p>
          </div>

          <div className="pt-6 lg:pt-12">
            <div className="h-12 sm:h-20 w-px bg-gradient-to-b from-accent/40 to-transparent mx-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}