import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'About · Wundervoll Resort',
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="container py-16">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              About
            </p>
            <h1 className="mt-3 font-serif text-5xl">Built by the coast, for the coast.</h1>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
              <p>
                Wundervoll is a family-run resort restored over six years on a
                stretch of reclaimed coastline on the Konkan coast. Nine
                residences, built with local laterite stone, Burmese teak, and
                slow craftsmanship.
              </p>
              <p>
                We don&apos;t believe luxury is flashy. We believe it&apos;s
                quiet — linen that breathes, floors that stay cool, meals made
                from what the sea and garden gave us this morning.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
