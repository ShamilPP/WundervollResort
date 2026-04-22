# 🗄️ Database Schema (MongoDB)

Complete Prisma schema for **Wundervoll Resort** using **MongoDB**. Drop this into `prisma/schema.prisma`.

---

## ⚠️ MongoDB-Specific Notes

Key conventions for Prisma's MongoDB connector used in this project:

| Topic | MongoDB convention |
|-------|--------------------|
| ID field | `@id @default(auto()) @map("_id") @db.ObjectId` |
| Foreign keys | `String @db.ObjectId` |
| Money (`Decimal`) | Not supported — store as `Int` in smallest unit (paise) |
| Date-only | Not supported — use `DateTime` + normalize to midnight UTC in code |
| Migrations | `prisma db push` (no migrations folder) |
| Transactions | Supported on replica-set clusters (snapshot isolation + write-conflict retry) |
| `@@index` composite | Supported |

**Money handling**: all prices are stored as **integers in paise** (₹1 = 100 paise). Display logic divides by 100. This avoids floating-point bugs and is a best practice anyway.

---

## 📋 Model Overview

| Model | Purpose |
|-------|---------|
| `User` | Guests + admins (role-based) |
| `Account` / `Session` | NextAuth tables |
| `Room` | The 9 resort rooms |
| `RoomImage` | Photos for each room |
| `Booking` | Reservations |
| `Payment` | Payment records linked to bookings |
| `BlockedDate` | Admin-blocked dates (maintenance, etc.) |
| `SeasonalPrice` | Custom pricing for date ranges |
| `Review` | Guest reviews (optional) |

---

## 🧬 Full `schema.prisma`

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

enum Role {
  USER
  ADMIN
}

model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // hashed, null for OAuth users
  phone         String?
  role          Role      @default(USER)

  accounts  Account[]
  sessions  Session[]
  bookings  Booking[]
  reviews   Review[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────

enum RoomType {
  DELUXE
  SUITE
  VILLA
  FAMILY
  PRESIDENTIAL
}

enum RoomFeature {
  BEACHSIDE_VIEW
  FRONT_VIEW
  OCEAN_VIEW
  GARDEN_VIEW
  POOL_VIEW
  MOUNTAIN_VIEW
  PRIVATE_BALCONY
  PRIVATE_POOL
  JACUZZI
  KING_BED
  QUEEN_BED
  TWIN_BEDS
  WIFI
  AIR_CONDITIONING
  MINI_BAR
  ROOM_SERVICE
  SMART_TV
  COFFEE_MACHINE
  SAFE
  BATHTUB
}

model Room {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  slug        String   @unique           // URL-friendly: "beachside-villa-01"
  name        String                      // "Ocean Breeze Villa"
  type        RoomType
  description String
  shortDesc   String                      // Card description

  // Capacity
  maxGuests   Int      @default(2)
  bedType     String                      // "King", "Twin"
  sizeSqft    Int                         // e.g. 450

  // Pricing — stored as PAISE (integer)
  basePrice     Int                       // ₹18500 = 1850000 paise
  weekendPrice  Int?                      // Optional weekend override

  // Features
  features    RoomFeature[]

  // Status
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  // Relations
  images         RoomImage[]
  bookings       Booking[]
  blockedDates   BlockedDate[]
  seasonalPrices SeasonalPrice[]
  reviews        Review[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([isActive])
}

model RoomImage {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  roomId    String  @db.ObjectId
  url       String                        // Cloudinary URL
  publicId  String                        // For deletion
  alt       String?
  isPrimary Boolean @default(false)
  sortOrder Int     @default(0)

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId])
}

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────

enum BookingStatus {
  PENDING       // Awaiting payment
  CONFIRMED     // Paid
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  REFUNDED
}

model Booking {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  code      String   @unique              // Human-friendly: "WDV-2026-0001"

  // Relations
  userId    String  @db.ObjectId
  user      User    @relation(fields: [userId], references: [id])
  roomId    String  @db.ObjectId
  room      Room    @relation(fields: [roomId], references: [id])
  payment   Payment?

  // Dates — normalize to midnight UTC in code
  checkIn   DateTime
  checkOut  DateTime
  nights    Int                            // Computed and stored

  // Guests
  guestCount      Int     @default(1)
  guestName       String
  guestEmail      String
  guestPhone      String?
  specialRequests String?

  // Money — all in PAISE
  subtotal    Int
  taxes       Int
  totalAmount Int
  currency    String @default("INR")

  // Status
  status BookingStatus @default(PENDING)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([roomId])
  @@index([status])
  @@index([checkIn, checkOut])
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  STRIPE
  DEMO          // Demo-approve fallback
  CASH_ON_ARRIVAL
}

