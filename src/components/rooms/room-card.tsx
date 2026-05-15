'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Room, RoomImage } from '@prisma/client'
import { formatINR } from '@/lib/money'

export function RoomCard({ room }: { room: Room & { images: RoomImage[] } }) {
  const img = room.images.find((i) => i.isPrimary) ?? room.images[0]
  const url = img?.url ?? placeholderFor(room.slug)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href={`/rooms/${room.slug}`}
        className="group relative block overflow-hidden rounded-[2.5rem] bg-obsidian aspect-[4/5] shadow-xl"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-[1200ms] scale-100 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          style={{ backgroundImage: `url('${url}')` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Floating Content Box */}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-obsidian/90 backdrop-blur-2xl border border-white/10 p-6 transition-all duration-500 group-hover:bg-obsidian group-hover:-translate-y-2 group-hover:border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-black mt-1">
                  {room.type}
                </span>
                <div className="flex flex-col items-end bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 transition-all duration-500 group-hover:bg-white/10 group-hover:border-accent/30">
                  <span className="text-[8px] text-white/40 uppercase tracking-[0.4em] font-black mb-0.5">Investment</span>
                  <span className="text-lg font-serif text-accent font-bold tracking-tight leading-none">
                    {formatINR(room.basePrice)}
                  </span>
                </div>
              </div>
              
              <h3 className="font-serif text-2xl text-white font-bold tracking-wide">
                {room.name}
              </h3>
              
              <div className="flex items-center justify-between text-[9px] text-white/50 font-black uppercase tracking-widest border-t border-white/5 pt-4">
                <span>{room.maxGuests} Guests</span>
                <div className="h-1 w-1 rounded-full bg-accent/40" />
                <span>{room.sizeSqft} SQ FT</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function placeholderFor(slug: string) {
  const seed = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return `https://picsum.photos/seed/${seed}/800/600`
}
