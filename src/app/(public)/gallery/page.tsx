import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GalleryGrid } from '@/components/gallery/gallery-grid'

export const metadata: Metadata = {
  title: 'Gallery · Wundervoll Resort',
  description: 'A look around the sanctuary. Explore the visual manifestations of the Wundervoll experience.',
}

export default function GalleryPage() {
  return (
    <div className="bg-[#FDFCFB] min-h-screen flex flex-col">
      <Navbar transparentAtTop />
      
      <main className="flex-1">
        {/* Cinematic Header */}
        <div className="relative pt-64 pb-32 text-center overflow-hidden">
          <div className="container relative z-10 space-y-6">
            <div className="flex items-center justify-center gap-4">
               <div className="h-px w-12 bg-accent" />
               <span className="text-[11px] font-black uppercase tracking-[0.8em] text-accent">
                 Manifestations
               </span>
               <div className="h-px w-12 bg-accent" />
            </div>
            <h1 className="font-serif text-6xl md:text-9xl text-obsidian tracking-tighter leading-none">
              The <span className="text-accent italic font-light">Gallery</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg font-light text-obsidian/40 italic">
              {"\"A curated look around the sanctuary, where nature meets architecture in unhurried silence.\""}
            </p>
          </div>
          
          {/* Subtle Background Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-video bg-gradient-radial from-accent/5 to-transparent pointer-events-none opacity-50" />
        </div>

        {/* Dynamic Gallery Manifestation */}
        <GalleryGrid />
      </main>

      <Footer />
    </div>
  )
}
