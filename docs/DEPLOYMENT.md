# 🌐 Production Deployment

Complete guide to ship **Wundervoll Resort** to production.

**Target stack**: Vercel (hosting) + MongoDB Atlas (database) + Cloudinary + Resend + Stripe.

---

## 🏁 Pre-Deployment Checklist

Before you deploy, make sure:

- [ ] All features work locally end-to-end
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` reports no type errors
- [ ] All env vars documented in `.env.example`
- [ ] Removed all `console.log` from production code
- [ ] Lighthouse score > 85 on all metrics
- [ ] Tested on mobile + desktop
- [ ] Have a domain purchased (e.g. `wundervoll.com`)

---

## 1️⃣ Create Production Database (MongoDB Atlas)

1. Sign up at [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)
2. Create a project → name: `wundervoll-production`
3. Build a database:
   - **Free M0** is fine to start (512 MB, shared)
   - For real traffic, upgrade to **M10** (~$60/mo, dedicated, backups)
4. Region: **Mumbai `ap-south-1`** (closest to Kerala + Vercel's Asia regions)
5. Database Access → Add User (strong password)
6. Network Access:
   - For testing: `0.0.0.0/0`
   - For production: whitelist Vercel's IPs, or better — use **Atlas Private Endpoint** (paid tiers)
   - Or enable Vercel's Atlas integration
7. Connect → Drivers → copy the connection string
8. Add DB name `/wundervoll`:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/wundervoll?retryWrites=true&w=majority
   ```

> ✅ Atlas clusters are always replica sets, so Prisma transactions work out of the box — critical for race-safe booking creation.

---

## 2️⃣ Deploy to Vercel

### Initial deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repo
4. Framework: **Next.js** (auto-detected)
5. Root directory: `./`
6. **DON'T deploy yet** — first add env vars (next step)

### Add environment variables

In Vercel project settings → Environment Variables, add **every** var from your `.env.local`, but with production values:

```bash
DATABASE_URL=<MongoDB Atlas connection string>
NEXTAUTH_URL=https://wundervoll.com
NEXTAUTH_SECRET=<new production secret>
NEXT_PUBLIC_APP_URL=https://wundervoll.com
NEXT_PUBLIC_PAYMENT_MODE=stripe

STRIPE_SECRET_KEY=<production or test>
NEXT_PUBLIC_STRIPE_KEY=<production or test>
STRIPE_WEBHOOK_SECRET=<will get this in step 4>

GOOGLE_CLIENT_ID=<production OAuth>
GOOGLE_CLIENT_SECRET=<production OAuth>

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

RESEND_API_KEY=...
EMAIL_FROM=Wundervoll Resort <bookings@wundervoll.com>
ADMIN_EMAIL=admin@wundervoll.com

CRON_SECRET=<generate new: openssl rand -hex 32>
```

> ⚠️ Generate a **new** `NEXTAUTH_SECRET` for production — do not reuse your local one.

### Set build command (if needed)

Vercel dashboard → Settings → Build & Development Settings:
```
Build Command:     npm run build
Install Command:   npm install
Output Directory:  .next
```

### Add a post-install step for Prisma

In `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma db push --accept-data-loss && next build"
  }
}
```

This ensures:
- Prisma client is generated on Vercel
- Schema is synced to MongoDB on every deploy

> ⚠️ `--accept-data-loss` is safe for additive changes but will drop fields you've removed from the schema. For any destructive change, run `prisma db push` manually against production first and review the diff.

### Deploy

Click **Deploy**. Wait 2–4 minutes. You should get a `*.vercel.app` URL.

Visit it → should show the landing page.

---

## 3️⃣ Set Up Custom Domain

### Buy a domain
Use Namecheap, Cloudflare, or Google Domains. Example: `wundervoll.com`.

### Connect to Vercel

1. Vercel dashboard → Project → Settings → Domains
2. Add `wundervoll.com` and `www.wundervoll.com`
3. Vercel shows you DNS records to add

