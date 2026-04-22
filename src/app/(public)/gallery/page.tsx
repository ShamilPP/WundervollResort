import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Gallery · Wundervoll Resort',
}

const images = Array.from({ length: 12 }, (_, i) => i + 10)

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Gallery
          </p>
          <h1 className="mt-3 font-serif text-5xl">A look around the resort.</h1>
        </div>
        <div className="container grid gap-4 pb-24 md:grid-cols-3">
          {images.map((seed) => (
            <div
              key={seed}
              className="aspect-[4/3] overflow-hidden rounded-lg bg-cover bg-center"
              style={{
                backgroundImage: `url('https://picsum.photos/seed/wdv${seed}/800/600')`,
              }}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