model Payment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  bookingId String   @unique @db.ObjectId
  booking   Booking  @relation(fields: [bookingId], references: [id])

  amount   Int                           // paise
  currency String         @default("INR")
  status   PaymentStatus  @default(PENDING)
  method   PaymentMethod  @default(STRIPE)

  // Stripe-specific
  stripePaymentIntentId String? @unique
  stripeChargeId        String?
  receiptUrl            String?

  // Metadata (MongoDB handles JSON natively)
  metadata Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
}

// ─────────────────────────────────────────────
// AVAILABILITY MANAGEMENT
// ─────────────────────────────────────────────

model BlockedDate {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  roomId String @db.ObjectId
  room   Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)

  startDate DateTime
  endDate   DateTime
  reason    String?  // "Maintenance", "Private Event"

  createdAt DateTime @default(now())

  @@index([roomId, startDate, endDate])
}

model SeasonalPrice {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  roomId String @db.ObjectId
  room   Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)

  name      String                        // "Peak Season - Christmas"
  startDate DateTime
  endDate   DateTime
  price     Int                           // paise

  createdAt DateTime @default(now())

  @@index([roomId, startDate, endDate])
}

// ─────────────────────────────────────────────
// REVIEWS (OPTIONAL)
// ─────────────────────────────────────────────

model Review {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])
  roomId String @db.ObjectId
  room   Room   @relation(fields: [roomId], references: [id])

  rating  Int     // 1-5
  title   String?
  comment String?

  isApproved Boolean @default(false)

  createdAt DateTime @default(now())

  @@unique([userId, roomId])
  @@index([roomId])
}
```

---

## 💰 Working with Paise (Integer Money)

```ts
// src/lib/money.ts

/** Convert rupees to paise for storage */
export const toPaise = (rupees: number) => Math.round(rupees * 100)

/** Convert paise to rupees for display */
export const toRupees = (paise: number) => paise / 100

/** Format for display */
export const formatINR = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)

// Examples:
// toPaise(18500)       → 1850000
// toRupees(1850000)    → 18500
// formatINR(1850000)   → "₹18,500"
```

---

## 📅 Working with Dates (Normalize to UTC Midnight)

MongoDB stores full `DateTime`, so for date-only fields (check-in, check-out, blocks), normalize to midnight UTC:

```ts
// src/lib/dates.ts
import { startOfDay } from 'date-fns'

/** Normalize any date to midnight (time stripped) */
export function normalizeDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  const normalized = new Date(d)
  normalized.setUTCHours(0, 0, 0, 0)
  return normalized
}

// Use whenever storing check-in, check-out, blocked dates
const checkIn = normalizeDate('2026-05-15') // → 2026-05-15T00:00:00.000Z
```

---

## 🔗 Relationship Diagram

```
User (1) ─── (∞) Booking (∞) ─── (1) Room
                   │
                   ▼
                Payment (1:1)

Room ──┬── RoomImage (∞)
       ├── BlockedDate (∞)
       ├── SeasonalPrice (∞)
       └── Review (∞) ─── User