### Add DNS records at your registrar

For apex domain (`wundervoll.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

For `www`:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Wait for propagation (5 min – 24 hr)

Check with:
```bash
dig wundervoll.com
```

Vercel auto-provisions SSL certificates. You'll see ✓ Valid Configuration when ready.

### Update env vars
After domain is live, update in Vercel:
```
NEXTAUTH_URL=https://wundervoll.com
NEXT_PUBLIC_APP_URL=https://wundervoll.com
```

Trigger a redeploy.

---

## 4️⃣ Configure Stripe Production Webhooks

### Stripe Dashboard → Webhooks

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://wundervoll.com/api/webhooks/stripe`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the "Signing secret" (`whsec_...`)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel env vars
8. Redeploy

### Test the webhook

In Stripe dashboard, use "Send test webhook" — you should see a 200 response from your endpoint.

### Switch to live Stripe keys (when ready)

1. Complete Stripe's business verification
2. Switch dashboard to **Live mode**
3. Copy live `pk_live_*` and `sk_live_*` keys
4. Update Vercel env vars
5. Create a new webhook endpoint in Live mode
6. Redeploy

---

## 5️⃣ Configure Vercel Cron (Pending Booking Cleanup)

Create `vercel.json` at project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Push to GitHub → auto-deploys → Cron will run every 5 minutes.

Vercel Cron automatically sends requests with `Authorization: Bearer <CRON_SECRET>` header, which your endpoint should verify.

> 💡 Vercel Cron is only available on **Pro** plan for schedules more frequent than daily. Free plan supports daily-only. Alternative: use [cron-job.org](https://cron-job.org) for free.

---

## 6️⃣ Configure Google OAuth for Production

1. [Google Cloud Console](https://console.cloud.google.com) → Credentials
2. Edit your OAuth Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://wundervoll.com`
4. Add to **Authorized redirect URIs**:
   - `https://wundervoll.com/api/auth/callback/google`
5. Save

---

## 7️⃣ Configure Resend for Production

### Verify your domain

1. Resend dashboard → Domains → Add domain → `wundervoll.com`
2. Add the DNS records Resend shows you:
   - SPF (TXT)
   - DKIM (TXT)
   - DMARC (TXT, optional but recommended)
3. Wait for verification (a few minutes)

### Update FROM address
```
EMAIL_FROM=Wundervoll Resort <bookings@wundervoll.com>
```

Test by sending a booking confirmation to yourself.

---

## 8️⃣ Configure Cloudinary for Production

Same account works, but:

1. Go to Settings → Upload presets
2. Make sure `wundervoll_rooms` has:
   - Allowed formats: jpg, png, webp
   - Max file size: 10 MB
   - Folder: `wundervoll/rooms`
3. Consider enabling "Auto optimize" and "Auto format"

---

## 9️⃣ Seed Production Database

Push schema + seed once against production:

**Option A — from local with production URL**:
```bash
DATABASE_URL="<production-mongodb-url>" npx prisma db push
DATABASE_URL="<production-mongodb-url>" npx prisma db seed
```

**Option B — Vercel CLI**:
```bash
vercel env pull .env.production.local
npx prisma db push
npx prisma db seed
```

⚠️ **Change the admin password immediately** after seeding. Open Prisma Studio against production and update, or run a one-off script with a bcrypt-hashed new password.

---

## 🔟 Set Up Monitoring

### Vercel Analytics
Already included. Enable in project settings → Analytics.

### Error Tracking — Sentry (optional)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```
Add `SENTRY_DSN` to env vars.

### Uptime monitoring
- [BetterStack](https://betterstack.com) — free tier
- [UptimeRobot](https://uptimerobot.com) — free tier

Monitor:
- `https://wundervoll.com` (home)
- `https://wundervoll.com/api/rooms` (API health)

### Log monitoring
Vercel has built-in logs. For more, use:
- [Axiom](https://axiom.co) — free tier
- [Logtail](https://logtail.com) — free tier

---

## 🔒 Security Hardening

### Next.js config

`next.config.mjs`:
```js
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}
```

### Rate limiting

Use [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview):
```bash
npm install @upstash/ratelimit @upstash/redis
```

Apply to login, signup, booking endpoints.

### Content Security Policy
Add CSP headers if not using inline scripts heavily.

### Backup strategy
- Atlas M10+ includes automated backups with point-in-time restore
- M0 free tier: export weekly via `mongodump` → S3 or Google Drive
- Keep your Prisma schema in Git (this IS your migration history for MongoDB)

---

## 📊 SEO Final Touches

- [ ] Submit sitemap: Google Search Console → `https://wundervoll.com/sitemap.xml`
- [ ] Verify domain ownership (HTML tag or DNS)
- [ ] Set up Google Business Profile
- [ ] Verify with Bing Webmaster Tools
- [ ] Add structured data (hotel schema.org markup)
- [ ] Open Graph images for all key pages
- [ ] Alt text on every image
- [ ] Canonical URLs on duplicate pages

---

## 🚀 Post-Deployment Checklist

After deploying:

- [ ] Home page loads < 2s
- [ ] All 9 rooms visible at `/rooms`
- [ ] Sign up + login works
- [ ] Google OAuth works
- [ ] Create a test booking end-to-end
- [ ] Payment succeeds with real test card
- [ ] Confirmation email received
- [ ] Admin panel accessible
- [ ] Admin can block dates
- [ ] Calendar reflects all states correctly
- [ ] Mobile layout works on real device
- [ ] Lighthouse audit 90+ on performance
- [ ] HTTPS locked (green padlock)
- [ ] Webhook fires on real payment
- [ ] Cron job running (check Vercel dashboard)

---

## 🔄 Ongoing Maintenance

### Weekly
- Review Vercel analytics
- Check error logs
- Review pending bookings

### Monthly
- Review Stripe disputes / refunds
- Check database size (Atlas M0 free tier: 512 MB)
- Update dependencies: `npm outdated`
- Rotate any leaked credentials

### Before going fully live with real payments
- [ ] Complete Stripe business verification
- [ ] Legal: privacy policy, terms of service pages
- [ ] GST / tax compliance (India: register for GST if turnover > ₹20L)
- [ ] PCI DSS compliance (Stripe handles most)
- [ ] GDPR compliance if serving EU
- [ ] Business insurance
- [ ] Customer support channel (email, phone, WhatsApp)

---

## 🆘 Rollback

If a deployment breaks production:

1. Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Fix the issue in a new branch
5. Deploy preview first, test, then merge

Vercel keeps all previous deployments, so rollback is instant.

---

## 💰 Estimated Monthly Costs (Small Resort)

| Service | Free tier | Paid (if needed) |
|---------|-----------|------------------|
| Vercel | Hobby (free) | Pro $20/mo |
| MongoDB Atlas | M0 free (512 MB) | M10 ~$60/mo (dedicated, backups) |
| Cloudinary | 25 GB free | $99/mo |
| Resend | 100/day free, 3000/mo | $20/mo for 50k |
| Stripe | 2% + ₹3 per txn | — |
| Domain | — | ~$12/year |

**Free tier total: ~$12/year** (just domain).

**Small-scale production: ~$80–100/month** (Vercel Pro + Atlas M10 for reliability and automated backups). If you stay on Atlas M0 (free), it's ~$20/month for just Vercel Pro.

---

## 📞 Support Contacts

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **MongoDB Atlas**: [mongodb.com/docs/atlas](https://mongodb.com/docs/atlas)
- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **Cloudinary**: [support.cloudinary.com](https://support.cloudinary.com)
- **Resend**: [resend.com/docs](https://resend.com/docs)

---

## 🎉 You're Live!

Share your URL with the world and start accepting bookings.

Next:
- Monitor usage for the first week
- Gather user feedback
- Iterate based on real bookings
- Consider Phase 2 features from [`FEATURES.md`](./FEATURES.md)
