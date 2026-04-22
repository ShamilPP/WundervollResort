import { PrismaClient, RoomType, RoomFeature } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const rooms = [
  {
    slug: 'ocean-breeze-villa',
    name: 'Ocean Breeze Villa',
    type: RoomType.VILLA,
    description:
      'A private oceanfront villa with panoramic sea views and direct beach access.',
    shortDesc: 'Oceanfront villa with private beach access',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 650,
    basePrice: 1850000,
    weekendPrice: 2200000,
    features: [
      RoomFeature.BEACHSIDE_VIEW,
      RoomFeature.OCEAN_VIEW,
      RoomFeature.PRIVATE_BALCONY,
      RoomFeature.KING_BED,
      RoomFeature.JACUZZI,
      RoomFeature.WIFI,
      RoomFeature.MINI_BAR,
    ],
    sortOrder: 1,
  },
  {
    slug: 'sunset-suite',
    name: 'Sunset Suite',
    type: RoomType.SUITE,
    description:
      'Watch the sunset paint the sky from your west-facing private terrace.',
    shortDesc: 'West-facing suite with sunset views',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 520,
    basePrice: 1450000,
    features: [
      RoomFeature.FRONT_VIEW,
      RoomFeature.OCEAN_VIEW,
      RoomFeature.PRIVATE_BALCONY,
      RoomFeature.KING_BED,
      RoomFeature.WIFI,
      RoomFeature.BATHTUB,
    ],
    sortOrder: 2,
  },
  {
    slug: 'garden-retreat',
    name: 'Garden Retreat',
    type: RoomType.DELUXE,
    description:
      'Tranquil room nestled in tropical gardens with a private outdoor shower.',
    shortDesc: 'Lush garden views and outdoor shower',
    maxGuests: 2,
    bedType: 'Queen',
    sizeSqft: 380,
    basePrice: 950000,
    features: [
      RoomFeature.GARDEN_VIEW,
      RoomFeature.QUEEN_BED,
      RoomFeature.WIFI,
      RoomFeature.AIR_CONDITIONING,
      RoomFeature.COFFEE_MACHINE,
    ],
    sortOrder: 3,
  },
  {
    slug: 'poolside-deluxe',
    name: 'Poolside Deluxe',
    type: RoomType.DELUXE,
    description: 'Step directly from your room into the infinity pool.',
    shortDesc: 'Direct infinity pool access',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 420,
    basePrice: 1250000,
    features: [
      RoomFeature.POOL_VIEW,
      RoomFeature.KING_BED,
      RoomFeature.WIFI,
      RoomFeature.AIR_CONDITIONING,
      RoomFeature.SMART_TV,
      RoomFeature.MINI_BAR,
    ],
    sortOrder: 4,
  },
  {
    slug: 'family-haven',
    name: 'Family Haven',
    type: RoomType.FAMILY,
    description: 'Spacious two-bedroom suite for families with connecting rooms.',
    shortDesc: 'Two-bedroom family suite',
    maxGuests: 5,
    bedType: 'King + Twin',
    sizeSqft: 750,
    basePrice: 2100000,
    features: [
      RoomFeature.GARDEN_VIEW,
      RoomFeature.KING_BED,
      RoomFeature.TWIN_BEDS,
      RoomFeature.WIFI,
      RoomFeature.SMART_TV,
      RoomFeature.ROOM_SERVICE,
    ],
    sortOrder: 5,
  },
  {
    slug: 'beachside-bungalow',
    name: 'Beachside Bungalow',
    type: RoomType.DELUXE,
    description:
      'Traditional bungalow steps from the shore with thatched roof and hardwood floors.',
    shortDesc: 'Traditional bungalow near the shore',
    maxGuests: 2,
    bedType: 'Queen',
    sizeSqft: 400,
    basePrice: 1100000,
    features: [
      RoomFeature.BEACHSIDE_VIEW,
      RoomFeature.QUEEN_BED,
      RoomFeature.WIFI,
      RoomFeature.AIR_CONDITIONING,
      RoomFeature.COFFEE_MACHINE,
    ],
    sortOrder: 6,
  },
  {
    slug: 'mountainview-retreat',
    name: 'Mountainview Retreat',
    type: RoomType.SUITE,
    description: 'Hillside suite with sweeping views of the Western Ghats.',
    shortDesc: 'Hillside suite with mountain panorama',
    maxGuests: 3,
    bedType: 'King',
    sizeSqft: 500,
    basePrice: 1350000,
    features: [
      RoomFeature.MOUNTAIN_VIEW,
      RoomFeature.PRIVATE_BALCONY,
      RoomFeature.KING_BED,
      RoomFeature.WIFI,
      RoomFeature.BATHTUB,
      RoomFeature.COFFEE_MACHINE,
    ],
    sortOrder: 7,
  },
  {
    slug: 'honeymoon-pavilion',
    name: 'Honeymoon Pavilion',
    type: RoomType.SUITE,
    description:
      'Romantic pavilion with private plunge pool and champagne welcome.',
    shortDesc: 'Romantic escape with private plunge pool',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 580,
    basePrice: 1950000,
    features: [
      RoomFeature.OCEAN_VIEW,
      RoomFeature.PRIVATE_POOL,
      RoomFeature.JACUZZI,
      RoomFeature.KING_BED,
      RoomFeature.WIFI,
      RoomFeature.MINI_BAR,
    ],
    sortOrder: 8,
  },
  {
    slug: 'presidential-villa',
    name: 'Presidential Villa',
    type: RoomType.PRESIDENTIAL,
    description:
      'The pinnacle of luxury — three bedrooms, private pool, butler service.',
    shortDesc: 'Three-bedroom villa with butler service',
    maxGuests: 6,
    bedType: 'King × 3',
    sizeSqft: 1200,
    basePrice: 4500000,
    weekendPrice: 5500000,
    features: [
      RoomFeature.OCEAN_VIEW,
      RoomFeature.BEACHSIDE_VIEW,
      RoomFeature.PRIVATE_POOL,
      RoomFeature.JACUZZI,
      RoomFeature.KING_BED,
      RoomFeature.WIFI,
      RoomFeature.SMART_TV,
      RoomFeature.MINI_BAR,
      RoomFeature.ROOM_SERVICE,
      RoomFeature.SAFE,
    ],
    sortOrder: 9,
  },
]

