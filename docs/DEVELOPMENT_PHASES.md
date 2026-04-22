# 🗓️ Development Phases

Week-by-week roadmap to build **Wundervoll Resort** from zero to production.

Estimated total: **4–6 weeks solo** (full-time), or **2–3 months** part-time.

---

## 📅 Overview

| Phase | Goal | Duration |
|-------|------|----------|
| 1 | Foundation & setup | 2–3 days |
| 2 | Landing page | 4–5 days |
| 3 | Rooms browsing + detail | 2–3 days |
| 4 | Calendar + availability | 3–4 days |
| 5 | Auth + booking creation | 3–4 days |
| 6 | Payment integration | 2–3 days |
| 7 | Admin panel | 5–7 days |
| 8 | Polish, SEO, deploy | 2–3 days |
| **Total** | | **3–5 weeks** |

---

## 🏗️ Phase 1 — Foundation

**Goal**: Skeleton project running with DB + auth + seed data.

### Tasks
- [ ] Create Next.js 14 app: `npx create-next-app@latest`
- [ ] Install core packages (see [`PACKAGES.md`](./PACKAGES.md))
- [ ] Set up Tailwind theme with colors + fonts
- [ ] Initialize shadcn/ui
- [ ] Create Prisma schema (MongoDB provider) → run `npx prisma db push`
- [ ] Write seed script → seed 9 rooms + admin user
- [ ] Set up NextAuth with credentials + Google
- [ ] Create folder structure (see [`FOLDER_STRUCTURE.md`](./FOLDER_STRUCTURE.md))
- [ ] Set up `.env.example`, env validation
- [ ] Create `lib/db.ts`, `lib/auth.ts`, `lib/utils.ts`
- [ ] Set up React Query provider, Zustand store, Toaster
- [ ] Configure ESLint, Prettier, Husky

### Deliverable
- Run `npm run dev` and see a hello page
- Open `npx prisma studio` and see 9 seeded rooms
- `/login` page works, admin can sign in

---

## 🎨 Phase 2 — Landing Page

**Goal**: Jaw-dropping landing page. This is the heart of the brief.

### Tasks
- [ ] Build `Hero` component with video loop + animated text
- [ ] Add Lenis smooth scroll wrapper
- [ ] Build `LoadingScreen` with SVG stroke animation
- [ ] Add `CustomCursor` component (desktop only)
- [ ] Build `IntroScroll` with horizontal GSAP scroll
- [ ] Build `FeaturedRooms` with 3D tilt cards (fetch rooms from DB)
- [ ] Build `ExperienceStrip` (pinned scroll section)
- [ ] Build `AmenitiesGrid` with Lottie icons
- [ ] Build `Testimonials` carousel
- [ ] Build `BookingCTA` (sticky, morphing)
- [ ] Build `Navbar` (transparent at top, solid after scroll)
- [ ] Build `Footer` with newsletter
- [ ] Mobile responsive pass
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test `prefers-reduced-motion`
- [ ] Optimize Lighthouse score

### Deliverable
- Landing page loads in under 3s
- All animations feel premium on scroll
- Mobile works smoothly

---

## 🏖️ Phase 3 — Rooms Browsing

**Goal**: Users can browse all 9 rooms and view individual details.

### Tasks
- [ ] Build `/rooms` page with grid
- [ ] Build `RoomCard` component
- [ ] Build `RoomFilters` (view type, price, guests)
- [ ] Build `/rooms/[slug]` detail page
- [ ] Build `RoomGallery` with lightbox
- [ ] Build `RoomFeatures` component with icons
- [ ] Add SEO metadata per room
- [ ] Build `/api/rooms` GET endpoint
- [ ] Build `/api/rooms/[id]` GET endpoint
- [ ] Integrate React Query for data fetching
- [ ] Add skeleton loaders

### Deliverable
- `/rooms` shows 9 cards with filters
- Click a card → detail page with gallery + features
- Mobile responsive

---

## 📅 Phase 4 — Calendar & Availability

**Goal**: Live availability calendar on each room page.

### Tasks
- [ ] Implement `lib/availability.ts` core function
- [ ] Implement `lib/pricing.ts`
- [ ] Build `/api/rooms/[id]/availability` endpoint
- [ ] Build `RoomAvailabilityCalendar` using react-day-picker
- [ ] Style booked / blocked / available states
- [ ] Show live price calculation as dates change
- [ ] Enforce min nights, max advance days
- [ ] Unit test availability logic with various scenarios
- [ ] Edge cases: back-to-back bookings, today's date, etc.

### Deliverable
- Pick dates on a room page → see live price and availability
- Booked dates are disabled
- Calendar updates when another user books

---

## 🔐 Phase 5 — Auth & Booking Creation

**Goal**: Users can sign up, sign in, and create a PENDING booking.

### Tasks
- [ ] Build `/signup`, `/login`, `/forgot-password` pages
- [ ] Build `LoginForm`, `SignupForm` with React Hook Form + zod
- [ ] Style NextAuth pages
- [ ] Build `middleware.ts` for route protection
- [ ] Build `/booking/[roomId]` multi-step form
- [ ] Build `BookingSummary` component
- [ ] Zustand store for booking draft
- [ ] Build `/api/bookings` POST
- [ ] Build `/api/bookings/quote` POST
- [ ] Build `/dashboard` with "My Bookings"
- [ ] Build `/dashboard/bookings/[id]` detail page

