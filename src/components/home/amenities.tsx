import { Waves, Utensils, Dumbbell, Flower2, Wifi, Car } from 'lucide-react'

const items = [
  { Icon: Waves, title: 'Infinity Pool', desc: 'Ocean-edge infinity pool open sunrise to midnight.' },
  { Icon: Utensils, title: 'Signature Dining', desc: 'Two restaurants with coastal and pan-Asian menus.' },
  { Icon: Flower2, title: 'Ayurvedic Spa', desc: 'Traditional treatments in garden pavilions.' },
  { Icon: Dumbbell, title: 'Wellness Studio', desc: 'Yoga, sunrise runs, and personal trainers.' },
  { Icon: Wifi, title: 'High-speed Wi-Fi', desc: 'Fibre throughout the estate, free for guests.' },
  { Icon: Car, title: 'Airport Transfers', desc: 'Complimentary for stays of three nights or more.' },
]

export function Amenities() {
  return (
    <section className="bg-secondary py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Amenities
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Every detail, considered.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-lg bg-card p-6">
              <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
              <h3 className="mt-4 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
