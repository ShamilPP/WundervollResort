'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const quotes = [
  { 
    name: 'Anjali & Raghu', 
    stay: 'Honeymoon Pavilion · March', 
    text: 'The pavilion opened onto the sea. Every meal was its own event. We didn\'t want to leave.' 
  },
  { 
    name: 'The Kapoor family', 
    stay: 'Family Haven · December', 
    text: 'The kids had their own space, we had ours. The staff remembered everyone\'s names by day two.' 
  },
  { 
    name: 'Meera S.', 
    stay: 'Garden Retreat · October', 
    text: 'Rain on the roof, coffee in the garden, a quiet that I forgot existed. A real retreat.' 
  },
]

export function Testimonials() {
  return (
    <section className="bg-white py-40">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* Priority Header */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-40">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                  Guest Reviews
                </span>
              </div>
              <h2 className="font-serif text-6xl md:text-[5.5rem] text-obsidian tracking-tighter leading-[0.95]">
                What Our <br /> 
                <span className="text-accent italic font-light">Guests Say</span>
              </h2>
            </div>
            <p className="text-xl font-light leading-relaxed text-obsidian/40 italic max-w-md">
              {"\"We are happy to share some of the feedback we have received from our guests who have stayed with us.\""}
            </p>
          </div>

          {/* Stories Feed (Premium Standard) */}
          <div className="lg:col-span-7 space-y-24">
            {quotes.map((q, idx) => (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10 border-b border-obsidian/5 pb-20 last:border-0 last:pb-0"
              >
                <blockquote className="font-serif text-4xl md:text-5xl text-obsidian leading-[1.2] italic group transition-all duration-700">
                  <span className="text-accent text-6xl mr-2">{"\""}</span>
                  {q.text}
                  <span className="text-accent text-6xl ml-2">{"\""}</span>
                </blockquote>
                
                <div className="flex items-center justify-between">
                   <div className="space-y-2">
                      <p className="text-sm font-bold text-obsidian uppercase tracking-widest">{q.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-obsidian/30">{q.stay}</p>
                   </div>
                   <div className="h-12 w-12 rounded-full border border-obsidian/5 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
