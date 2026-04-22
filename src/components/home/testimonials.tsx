const quotes = [
  { name: 'Anjali & Raghu', stay: 'Honeymoon Pavilion · March', text: 'The pavilion opened onto the sea. Every meal was its own event. We didn\'t want to leave.' },
  { name: 'The Kapoor family', stay: 'Family Haven · December', text: 'The kids had their own space, we had ours. The staff remembered everyone\'s names by day two.' },
  { name: 'Meera S.', stay: 'Garden Retreat · October', text: 'Rain on the roof, coffee in the garden, a quiet that I forgot existed. A real retreat.' },
]

export function Testimonials() {
  return (
    <section className="container py-24">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Guest Stories
      </p>
      <h2 className="mt-3 text-center font-serif text-4xl md:text-5xl">
        Words from our guests.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {quotes.map((q) => (
          <figure key={q.name} className="rounded-lg border bg-card p-6">
            <blockquote className="text-base leading-relaxed text-foreground">
              “{q.text}”
            </blockquote>
            <figcaption className="mt-6 border-t pt-4">
              <p className="font-medium">{q.name}</p>
              <p className="text-xs text-muted-foreground">{q.stay}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
