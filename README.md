# Wundervoll Resort

A luxury beachfront resort booking platform. Built with Next.js 14, Prisma, MongoDB, NextAuth v5, Tailwind.

## Status

All 8 phases scaffolded — `next build` passes. See [`BLOCKERS.md`](./BLOCKERS.md) for what's left (MongoDB replica-set, real media, Stripe/Resend/Cloudinary keys, deploy).

Phase breakdown in [`docs/DEVELOPMENT_PHASES.md`](./docs/DEVELOPMENT_PHASES.md).

## Quick start

```bash
# 1. Install deps (runs prisma generate via postinstall)
npm install

# 2. Push schema to your local MongoDB
npm run db:push

# 3. Seed 9 rooms + admin user
npm run db:seed

# 4. Start dev
npm run dev
```

Open http://localhost:3000.

### Default admin
- Email: `admin@wundervoll.com`
- Password: `admin123`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema → MongoDB |
| `npm run db:seed` | Seed 9 rooms + admin |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:reset` | Wipe DB, re-push schema, re-seed |

## Env

See [`.env.example`](./.env.example). `.env.local` is created with working defaults for local `mongod`.

> ⚠️ Standalone `mongod` doesn't support Prisma transactions — Phase 5 (booking creation) will need Atlas or a Docker replica-set.

## Docs

Full architecture in [`docs/`](./docs/).

edit from authour
edit from authour
edit from authour
