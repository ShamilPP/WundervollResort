# 🗺️ Pages & URL Routes

Every page/route in the **Wundervoll Resort** app, grouped by area.

---

## 🌐 Public Pages

| URL | File | Purpose |
|-----|------|---------|
| `/` | `app/page.tsx` | Landing page |
| `/rooms` | `app/(public)/rooms/page.tsx` | All rooms grid with filters |
| `/rooms/[slug]` | `app/(public)/rooms/[slug]/page.tsx` | Single room detail |
| `/about` | `app/(public)/about/page.tsx` | About the resort |
| `/amenities` | `app/(public)/amenities/page.tsx` | Spa, pool, dining etc. |
| `/gallery` | `app/(public)/gallery/page.tsx` | Photo gallery |
| `/contact` | `app/(public)/contact/page.tsx` | Contact form + map |

---

## 🔐 Authentication Pages

| URL | File | Purpose |
|-----|------|---------|
| `/login` | `app/(auth)/login/page.tsx` | Email/password + Google OAuth |
| `/signup` | `app/(auth)/signup/page.tsx` | New account |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Reset flow |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Set new password |
| `/verify-email` | `app/(auth)/verify-email/page.tsx` | Verification link target |

---

## 📝 Booking Flow

| URL | File | Purpose |
|-----|------|---------|
| `/booking/[roomId]` | `app/booking/[roomId]/page.tsx` | Booking form (dates, guests, payment) |
| `/booking/confirmation/[id]` | `app/booking/confirmation/[id]/page.tsx` | Success page after payment |

---

## 👤 User Dashboard (requires auth)

| URL | File | Purpose |
|-----|------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Overview |
| `/dashboard/bookings` | `app/dashboard/bookings/page.tsx` | All my bookings (tabs: upcoming/past/cancelled) |
| `/dashboard/bookings/[id]` | `app/dashboard/bookings/[id]/page.tsx` | Booking detail + cancel |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Update personal info |

---

## 🛠️ Admin Panel (requires admin role)

| URL | File | Purpose |
|-----|------|---------|
| `/admin` | `app/admin/page.tsx` | Dashboard with KPIs |
| `/admin/rooms` | `app/admin/rooms/page.tsx` | List all rooms |
| `/admin/rooms/new` | `app/admin/rooms/new/page.tsx` | Create room |
| `/admin/rooms/[id]/edit` | `app/admin/rooms/[id]/edit/page.tsx` | Edit room + photos |
| `/admin/bookings` | `app/admin/bookings/page.tsx` | All bookings table |
| `/admin/bookings/[id]` | `app/admin/bookings/[id]/page.tsx` | Booking detail |
| `/admin/bookings/new` | `app/admin/bookings/new/page.tsx` | Manual booking (phone-in) |
| `/admin/calendar` | `app/admin/calendar/page.tsx` | Master calendar view |
| `/admin/availability` | `app/admin/availability/page.tsx` | Block dates, seasonal prices |
| `/admin/users` | `app/admin/users/page.tsx` | Guest list |
| `/admin/users/[id]` | `app/admin/users/[id]/page.tsx` | User detail |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Charts + exports |
| `/admin/settings` | `app/admin/settings/page.tsx` | Site config |

---

## 🛡️ Route Protection (`middleware.ts`)

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(req) {
  const session = await auth()
  const { pathname } = req.nextUrl

  // /dashboard → requires logged in
  if (pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
  }

  // /admin → requires admin role
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

---

## 🎨 Layouts

| Layout File | Scope | Contains |
|-------------|-------|----------|
| `app/layout.tsx` | Root | `<html>`, providers, fonts, Toaster |
| `app/(public)/layout.tsx` | Public pages | Navbar + Footer |
| `app/dashboard/layout.tsx` | User area | User sidebar/nav |
| `app/admin/layout.tsx` | Admin | Admin sidebar + top bar + role check |

---

## 🔗 Key Link Patterns

```tsx
// Room card → detail
<Link href={`/rooms/${room.slug}`}>

// Room detail → booking
<Link href={`/booking/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}`}>

// Post-payment redirect
router.push(`/booking/confirmation/${booking.id}`)

// Admin → booking detail
<Link href={`/admin/bookings/${booking.id}`}>
```

---

## 📄 Special Pages

| URL | Purpose |
|-----|---------|
| `/loading` | Global loading (built-in) |
| `/error` | Error boundary (built-in) |
| `/not-found` | 404 page |
| `/robots.txt` | Search engine rules |
| `/sitemap.xml` | Auto-generated sitemap |
| `/api/og` | Dynamic OG image generation |

---

## 📱 Mobile Considerations

- Navbar collapses to hamburger menu on `<md`
- Booking CTA becomes bottom bar on mobile
- Admin sidebar becomes drawer on mobile
- Calendar views switch to simpler list on mobile
- Image galleries use swipe gestures
