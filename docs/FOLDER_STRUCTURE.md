# 📁 Folder Structure

Complete file and folder layout for the **Wundervoll Resort** project.

---

## 🌳 Root-Level Tree

```
wundervoll-resort/
│
├── .env.example                  # Template env vars
├── .env.local                    # Your local secrets (gitignored)
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                 # Route protection (admin/auth)
├── components.json               # shadcn config
│
├── prisma/
│   ├── schema.prisma             # Full DB schema
│   ├── seed.ts                   # Seeds 9 rooms
│   └── migrations/               # Auto-generated
│
├── public/
│   ├── images/
│   │   ├── hero/                 # Hero videos/images
│   │   ├── rooms/                # Room photos (or use Cloudinary)
│   │   ├── amenities/            # Icons for spa, pool, etc.
│   │   └── logos/                # Wundervoll logo variants
│   ├── videos/
│   │   └── hero-loop.mp4         # Cinematic background
│   ├── lotties/                  # Lottie JSON files
│   ├── favicon.ico
│   └── robots.txt
│
├── emails/                       # React Email templates
│   ├── BookingConfirmation.tsx
│   ├── PaymentReceipt.tsx
│   └── AdminNotification.tsx
│
└── src/                          # ALL application code lives here
    ├── app/                      # Next.js App Router
    ├── components/               # Reusable UI
    ├── lib/                      # Utilities, DB client, helpers
    ├── hooks/                    # Custom React hooks
    ├── store/                    # Zustand stores
    ├── types/                    # TypeScript types
    ├── styles/                   # Global CSS
    └── constants/                # Static config (room features, etc.)
```

---

## 📂 `src/app/` — Next.js App Router

```
src/app/
│
├── layout.tsx                    # Root layout (fonts, providers)
├── page.tsx                      # Landing page
├── loading.tsx                   # Global loading state
├── error.tsx                     # Error boundary
├── not-found.tsx                 # 404
├── globals.css                   # Tailwind + custom CSS
│
├── (public)/                     # Public route group
│   ├── rooms/
│   │   ├── page.tsx              # All rooms grid
│   │   └── [slug]/
│   │       └── page.tsx          # Single room detail
│   ├── about/
│   │   └── page.tsx
│   ├── amenities/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── gallery/
│       └── page.tsx
│
├── (auth)/                       # Auth route group
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── booking/
│   ├── [roomId]/
│   │   └── page.tsx              # Booking form
│   └── confirmation/
│       └── [id]/
│           └── page.tsx          # Success page
│
├── dashboard/                    # User area (logged in)
│   ├── layout.tsx
│   ├── page.tsx                  # My bookings overview
│   ├── bookings/
│   │   ├── page.tsx              # List
│   │   └── [id]/
│   │       └── page.tsx          # Detail
│   └── profile/
│       └── page.tsx
│
├── admin/                        # Admin panel (role: admin)
│   ├── layout.tsx                # Admin sidebar + protection
│   ├── page.tsx                  # Dashboard
│   ├── rooms/
│   │   ├── page.tsx              # List all rooms
│   │   ├── new/
│   │   │   └── page.tsx          # Add room
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      # Edit room
│   ├── bookings/
│   │   ├── page.tsx              # All bookings table
│   │   └── [id]/
│   │       └── page.tsx          # Booking detail
│   ├── calendar/
│   │   └── page.tsx              # Master calendar (rooms × dates)
│   ├── availability/
│   │   └── page.tsx              # Block dates / seasonal pricing
│   ├── users/
│   │   └── page.tsx              # Guest list
│   ├── analytics/
│   │   └── page.tsx              # Charts
│   └── settings/
│       └── page.tsx
│
└── api/                          # API route handlers
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts
    ├── rooms/
    │   ├── route.ts              # GET all, POST create (admin)
    │   └── [id]/
    │       ├── route.ts          # GET, PATCH, DELETE
    │       └── availability/
    │           └── route.ts      # GET availability for date range
    ├── bookings/
    │   ├── route.ts              # GET user's, POST create
    │   └── [id]/
    │       ├── route.ts          # GET, PATCH, DELETE
    │       └── cancel/
    │           └── route.ts
    ├── payments/
    │   ├── create-intent/
    │   │   └── route.ts          # Stripe payment intent
    │   └── demo-approve/
    │       └── route.ts          # Demo payment fallback
    ├── webhooks/
    │   └── stripe/
    │       └── route.ts          # Stripe webhook handler
    ├── admin/
    │   ├── stats/
    │   │   └── route.ts          # Dashboard metrics
    │   ├── users/
    │   │   └── route.ts
    │   └── availability/
    │       └── route.ts          # Block/unblock dates
    └── upload/
        └── route.ts              # Cloudinary signed uploads
```