```

Prisma simulates relations on MongoDB using referenced ObjectIds — the DB itself doesn't enforce FKs, but Prisma adds runtime checks and cascading deletes.

---

## 🌱 Seed Data (9 Rooms)

Create `prisma/seed.ts`:

```ts
import { PrismaClient, RoomType, RoomFeature } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Prices in PAISE (₹1 = 100 paise)
const rooms = [
  {
    slug: 'ocean-breeze-villa',
    name: 'Ocean Breeze Villa',
    type: RoomType.VILLA,
    description: 'A private oceanfront villa with panoramic sea views and direct beach access.',
    shortDesc: 'Oceanfront villa with private beach access',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 650,
    basePrice: 1850000,       // ₹18,500
    weekendPrice: 2200000,    // ₹22,000
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
    description: 'Watch the sunset paint the sky from your west-facing private terrace.',
    shortDesc: 'West-facing suite with sunset views',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 520,
    basePrice: 1450000,       // ₹14,500
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
    description: 'Tranquil room nestled in tropical gardens with a private outdoor shower.',
    shortDesc: 'Lush garden views and outdoor shower',
    maxGuests: 2,
    bedType: 'Queen',
    sizeSqft: 380,
    basePrice: 950000,        // ₹9,500
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
    basePrice: 1250000,       // ₹12,500
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
    basePrice: 2100000,       // ₹21,000
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
    description: 'Traditional bungalow steps from the shore with thatched roof and hardwood floors.',
    shortDesc: 'Traditional bungalow near the shore',
    maxGuests: 2,
    bedType: 'Queen',
    sizeSqft: 400,
    basePrice: 1100000,       // ₹11,000
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
    basePrice: 1350000,       // ₹13,500
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
    description: 'Romantic pavilion with private plunge pool and champagne welcome.',
    shortDesc: 'Romantic escape with private plunge pool',
    maxGuests: 2,
    bedType: 'King',
    sizeSqft: 580,
    basePrice: 1950000,       // ₹19,500
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
    description: 'The pinnacle of luxury — three bedrooms, private pool, butler service.',
    shortDesc: 'Three-bedroom villa with butler service',
    maxGuests: 6,
    bedType: 'King × 3',
    sizeSqft: 1200,
    basePrice: 4500000,       // ₹45,000
    weekendPrice: 5500000,    // ₹55,000
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

async function main() {
  // Seed rooms
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: room,
      create: room,
    })
  }

  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@wundervoll.com' },
    update: {},
    create: {
      email: 'admin@wundervoll.com',
      name: 'Admin',
      role: 'ADMIN',
      password: hashedPassword,
    },
  })

  console.log('✅ Seeded 9 rooms and admin user')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 🏃 MongoDB Commands

```bash
# Generate the Prisma client
npx prisma generate

# Push schema to MongoDB (no migrations folder with MongoDB)
npx prisma db push

# Open GUI
npx prisma studio

# Seed
npx prisma db seed

# Reset (wipe + re-seed)
npx prisma db push --force-reset
npx prisma db seed
```

> ⚠️ **No `prisma migrate dev`** with MongoDB. Schema changes go live via `db push`.

---

## 🔐 Preventing Double-Booking on MongoDB

MongoDB Atlas clusters (including the free M0 tier) are replica sets by default, which means **Prisma transactions work**. Use them for race-safe booking creation:

```ts
// src/lib/bookings.ts
export async function createBookingSafely(input) {
  return prisma.$transaction(async (tx) => {
    // Check availability (overlap query)
    const conflicts = await tx.booking.count({
      where: {
        roomId: input.roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        AND: [
          { checkIn: { lt: input.checkOut } },
          { checkOut: { gt: input.checkIn } },
        ],
      },
    })
    if (conflicts > 0) throw new Error('ROOM_UNAVAILABLE')

    // Check admin blocks
    const blocks = await tx.blockedDate.count({
      where: {
        roomId: input.roomId,
        AND: [
          { startDate: { lt: input.checkOut } },
          { endDate: { gt: input.checkIn } },
        ],
      },
    })
    if (blocks > 0) throw new Error('DATES_BLOCKED')

    // Create booking
    return tx.booking.create({ data: { ... } })
  })
}
```

> ⚠️ **Local standalone MongoDB** (like `mongod` installed via Homebrew) is NOT a replica set and does not support transactions. For local dev, either use Atlas, use Docker with a replica-set config, or rely on optimistic checks and accept rare race conditions in dev.

---

## 💡 Key Design Decisions

1. **Money as Int (paise)** — avoids Prisma's MongoDB Decimal limitation; best practice for money anyway
2. **Dates normalized to UTC midnight** — compensates for MongoDB having no date-only type
3. **ObjectId everywhere** — native MongoDB ID format
4. **`db push` not `migrate dev`** — MongoDB doesn't need structural migrations
5. **Composite indexes on `[roomId, startDate, endDate]`** — critical for fast availability queries
6. **`code` on Booking** — user-facing reference, not ObjectId
7. **`BlockedDate` separate from `Booking`** — keeps admin blocks clean
8. **Cascading deletes via Prisma** — Prisma enforces since MongoDB doesn't have FK cascades natively

---

## 🔍 Important MongoDB Gotchas

- **No `Decimal` type** → use `Int` for money (paise)
- **No `@db.Text`** → just use `String` (MongoDB doesn't distinguish)
- **No `@db.Date`** → use `DateTime` + normalize in code
- **Schemaless reality** → old records may have missing fields after schema changes; add defaults or write a one-off migration script
- **Date range queries** need both bounds: `{ AND: [{ field: { gte: from } }, { field: { lte: to } }] }`
- **Local `mongod` is not a replica set** → Prisma transactions will fail; use Atlas or Docker with `--replSet`
- **`findMany` with deep relations** can be slow on MongoDB; prefer explicit IDs + separate queries if perf matters
