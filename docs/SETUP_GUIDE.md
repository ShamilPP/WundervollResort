# 🚀 Local Setup Guide

Step-by-step instructions to get **Wundervoll Resort** running on your machine.

---

## ✅ Prerequisites

Install these before starting:

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | 20 LTS or higher | `node -v` |
| **npm** | 10+ | `npm -v` |
| **Git** | Any recent | `git --version` |
| **MongoDB** | Atlas account *or* Docker with replica set | see step 2 |
| **Stripe CLI** | Latest | `stripe --version` |

Install links:
- Node.js: [nodejs.org](https://nodejs.org)
- MongoDB Atlas: [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register) (recommended)
- Docker: [docker.com](https://docker.com) (if running MongoDB locally)
- Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

Recommended editor: **VS Code** with extensions listed in [`TECH_STACK.md`](./TECH_STACK.md).

---

## 1️⃣ Clone & Install

```bash
# Clone the repository
git clone <your-repo-url> wundervoll-resort
cd wundervoll-resort

# Install all dependencies
npm install
```

If you see peer dependency warnings from `next-auth@beta`, that's expected — continue.

---

## 2️⃣ Set Up the Database

### Option A — MongoDB Atlas (recommended, free, transactions work)

1. Sign up at [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)
2. Create a new project → name it `wundervoll`
3. Build a database → choose **M0 Free** tier
4. Region: **Mumbai `ap-south-1`** (closest to Kerala)
5. Database Access → Add New User (remember the password!)
6. Network Access → Add IP Address → `0.0.0.0/0` (dev only — tighten in prod)
7. Connect → Drivers → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Add database name `wundervoll` before the `?`:
   ```
   mongodb+srv://admin:MyPass@cluster0.xxxxx.mongodb.net/wundervoll?retryWrites=true&w=majority
   ```

### Option B — Docker with replica set (local dev, transactions work)

Plain `mongod` doesn't support Prisma transactions — you need a replica set:

```bash
# Start MongoDB as a single-node replica set
docker run -d --name wundervoll-mongo -p 27017:27017 \
  mongo:7 --replSet rs0 --bind_ip_all

# Wait 5 seconds for startup, then initialize the replica set (one-time)
sleep 5
docker exec wundervoll-mongo mongosh --eval "rs.initiate()"
```

Connection string:
```
mongodb://localhost:27017/wundervoll?replicaSet=rs0&directConnection=true
```

### Option C — Local `mongod` (no transactions, limited)

If you install MongoDB natively (e.g. `brew install mongodb-community`), you can still develop, but **booking race-condition protection won't work** because Prisma transactions require a replica set. Use this only for quick testing, not final dev.

```bash
brew services start mongodb-community
# URL: mongodb://localhost:27017/wundervoll
```

---

## 3️⃣ Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in **at minimum** these values to start:

```bash
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PAYMENT_MODE="demo"   # Start in demo mode, switch to stripe later
```

For **full functionality**, also add Stripe, Cloudinary, Resend, and Google OAuth keys. See [`ENV_VARIABLES.md`](./ENV_VARIABLES.md) for how to obtain each.

> 💡 **Tip**: Start in demo payment mode — you can complete the full booking flow without ever touching Stripe.

---

## 4️⃣ Push Schema to MongoDB

MongoDB doesn't need migration files — just push the schema:

```bash
# Generate the Prisma client
npx prisma generate

# Push schema to the database
npx prisma db push

# Seed the database with 9 rooms + admin user
npx prisma db seed
```

You should see:
```
✅ Seeded 9 rooms and admin user
```

Open Prisma Studio to verify:
```bash
npx prisma studio
```
Opens at `http://localhost:5555`. You should see 9 rows in the `Room` collection.

**Default admin credentials:**
- Email: `admin@wundervoll.com`
- Password: `admin123`

> ⚠️ Change this password immediately in production.

---

## 5️⃣ Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page.

Visit:
- `/rooms` — see the 9 rooms
- `/login` — sign in as admin → `/admin`

---

## 6️⃣ Set Up Stripe (Optional but Recommended)

### Get API keys
1. Sign up at [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys (make sure you're in **Test mode**)
3. Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_KEY`
4. Copy `Secret key` → `STRIPE_SECRET_KEY`

### Forward webhooks to localhost
Open a **second terminal** and run:
```bash
stripe login    # one-time
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see something like:
```
Ready! Your webhook signing secret is whsec_abc123...
```

Copy that to `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart dev server.

### Switch from demo to Stripe
```bash
NEXT_PUBLIC_PAYMENT_MODE="stripe"
```

### Test payments
Use card: `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.

---

## 7️⃣ Set Up Cloudinary (for image uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Go to Settings → Upload → Add unsigned upload preset
   - Name: `wundervoll_rooms`
   - Mode: Unsigned
4. Add keys to `.env.local`

Without Cloudinary, you can manually add room images via Prisma Studio (paste any URL).

---

## 8️⃣ Set Up Resend (for emails)

1. Sign up at [resend.com](https://resend.com)
2. Add an API key
3. Verify a sending domain (or use `onboarding@resend.dev` for testing)
4. Add to `.env.local`

Without Resend, emails are skipped but bookings still work.

---

## 📁 Folder Check

After setup, you should have:

```
wundervoll-resort/
├── .env.local          ✓ (created)
├── node_modules/        ✓ (npm install)
├── prisma/
│   └── schema.prisma    ✓ (no migrations/ folder with MongoDB)
├── src/
└── package.json
```

---

## 🧪 Verify Everything Works

Run through this checklist after setup:

- [ ] `npm run dev` starts without errors
- [ ] Landing page loads with animations
- [ ] `/rooms` shows 9 room cards
- [ ] `/rooms/ocean-breeze-villa` loads a detail page
- [ ] Login as admin → can access `/admin`
- [ ] Create a test booking as a guest
- [ ] Demo-approve the payment → booking becomes CONFIRMED
- [ ] If Stripe set up: test card `4242 4242 4242 4242` completes payment
- [ ] Admin sees new booking in `/admin/bookings`

---

## 🐛 Troubleshooting

### `Error: Environment variable not found: DATABASE_URL`
Make sure `.env.local` exists and contains `DATABASE_URL`. Restart dev server after editing `.env`.

### `P1001: Can't reach database server`
- Atlas: check connection string, make sure `0.0.0.0/0` is in Network Access, URL-encode special chars in password
- Docker: check container is running (`docker ps`), and replica set was initiated

### `Transaction numbers are only allowed on a replica set`
Your MongoDB isn't running as a replica set. Use Atlas (default) or Docker with `--replSet rs0`. See setup step 2.

### `Module not found: Can't resolve '@/lib/db'`
Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Prisma Client out of sync
```bash
npx prisma generate
```

### Schema conflicts / want to start over
```bash
# Wipe and re-push
npx prisma db push --force-reset
npx prisma db seed
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Stripe webhook fires but booking stays PENDING
- Check `stripe listen` is running
- Check `STRIPE_WEBHOOK_SECRET` matches what `stripe listen` printed
- Check the webhook endpoint URL is correct

### Images not uploading to Cloudinary
- Verify the upload preset is `Unsigned` mode
- Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` matches dashboard

### "Cannot find module 'next-auth'"
This package requires `@beta`:
```bash
npm install next-auth@beta @auth/prisma-adapter
```

---

## 🧹 Useful Dev Commands

```bash
# Run dev server
npm run dev

# Build for production (test locally)
npm run build
npm start

# Linting
npm run lint
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Format all files
npx prettier --write .

# Prisma
npx prisma studio              # DB GUI
npx prisma db push             # Apply schema changes
npx prisma db push --force-reset  # Wipe + re-apply
npx prisma db seed             # Re-seed
npx prisma generate            # Regenerate client

# shadcn/ui
npx shadcn@latest add <component>

# Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🎯 Next Steps

Once setup is complete:

1. Read [`DEVELOPMENT_PHASES.md`](./DEVELOPMENT_PHASES.md) for what to build first
2. Customize the hero video in `/public/videos/hero-loop.mp4`
3. Replace placeholder room images with real photos via admin panel
4. Follow the phased roadmap
5. When ready: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 📞 Getting Help

- Prisma docs: [prisma.io/docs](https://prisma.io/docs)
- Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
- NextAuth docs: [authjs.dev](https://authjs.dev)
- Stripe docs: [stripe.com/docs](https://stripe.com/docs)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com)
