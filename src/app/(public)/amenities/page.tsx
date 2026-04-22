import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Amenities } from '@/components/home/amenities'

export const metadata: Metadata = {
  title: 'Amenities · Wundervoll Resort',
  description: 'Ocean pool, signature dining, Ayurvedic spa, and more.',
}

export default function AmenitiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Amenities
          </p>
          <h1 className="mt-3 font-serif text-5xl">Every detail, considered.</h1>
        </div>
        <Amenities />
      </main>
      <Footer />
    </>
  )
}
