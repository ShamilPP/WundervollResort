'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatINR } from '@/lib/money'

type Props = {
  rooms: any[]
}

export function FeaturedRooms({ rooms }: Props) {
  return (
    <section id="residences" className="bg-[#FDFCFB] py-32 optimize-render">
      <div className="container">
        <div className="mb-24 space-y-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-obsidian/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">
              Selected Rooms
            </span>
            <div className="h-px w-12 bg-obsidian/10" />
          </div>
          <h2 className="font-serif text-4xl md:text-8xl text-obsidian tracking-tighter">
            Our Guest Rooms
          </h2>
          <p className="mx-auto max-w-xl text-lg font-light text-obsidian/40 italic">
            {"\"Choose from our selection of comfortable, private rooms.\""}
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 3).map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-[600px] md:h-[750px] overflow-hidden rounded-[3.5rem] bg-obsidian fluid-layer blur-layer gpu-layer"
            >
              <Link
                href={`/rooms/${room.slug}`}
                className="group relative block w-full h-full overflow-hidden rounded-[3.5rem] bg-obsidian shadow-2xl"
              >
                {/* Optimized Image */}
                <Image
                  src={room.images[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80'}
                  alt={room.name}
                  fill
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Floating Editorial Box */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-obsidian/80 backdrop-blur-2xl border border-white/10 p-8 transition-all duration-700 group-hover:bg-obsidian group-hover:-translate-y-2 group-hover:border-white/20 will-change-transform">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                          Room {idx + 1}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-black mb-1">Investment</span>
                          <span className="text-2xl font-serif text-accent font-bold tracking-tight">
                            {formatINR(room.basePrice)} 
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-2">/ Night</span>
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-wide leading-tight">
                        {room.name}
                      </h3>

                      {/* View Button Reveal */}
                      <div className="pt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white">
                         <span className="group-hover:text-accent transition-colors">View Sanctuary</span>
                         <div className="h-px flex-1 bg-white/10 group-hover:bg-accent/40 transition-colors duration-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link
            href="/rooms"
            className="text-[10px] font-black uppercase tracking-[0.5em] text-obsidian/40 transition-all hover:text-accent hover:tracking-[0.7em]"
          >
            See All Rooms —
          </Link>
        </div>
      </div>
    </section>
  )
}
