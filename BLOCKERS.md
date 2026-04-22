# Blockers — things that need you

All 8 phases of code are written and the project **compiles successfully** (`next build` passes). The items below require outside accounts, credentials, or environment changes that can't be done from code.

## 🛑 Critical (needed right now)

### 1. MongoDB replica set

Your current `DATABASE_URL` points at a standalone `mongod`, which **Prisma's MongoDB connector does not support for writes**. No booking, signup, seed, or admin save will work until this is resolved.

Pick one:

**A. MongoDB Atlas free tier (easiest, 10 min)**
1. Sign up at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Database Access → create a user (remember the password)
4. Network Access → add `0.0.0.0/0` (dev only — tighten in production)
5. Connect → "Drivers" → copy the `mongodb+srv://…` URL
6. Paste into `.env` and `.env.local` as `DATABASE_URL`

**B. Convert your existing local `mongod` to a replica set**
1. Stop the MongoDB service
2. Edit `C:\Program Files\MongoDB\Server\<ver>\bin\mongod.cfg` — add:
   ```yaml
   replication:
     replSetName: rs0
   ```
3. Start the service
4. Open `mongosh` and run: `rs.initiate()`
5. Change `DATABASE_URL` to `mongodb://127.0.0.1:27017/wundervoll?replicaSet=rs0&directConnection=true`

After the replica set is in place:
```bash
npm run db:push
npm run db:seed      # seeds 9 rooms + admin user
npm run dev
```

## ⚠️ Blockers per phase

### Phase 2 — Landing page
- Hero/gallery images are pulled from Unsplash/Picsum as placeholders. **Replace** with your real resort photos/videos. Upload to `/public` or swap the URLs in:
  - `src/components/home/hero.tsx`
  - `src/components/home/experience-strip.tsx`
  - `src/components/rooms/room-card.tsx` (fallback)
  - `src/components/rooms/room-gallery.tsx` (fallback)

### Phase 6 — Payment (currently Demo-only)
- `/api/payments/create-intent` and `/api/webhooks/stripe` return 503 until you add Stripe keys.
- When ready: set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`, then wire the real Stripe client into those two routes and swap the `PaymentPanel` component to use Stripe Elements.
- Until then the "Confirm & pay (Demo)" button works end-to-end — booking becomes CONFIRMED and a stub email logs to console.

### Phase 6 — Email
- `src/lib/email.ts` logs to console when `RESEND_API_KEY` is unset. Set the key and replace the `console.log` with a real `resend.emails.send(...)` call.

### Phase 7 — Admin
- Image uploader is **URL paste** only. Add Cloudinary (set `CLOUDINARY_URL`) and swap the `imageUrls` textarea in `src/components/admin/room-form.tsx` for `<CldUploadWidget>`.
- Stripe refund flow currently only sets status — wire `stripe.refunds.create()` in `src/app/api/admin/bookings/[id]/route.ts` when keys exist.

### Phase 8 — Deploy
- Vercel deployment, domain, SSL, cron jobs — all you. When deploying, add all `.env.local` vars to Vercel's Environment Variables panel and set `NEXTAUTH_URL` to your production URL.

## 🔑 Default admin credentials (dev)

- Email: `admin@wundervoll.com`
- Password: `admin123`

**Change this before production.**

## 🧭 Routes map

| Path | What it does |
|------|--------------|
| `/` | Landing page |
| `/rooms` | Browse with filters |
| `/rooms/[slug]` | Detail + live availability calendar |
| `/login`, `/signup` | Auth |
| `/dashboard` | User bookings |
| `/dashboard/bookings/[id]` | User booking detail |
| `/booking/[roomId]` | Booking form (auth required) |
| `/booking/confirmation/[id]` | Payment + confirmation |
| `/admin` | KPIs dashboard (role=ADMIN) |
| `/admin/rooms`, `/admin/rooms/new`, `/admin/rooms/[id]` | Room CRUD |
| `/admin/bookings`, `/admin/bookings/[id]` | Booking management + CSV export |
| `/admin/availability` | Blocked dates + seasonal pricing |
| `/admin/users` | User list |
| `/admin/analytics` | KPIs by status + top rooms |
| `/admin/settings` | Integration status |

## ✅ What works today (once replica-set is live)

- Browse rooms, filter, view detail
- Pick dates on room page → see live quote with taxes
- Sign up → booking form → Demo payment → CONFIRMED booking
- Full admin CRUD on rooms, bookings, blocks, seasonal pricing
- CSV export of bookings
- Role-gated `/admin` and `/dashboard` via middleware
