'use client'

import { motion } from 'framer-motion'
import { Waves, Sparkles, Utensils, Zap, Map, ConciergeBell } from 'lucide-react'

const amenityList = [
  {
    icon: Waves,
    title: "Ocean-Edge Pool",
    desc: "A beautiful heated pool that looks directly out over the waves."
  },
  {
    icon: Sparkles,
    title: "Garden Spa",
    desc: "Relaxing treatments and massages in our private spa garden."
  },
  {
    icon: Utensils,
    title: "Beachfront Dining",
    desc: "Fresh, local food served under the stars or right by the water."
  },
  {
    icon: ConciergeBell,
    title: "Personal Concierge",
    desc: "Our team is here 24/7 to help you with anything you need."
  },
  {
    icon: Map,
    title: "Coastal Walks",
    desc: "Explore the natural beauty of the coast with our guided walks."
  },
  {
    icon: Zap,
    title: "Stay Connected",
    desc: "High-speed internet is available throughout the resort."
  }
]

export function Amenities() {
  return (
    <section className="bg-[#FDFCFB] py-40 border-t border-obsidian/5 optimize-render">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* Enhanced Header Column (The Main Highlight) */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-40">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                  What We Offer
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-[5.5rem] text-obsidian tracking-tighter leading-[0.95]">
                Our <br /> 
                <span className="text-accent italic font-light">Services</span>
              </h2>
            </div>
            
            <div className="space-y-8 border-l-2 border-accent/20 pl-10">
              <p className="text-xl font-light leading-relaxed text-obsidian/70 italic">
                {"\"We focus on all the small details to make your stay as comfortable and relaxing as possible.\""}
              </p>
              <div className="pt-4">
                 <div className="h-0.5 w-24 bg-obsidian/10" />
              </div>
            </div>
          </div>

          {/* Amenities Grid (Standard Premium Style) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            {amenityList.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white p-10 rounded-[3rem] border border-obsidian/5 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:border-accent/30"
              >
                <div className="flex flex-col gap-8">
                  {/* Highlighted Icon */}
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-accent/5 text-accent transition-all duration-700 group-hover:bg-accent group-hover:text-white group-hover:rotate-6 shadow-sm">
                    <item.icon className="h-7 w-7" strokeWidth={1.25} />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl text-obsidian tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-base font-light text-obsidian/50 leading-relaxed italic">
                      {"\""}{item.desc}{"\""}
                    </p>
                  </div>

                  {/* Corner Accent Detail */}
                  <div className="absolute top-8 right-8 h-1 w-1 rounded-full bg-obsidian/10 group-hover:bg-accent transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
