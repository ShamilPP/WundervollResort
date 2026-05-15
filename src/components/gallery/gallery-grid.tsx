'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  category: string
  alt?: string
}

export function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/admin/gallery')
        const data = await res.json()
        if (Array.isArray(data)) {
          setImages(data)
        } else {
          setImages([])
        }
      } catch (err) {
        console.error('Failed to load gallery manifestations')
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  if (loading) {
    return (
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-[3rem] bg-obsidian/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif text-xl text-obsidian/40 italic">
          {"\"The sanctuary's visual vault is being prepared. Please return soon.\""}
        </p>
      </div>
    )
  }

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
      <AnimatePresence>
        {Array.isArray(images) && images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-square overflow-hidden rounded-[3.5rem] bg-obsidian/5 border border-obsidian/5"
          >
            <Image
              src={img.url}
              alt={img.alt || 'Sanctuary Manifestation'}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center backdrop-blur-sm p-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                {img.category}
              </span>
              <div className="h-px w-12 bg-white/40 mb-4" />
              <p className="text-white text-sm font-light italic leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-75">
                {img.alt}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
