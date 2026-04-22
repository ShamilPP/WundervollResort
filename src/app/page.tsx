import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { FeaturedRooms } from '@/components/home/featured-rooms'
import { ExperienceStrip } from '@/components/home/experience-strip'
import { Amenities } from '@/components/home/amenities'
import { Testimonials } from '@/components/home/testimonials'

export default async function HomePage() {
  const rooms = await prisma.room
    .findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    })
    .catch(() => [])

  return (
    <>
      <Navbar transparentAtTop />
      <main>
        <Hero />
        <FeaturedRooms rooms={rooms} />
        <ExperienceStrip />
        <Amenities />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
