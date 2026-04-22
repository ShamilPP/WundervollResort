# 🏝️ Wundervoll Resort — Full Stack Booking Platform

A luxury resort landing page and booking platform with a cinematic front-end, real-time availability, secure payments, and a complete admin control panel.

---

## 🎯 Project Goal

Build a premium, production-grade website for **Wundervoll Resort** that:

- Showcases the resort with a visually stunning, animated landing page
- Lets users browse 9 unique rooms with features (beachside view, front view, etc.)
- Provides a live availability calendar showing booked / available dates with pricing
- Allows users to book rooms and complete payment (demo mode via Stripe Test)
- Gives the admin full control over rooms, bookings, pricing, and analytics

---

## 📚 Documentation Index

All planning documents are split for clarity. Read in this order:

| # | Document | Purpose |
|---|----------|---------|
| 1 | [`TECH_STACK.md`](./TECH_STACK.md) | Full tech stack with versions and reasoning |
| 2 | [`PACKAGES.md`](./PACKAGES.md) | Every npm package + install commands |
| 3 | [`FOLDER_STRUCTURE.md`](./FOLDER_STRUCTURE.md) | Complete project folder tree |
| 4 | [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Prisma schema + relationships |
| 5 | [`FEATURES.md`](./FEATURES.md) | Feature breakdown (user + admin) |
| 6 | [`PAGES_ROUTES.md`](./PAGES_ROUTES.md) | All pages and URL structure |
| 7 | [`API_ROUTES.md`](./API_ROUTES.md) | Every API endpoint |
| 8 | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Colors, fonts, spacing, components |
| 9 | [`ANIMATIONS.md`](./ANIMATIONS.md) | Landing page animation plan |
| 10 | [`CALENDAR_SYSTEM.md`](./CALENDAR_SYSTEM.md) | Availability calendar logic |
| 11 | [`BOOKING_FLOW.md`](./BOOKING_FLOW.md) | Booking + payment flow |
| 12 | [`ADMIN_PANEL.md`](./ADMIN_PANEL.md) | Admin dashboard spec |
| 13 | [`ENV_VARIABLES.md`](./ENV_VARIABLES.md) | All env vars needed |
| 14 | [`DEVELOPMENT_PHASES.md`](./DEVELOPMENT_PHASES.md) | Week-by-week roadmap |
| 15 | [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) | Local setup instructions |
| 16 | [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production deployment guide |

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo-url> wundervoll-resort
cd wundervoll-resort
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, STRIPE keys, etc.

# 3. Set up database (MongoDB)
npx prisma db push
npx prisma db seed   # Seeds 9 rooms with sample data

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧩 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Next.js 14 App Router               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Landing Page │  │ User Booking │  │   Admin   │  │
│  │   (Public)   │  │  Dashboard   │  │   Panel   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                │        │
│         └────────┬────────┴────────────────┘        │
│                  ▼                                  │
│           API Routes (/api/*)                       │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┼──────────────┬──────────┐
       ▼           ▼              ▼          ▼
   MongoDB      Stripe API   Cloudinary   Resend
   (Atlas +   (Test Mode)   (Images)    (Emails)
   Prisma)
```

---

## 🏆 Key Deliverables

- **Premium landing page** with cinematic GSAP + Framer Motion animations
- **9 rooms** with feature tagging, photo galleries, and individual detail pages
- **Live calendar** showing booked, available, and custom-priced dates
- **Secure booking flow** (auth → calendar → summary → payment → confirmation)
- **Stripe test-mode payments** with a demo-approval fallback
- **Admin panel** for rooms, bookings, pricing, calendar, and analytics
- **Email confirmations** for bookings and payment receipts
- **Mobile-responsive** across all pages
- **SEO-ready** with proper meta tags, sitemap, and Open Graph images

---

## 📝 License

Private project — Wundervoll Resort.
