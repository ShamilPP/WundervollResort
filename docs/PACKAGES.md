# 📦 Packages & Install Commands

Every npm package used in the project, grouped by purpose.

---

## 🚀 One-Shot Install (Copy & Paste)

Run these three commands in order from a fresh Next.js 14 app:

```bash
# 1. Core dependencies
npm install \
  @prisma/client \
  next-auth@beta @auth/prisma-adapter bcryptjs \
  zod react-hook-form @hookform/resolvers \
  stripe @stripe/stripe-js \
  @tanstack/react-query @tanstack/react-table \
  zustand \
  date-fns react-day-picker \
  @fullcalendar/react @fullcalendar/daygrid @fullcalendar/resource-timeline @fullcalendar/interaction \
  framer-motion gsap lenis lottie-react react-intersection-observer \
  recharts \
  lucide-react clsx tailwind-merge class-variance-authority \
  next-themes \
  resend react-email @react-email/components \
  cloudinary next-cloudinary \
  sharp

# 2. Dev dependencies
npm install -D \
  prisma \
  @types/bcryptjs @types/node @types/react @types/react-dom \
  eslint eslint-config-next prettier prettier-plugin-tailwindcss \
  husky lint-staged \
  tsx

# 3. shadcn/ui setup (initialized via CLI)
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select calendar popover form toast dropdown-menu table tabs sheet separator badge avatar skeleton sonner
```

---

## 📋 Package Breakdown by Category

### Core Framework
```bash
# Already included when you create the Next.js app
npx create-next-app@latest wundervoll-resort --typescript --tailwind --app --eslint
```
- `next` — framework
- `react`, `react-dom`
- `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`

---

### Database (Prisma + MongoDB)
```bash
npm install @prisma/client
npm install -D prisma tsx
```
- `@prisma/client` — generated DB client (MongoDB connector enabled via `provider = "mongodb"` in schema)
- `prisma` — CLI for `db push` and seeding
- `tsx` — runs TS seed scripts

> No extra MongoDB driver needed — Prisma bundles it. Just set `DATABASE_URL="mongodb+srv://..."` and `provider = "mongodb"` in `schema.prisma`.

---

### Authentication
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```
- `next-auth` — full auth solution
- `@auth/prisma-adapter` — stores users in MongoDB via Prisma
- `bcryptjs` — password hashing

---

### Forms & Validation
```bash
npm install zod react-hook-form @hookform/resolvers
```
- `zod` — schema validation
- `react-hook-form` — form state
- `@hookform/resolvers` — zod ↔ RHF bridge

---

### Payments
```bash
npm install stripe @stripe/stripe-js
```
- `stripe` — server SDK (payment intents, webhooks)
- `@stripe/stripe-js` — client SDK (Checkout redirect)

---

### Data Fetching & State
```bash
npm install @tanstack/react-query @tanstack/react-table zustand
```
- `@tanstack/react-query` — server state + caching
- `@tanstack/react-table` — admin data tables
- `zustand` — lightweight global state

---

### Dates & Calendars
```bash
npm install date-fns react-day-picker
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/resource-timeline @fullcalendar/interaction
```
- `date-fns` — date utilities
- `react-day-picker` — user-facing date range picker
- `@fullcalendar/*` — admin master calendar

---

### Animation
```bash
npm install framer-motion gsap lenis lottie-react react-intersection-observer
```
- `framer-motion` — React animations
- `gsap` — scroll animations, timelines (ScrollTrigger is built in)
- `lenis` — smooth scroll
- `lottie-react` — vector animations
- `react-intersection-observer` — trigger on viewport

---

### Charts
```bash
npm install recharts
```
- `recharts` — admin analytics

---

### UI Components (shadcn/ui)
```bash
# Initialize
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button card dialog input label select
npx shadcn@latest add calendar popover form toast dropdown-menu
npx shadcn@latest add table tabs sheet separator badge avatar
npx shadcn@latest add skeleton sonner alert-dialog command
npx shadcn@latest add navigation-menu scroll-area tooltip
```

Dependencies added automatically:
- `@radix-ui/*` — primitives
- `lucide-react` — icons
- `clsx`, `tailwind-merge`, `class-variance-authority`

---

### Theming
```bash
npm install next-themes
```

---

### Email
```bash
npm install resend react-email @react-email/components
```
- `resend` — email delivery API
- `react-email` + `@react-email/components` — JSX templates

---

### Image Handling
```bash
npm install cloudinary next-cloudinary sharp
```
- `cloudinary` — Node SDK (uploads from admin)
- `next-cloudinary` — `<CldImage>` component
- `sharp` — image optimization (required by `next/image` in production)

---

### Developer Tools
```bash
npm install -D \
  eslint-config-next \
  prettier prettier-plugin-tailwindcss \
  husky lint-staged
```

Set up Husky:
```bash
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 🔑 CLI Tools Used

| Command | Purpose |
|---------|---------|
| `npx prisma db push` | Sync schema to MongoDB |
| `npx prisma studio` | GUI for DB |
| `npx prisma db seed` | Seed 9 rooms |
| `npx shadcn@latest add <comp>` | Add UI components |
| `npx tsx prisma/seed.ts` | Run seed script directly |
| `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | Local Stripe webhooks |

---

## 📝 Optional Packages (Nice-to-Haves)

```bash
# Virtual tours (360° images)
npm install marzipano

# PDF invoice generation
npm install @react-pdf/renderer

# WhatsApp integration
npm install twilio

# Multi-language
npm install next-intl

# Rich text editor for admin (room descriptions)
npm install @tiptap/react @tiptap/starter-kit

# Image lightbox for room galleries
npm install yet-another-react-lightbox
```

---

## 🧪 Testing (Optional but Recommended)

```bash
npm install -D \
  vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom \
  playwright
```

---

## 📌 Version Lock Recommendation

Use these versions to avoid surprises (as of 2026):

```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "typescript": "^5.4.0",
  "tailwindcss": "^3.4.0",
  "prisma": "^5.14.0",
  "next-auth": "5.0.0-beta.19",
  "framer-motion": "^11.2.0",
  "gsap": "^3.12.5"
}
```