const imagePool = [
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550249154.jpg?k=2d296f157c541e17ef5c3768c17e99005b72384640971cc6adb118d1402d0963&o=',
  'https://media.cntraveler.com/photos/53da60a46dec627b149e66f4/master/pass/hilton-moorea-lagoon-resort-spa-moorea-french-poly--110160-1.jpg',
  'https://foxosocms.cinuniverse.com/images/uploads/68024ff0649f7aaristo_facade.webp',
  'https://gos3.ibcdn.com/968b09a6f05411ec9c210a58a9feac02.jpeg',
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/656411102.jpg?k=7e1185b2b5cee354505b239d9266d7b4e14922dcc32f66404c06554bacdbac1a&o=',
  'https://cdn.prod.website-files.com/646f213fe994eb87d757cb30/6716a150190e46ec195e9a61_hero_banner.webp',
  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/32/16/d6/caption.jpg?w=900&h=500&s=1',
  'https://www.cvent.com/sites/default/files/image/2024-10/Hyatt-Regency-Grand-Reserve.jpg',
  'https://www.sunhotelandresort.com/images/JSD09255.webp',
]

function pickImages(seedKey: string, count: number) {
  // Deterministic shuffle from a seed string so the same slug always gets the
  // same images (avoids re-seed churn). Uses a tiny LCG.
  let s = 0
  for (let i = 0; i < seedKey.length; i++) s = (s * 31 + seedKey.charCodeAt(i)) >>> 0
  const pool = [...imagePool]
  const picks: string[] = []
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) >>> 0
    const idx = s % pool.length
    picks.push(pool[idx])
    pool.splice(idx, 1)
    if (pool.length === 0) break
  }
  return picks
}

async function main() {
  for (const room of rooms) {
    let created: { id: string } | null = null
    try {
      created = await prisma.room.create({ data: room })
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        console.log(`  skip: ${room.slug} (already exists)`)
        created = await prisma.room.findUnique({ where: { slug: room.slug } })
      } else {
        throw e
      }
    }

    if (!created) continue

    const existingImages = await prisma.roomImage.count({ where: { roomId: created.id } })
    if (existingImages > 0) continue

    const urls = pickImages(room.slug, 4)
    for (const [i, url] of urls.entries()) {
      await prisma.roomImage.create({
        data: {
          roomId: created.id,
          url,
          publicId: `seed-${room.slug}-${i}`,
          alt: `${room.name} photo ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i,
        },
      })
    }
  }

  const adminEmail = 'admin@wundervoll.com'
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        role: 'ADMIN',
        password: hashedPassword,
      },
    })
  }

  console.log('Seeded 9 rooms (with images) and admin user (admin@wundervoll.com / admin123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