### Deliverable
- User signs up → lands on dashboard
- User picks room/dates → booking form pre-fills → submits → booking shows PENDING in dashboard

---

## 💳 Phase 6 — Payment Integration

**Goal**: Complete the booking flow with payment → confirmation.

### Tasks
- [ ] Set up Stripe (test mode) keys
- [ ] Build `/api/payments/create-intent`
- [ ] Build `PaymentButton` with Stripe Elements
- [ ] Build `/api/webhooks/stripe`
- [ ] Handle `payment_intent.succeeded` event
- [ ] Build Demo Payment mode fallback
- [ ] Build `/booking/confirmation/[id]` success page
- [ ] Build React Email template for confirmation
- [ ] Send email on successful payment via Resend
- [ ] Test with Stripe test cards
- [ ] Set up Stripe webhook forwarding locally

### Deliverable
- User completes payment with `4242 4242 4242 4242`
- Booking becomes CONFIRMED
- Confirmation email arrives
- Date becomes unavailable for others

---

## 🛠️ Phase 7 — Admin Panel

**Goal**: Full admin control over everything.

### Tasks
- [ ] Build admin layout + sidebar with route protection
- [ ] Build `/admin` dashboard with KPI cards + charts
- [ ] Build `/admin/rooms` list + create/edit forms
- [ ] Build Cloudinary image uploader
- [ ] Build `/admin/bookings` table with filters
- [ ] Build booking detail sheet with status actions
- [ ] Build `/admin/calendar` (FullCalendar resource timeline)
- [ ] Build `/admin/availability` for blocks + seasonal pricing
- [ ] Build `/admin/users` list + detail
- [ ] Build `/admin/analytics` with Recharts
- [ ] Build `/admin/settings`
- [ ] Build CSV export endpoint
- [ ] Build refund flow with Stripe

### Deliverable
- Admin can manage every aspect without touching code
- All charts show real data
- CSV export works

---

## ✨ Phase 8 — Polish, SEO, Deploy

**Goal**: Ship to production.

### Tasks
- [ ] Add dynamic meta tags per page
- [ ] Add Open Graph image generation (`/api/og`)
- [ ] Add sitemap.xml, robots.txt
- [ ] Add schema.org markup for hotel/rooms
- [ ] Optimize images with next/image
- [ ] Run Lighthouse audit → fix issues (target 90+)
- [ ] Add error.tsx, not-found.tsx
- [ ] Add loading.tsx for every route
- [ ] Smoke test every flow
- [ ] Set up MongoDB Atlas production cluster
- [ ] Deploy to Vercel
- [ ] Configure Vercel environment variables
- [ ] Set up custom domain + SSL
- [ ] Configure Vercel Cron for pending cleanup
- [ ] Set up Stripe webhook endpoint in Stripe dashboard
- [ ] Configure production Cloudinary, Resend
- [ ] Final end-to-end test on production

### Deliverable
- Live at `wundervoll.com` with SSL
- All features working
- SEO in place
- Monitoring set up

---

## 🎯 Success Criteria per Phase

| Phase | Success Means |
|-------|---------------|
| 1 | DB + auth working, 9 rooms seeded |
| 2 | Landing page feels premium, animations smooth |
| 3 | Users can browse all rooms and view details |
| 4 | Availability shows accurately for each room |
| 5 | Booking is created with PENDING status |
| 6 | Payment completes → confirmation email sent |
| 7 | Admin can manage site without code |
| 8 | Live in production, working end-to-end |

---

## 📊 Suggested Daily Rhythm

Morning:
- Review yesterday's commits
- Pick 1–3 tasks for the day

Midday:
- Build
- Commit often (atomic messages)

Afternoon:
- Test what you built
- Fix edge cases
- Update docs if something changed

Evening:
- Deploy to staging (Vercel preview)
- Plan tomorrow

---

## 🚩 Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Animations cause perf issues | Test Lighthouse early; disable on mobile |
| Stripe webhook fails locally | Use `stripe listen` CLI to forward |
| Race conditions on double-booking | MongoDB replica-set transaction (snapshot isolation + write conflict detection) |
| Image uploads too slow | Use Cloudinary direct upload + signed uploads |
| Email deliverability | Verify domain in Resend, use SPF/DKIM |
| Timezone bugs | Store all dates as UTC in DB, convert only in UI |

---

## 🧪 Testing Milestones

- End of Phase 2: Desktop + mobile visual QA
- End of Phase 4: Test 10 different date pickers
- End of Phase 6: Test with 5 Stripe test cards
- End of Phase 7: Admin can perform all workflows
- End of Phase 8: Production smoke test + Lighthouse audit

---

## 🎉 Post-Launch

Week 1 after launch:
- Monitor Vercel analytics
- Watch Stripe dashboard
- Check email deliverability
- Gather user feedback

Month 1:
- Add Google Analytics / PostHog
- Start SEO content (blog posts about the resort)
- Integrate with Google Business
- Add multi-language support
