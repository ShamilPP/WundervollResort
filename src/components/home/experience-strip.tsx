export function ExperienceStrip() {
  return (
    <section className="relative overflow-hidden bg-primary py-32 text-primary-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="container relative z-10 mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-70">The Experience</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
          Mornings by the ocean. <br />
          Afternoons in the spa. <br />
          Evenings under the stars.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base opacity-80">
          Six acres of reclaimed coastline, restored by native planting and the
          slow craft of traditional Konkan builders.
        </p>
      </div>
    </section>
  )
}