---

## 🧩 `src/components/`

```
src/components/
│
├── ui/                           # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── calendar.tsx
│   └── ...                       # (generated by shadcn)
│
├── landing/                      # Landing page sections
│   ├── Hero.tsx
│   ├── HeroVideo.tsx
│   ├── IntroScroll.tsx           # Horizontal scroll text
│   ├── FeaturedRooms.tsx
│   ├── ExperienceStrip.tsx       # Pinned scroll section
│   ├── AmenitiesGrid.tsx
│   ├── Testimonials.tsx
│   ├── BookingCTA.tsx            # Sticky morph button
│   ├── Footer.tsx
│   └── LoadingScreen.tsx         # SVG stroke animation
│
├── rooms/
│   ├── RoomCard.tsx
│   ├── RoomGallery.tsx           # Lightbox
│   ├── RoomFeatures.tsx          # Tags
│   ├── RoomAvailabilityCalendar.tsx
│   ├── RoomFilters.tsx
│   └── PriceBadge.tsx
│
├── booking/
│   ├── DateRangePicker.tsx
│   ├── BookingSummary.tsx
│   ├── BookingForm.tsx
│   ├── PaymentButton.tsx
│   └── GuestCounter.tsx
│
├── admin/
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   ├── BookingsTable.tsx
│   ├── RoomForm.tsx
│   ├── ImageUploader.tsx         # Drag-drop to Cloudinary
│   ├── MasterCalendar.tsx        # FullCalendar wrapper
│   ├── RevenueChart.tsx
│   └── OccupancyChart.tsx
│
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── LogoutButton.tsx
│
├── shared/
│   ├── Navbar.tsx
│   ├── Logo.tsx
│   ├── Container.tsx
│   ├── Section.tsx
│   ├── CustomCursor.tsx
│   ├── SmoothScrollProvider.tsx  # Lenis wrapper
│   └── ThemeProvider.tsx
│
└── providers/
    ├── QueryProvider.tsx         # React Query
    ├── AuthProvider.tsx          # NextAuth session
    └── ToastProvider.tsx         # Sonner
```

---

## 🧰 `src/lib/`

```
src/lib/
│
├── db.ts                         # Prisma client singleton
├── auth.ts                       # NextAuth config
├── auth-helpers.ts               # getSession, requireAdmin
├── stripe.ts                     # Stripe client
├── cloudinary.ts                 # Upload helper
├── email.ts                      # Resend sender + templates
├── utils.ts                      # cn() for class merging
├── availability.ts               # Core availability calculation
├── pricing.ts                    # Calculate totals (nights × rate + taxes)
├── validators/                   # Zod schemas
│   ├── auth.ts
│   ├── booking.ts
│   ├── room.ts
│   └── user.ts
└── fetchers/                     # Client-side API calls (for React Query)
    ├── rooms.ts
    ├── bookings.ts
    └── admin.ts
```

---

## 🪝 `src/hooks/`

```
src/hooks/
├── useRooms.ts                   # React Query hook
├── useAvailability.ts
├── useBooking.ts
├── useAuth.ts
├── useMediaQuery.ts
├── useScrollAnimation.ts         # GSAP hook helper
└── useDebounce.ts
```

---

## 🏪 `src/store/`

```
src/store/
├── bookingDraftStore.ts          # Selected room + dates (Zustand)
├── uiStore.ts                    # Modal open states
└── adminStore.ts                 # Admin UI state
```

---

## 📜 `src/types/`

```
src/types/
├── index.ts                      # Re-exports
├── room.ts
├── booking.ts
├── user.ts
├── next-auth.d.ts                # Augment NextAuth Session type
└── api.ts                        # API response types
```

---

## 🎨 `src/styles/`

```
src/styles/
├── globals.css                   # Tailwind directives + custom CSS
└── fonts.css                     # Custom font-face if needed
```

---

## ⚙️ `src/constants/`

```
src/constants/
├── rooms.ts                      # Default room features list
├── amenities.ts                  # Resort amenities
├── navigation.ts                 # Nav links
├── features.ts                   # Feature flags
└── seo.ts                        # Default meta tags
```

---

## 🔒 Root `middleware.ts`

```ts
// Handles:
// - Redirect unauthenticated users from /dashboard
// - Redirect non-admins from /admin
// - i18n (if added later)
```

---

## 📝 Notes

- **Route groups** (`(public)`, `(auth)`) don't affect URLs — purely organizational
- **Private directories** start with `_` if needed (Next won't route them)
- All **API routes** return typed JSON via zod-validated responses
- **Server components** by default; only add `"use client"` where interactivity is needed
