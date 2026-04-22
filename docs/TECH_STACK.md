# 🛠️ Tech Stack

Complete technology choices for **Wundervoll Resort**, with reasoning for each.

---

## 🎯 Framework & Language

| Tech | Version | Why |
|------|---------|-----|
| **Next.js** | 14.2+ (App Router) | SSR + SSG + API routes in one framework; best SEO for a resort site |
| **TypeScript** | 5.x | Type safety across DB → API → UI; catches booking bugs early |
| **React** | 18.x | Industry standard; works perfectly with Next |
| **Node.js** | 20 LTS | Required runtime for Next 14 |

---

## 🎨 Styling & UI

| Tech | Purpose |
|------|---------|
| **Tailwind CSS 3.4+** | Utility-first CSS — fast prototyping, easy theming |
| **shadcn/ui** | Accessible component primitives (Button, Dialog, Calendar, etc.) |
| **Radix UI** | Underlying headless primitives for shadcn |
| **Lucide React** | Icon set — clean, consistent line icons |
| **clsx + tailwind-merge** | Conditional class name utilities |
| **next-themes** | Dark/light mode (optional toggle in admin) |

---

## ✨ Animation

| Tech | Purpose |
|------|---------|
| **Framer Motion** | React-friendly animations — page transitions, modals, micro-interactions |
| **GSAP** (+ ScrollTrigger) | Cinematic landing page animations, scroll-based reveals, pinned sections |
| **Lenis** | Buttery smooth scrolling across the whole site |
| **Lottie React** | Vector animations for amenities icons |
| **react-intersection-observer** | Trigger animations when elements enter viewport |

---

## 🗄️ Database & ORM

| Tech | Purpose |
|------|---------|
| **MongoDB 7.x** | Document DB — flexible schema for rooms, bookings, users |
| **Prisma 5.x** | Type-safe ORM with MongoDB connector |
| **MongoDB Atlas** | Managed MongoDB hosting (free M0 tier — 512MB) |

> ⚠️ **MongoDB notes**: Prisma's MongoDB connector doesn't support `Decimal` — money is stored as `Int` (paise). No migrations folder — use `prisma db push`. Transactions require a replica set (Atlas clusters are always replica sets, so it works out of the box in production; for local dev use Atlas or Docker with `--replSet`).

---

## 🔐 Authentication

| Tech | Purpose |
|------|---------|
| **NextAuth.js v5** (Auth.js) | Credentials + Google OAuth; role-based (user/admin) |
| **bcryptjs** | Password hashing |
| **zod** | Login/signup input validation |

---

## 💳 Payments

| Tech | Purpose |
|------|---------|
| **Stripe** (Test Mode) | Real-looking payment flow with test card `4242 4242 4242 4242` |
| **@stripe/stripe-js** | Client-side Stripe integration |
| **stripe** (Node SDK) | Server-side payment intents + webhooks |

Fallback "demo approve" flow is built as a toggle, so the site works even without Stripe keys.

---

## 🖼️ Image Handling

| Tech | Purpose |
|------|---------|
| **Cloudinary** | Hosting + on-the-fly transformations for room photos |
| **next/image** | Automatic lazy loading, responsive sizing, blur placeholder |
| **Sharp** | Server-side image optimization (used by next/image) |

---

## 📅 Calendar & Dates

| Tech | Purpose |
|------|---------|
| **date-fns** | Lightweight date manipulation (add days, compare ranges) |
| **react-day-picker** | User-facing date range picker on room pages |
| **@tanstack/react-table** | Admin booking tables with sorting/filtering |
| **FullCalendar React** | Admin master calendar (Gantt-style rooms × dates view) |

---

## 📧 Email

| Tech | Purpose |
|------|---------|
| **Resend** | Transactional email sending API |
| **React Email** | JSX-based email templates (booking confirmation, receipt) |

---

## 📊 Forms & Validation

| Tech | Purpose |
|------|---------|
| **React Hook Form** | Performant form state management |
| **zod** | Schema validation (shared between client + server) |
| **@hookform/resolvers** | Connects zod to react-hook-form |

---

## 📈 Analytics & Charts (Admin)

| Tech | Purpose |
|------|---------|
| **Recharts** | Revenue charts, booking trends, occupancy graphs |
| **date-fns** | Date grouping for analytics (by day/week/month) |

---

## 🌐 State Management

| Tech | Purpose |
|------|---------|
| **Zustand** | Lightweight global state (cart-style booking draft, UI state) |
| **@tanstack/react-query** | Server state — caching, refetching rooms/availability |

---

## 🧪 Developer Tools

| Tech | Purpose |
|------|---------|
| **ESLint** + **Prettier** | Code quality and formatting |
| **Husky** + **lint-staged** | Pre-commit hooks |
| **TypeScript strict mode** | Enforced |

---

## 🚀 Deployment & Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosts Next.js app (frontend + API) |
| **MongoDB Atlas** | MongoDB hosting |
| **Cloudinary** | Image CDN |
| **Resend** | Email delivery |
| **Stripe** | Payments |
| **GitHub** | Source control + CI via Vercel integration |

---

## 🧰 Recommended VS Code Extensions

- Prisma
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- GitLens
- Error Lens

---

## 📦 Full list of packages →

See [`PACKAGES.md`](./PACKAGES.md) for every package with install commands.
