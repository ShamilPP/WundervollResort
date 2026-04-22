# 🔐 Environment Variables

All environment variables needed for **Wundervoll Resort**.

Copy `.env.example` to `.env.local` and fill in real values.

---

## 📄 `.env.example`

```bash
# ─────────────────────────────────────
# Database (MongoDB)
# ─────────────────────────────────────
DATABASE_URL="mongodb+srv://user:password@cluster.xxxxx.mongodb.net/wundervoll?retryWrites=true&w=majority"

# ─────────────────────────────────────
# App
# ─────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ─────────────────────────────────────
# NextAuth
# ─────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run_openssl_rand_base64_32_to_generate_this"

# ─────────────────────────────────────
# OAuth (Google)
# ─────────────────────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ─────────────────────────────────────
# Payment — Stripe
# ─────────────────────────────────────
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_PAYMENT_MODE="stripe"  # or "demo"

# ─────────────────────────────────────
# Image — Cloudinary
# ─────────────────────────────────────
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="wundervoll_rooms"

# ─────────────────────────────────────
# Email — Resend
# ─────────────────────────────────────
RESEND_API_KEY="re_..."
EMAIL_FROM="Wundervoll Resort <bookings@wundervoll.com>"
ADMIN_EMAIL="admin@wundervoll.com"

# ─────────────────────────────────────
# Cron Jobs
# ─────────────────────────────────────
CRON_SECRET="another_random_string_for_vercel_cron"

# ─────────────────────────────────────
# Analytics (optional)
# ─────────────────────────────────────
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
```

---

## 🔑 How to Get Each

### `DATABASE_URL`

Use **MongoDB Atlas** (free M0 tier, 512MB):

1. Sign up at [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)
2. Create a new project → name it `wundervoll`
3. Build a database → choose **M0 Free** tier
4. Pick a region close to Kerala (Mumbai `ap-south-1` is ideal)
5. Create a DB user (Database Access → Add New Database User)
6. Allow network access from anywhere (Network Access → Add IP → `0.0.0.0/0`) for dev
   *(tighten this in production to Vercel's IPs or use Atlas Private Endpoint)*
7. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` and add database name `/wundervoll` before the `?`:
   ```
   mongodb+srv://admin:yourpass@cluster0.xxxxx.mongodb.net/wundervoll?retryWrites=true&w=majority
   ```

Or **local MongoDB** via Docker (as a replica set so Prisma transactions work):
```bash
docker run -d --name wundervoll-mongo -p 27017:27017 \
  mongo:7 --replSet rs0 --bind_ip_all

# Initialize replica set (one-time)
docker exec -it wundervoll-mongo mongosh --eval "rs.initiate()"

# URL:
# mongodb://localhost:27017/wundervoll?replicaSet=rs0&directConnection=true
```

> ⚠️ A plain `mongod` without `--replSet` does NOT support transactions, which breaks race-safe booking creation. Always use Atlas or replica-set Docker.

### `NEXTAUTH_SECRET`
Generate once:
```bash
openssl rand -base64 32
```

### `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. APIs & Services → Credentials → Create OAuth Client ID
4. Application type: Web
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### `STRIPE_*`
1. Sign up at [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys (Test mode)
3. Copy `Publishable` → `NEXT_PUBLIC_STRIPE_KEY`
4. Copy `Secret` → `STRIPE_SECRET_KEY`
5. For webhook secret: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   → copy the `whsec_...` it prints

### `CLOUDINARY_*`
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25 GB)
2. Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret
4. Create an unsigned upload preset: Settings → Upload → Add upload preset
   - Mode: Unsigned
   - Name: `wundervoll_rooms`

### `RESEND_API_KEY`
1. Sign up at [resend.com](https://resend.com) (free tier: 100/day)
2. API Keys → Create
3. Verify a domain for `EMAIL_FROM`

### `CRON_SECRET`
Any random string. Used to protect cron endpoints:
```bash
openssl rand -hex 32
```

---

## 🌍 Per-Environment Values

### Local Development (`.env.local`)
- `NEXT_PUBLIC_APP_URL="http://localhost:3000"`
- `NEXTAUTH_URL="http://localhost:3000"`
- Use Stripe test keys
- Use Cloudinary + Resend free tiers

### Production (Vercel)
Set all vars via Vercel dashboard:
- Settings → Environment Variables
- Match each to `Production` scope
- `NEXT_PUBLIC_APP_URL="https://wundervoll.com"`
- `NEXTAUTH_URL="https://wundervoll.com"`
- Use Stripe **test** keys until ready to go live
- Add Vercel Cron in `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/cleanup", "schedule": "*/5 * * * *" }] }
  ```

---

## ✅ Validation

Validate env vars at startup using `zod`:

```ts
// src/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith('mongodb'),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_PAYMENT_MODE: z.enum(['stripe', 'demo']).default('stripe'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
  CRON_SECRET: z.string().min(16),
})

export const env = envSchema.parse(process.env)
```

Import `env` anywhere instead of `process.env` — you'll get typed, validated values.

---

## 🔒 Security Reminders

- ⚠️ **Never** commit `.env.local` (add to `.gitignore`)
- Only `NEXT_PUBLIC_*` vars are exposed to the browser
- Rotate secrets if ever leaked
- Use different keys for development vs production
- Enable Vercel's encrypted environment variables
