# ✨ Features

Complete feature breakdown for **Wundervoll Resort** — both guest-facing and admin-facing.

---

## 👤 Guest-Facing Features

### 🏠 Landing Page
- Cinematic hero video loop with smooth text reveals
- Custom animated cursor on desktop
- Scroll-triggered section animations
- Horizontal scrolling intro section
- Featured rooms carousel with 3D tilt cards
- Amenities grid with Lottie icons
- Testimonial carousel
- Sticky booking CTA that morphs into date picker
- Animated SVG loading screen with resort name
- Fully responsive (mobile-first)
- Dark accent color palette with premium typography

### 🏨 Rooms Browsing
- Grid of all 9 rooms with:
  - Primary photo, name, price/night
  - Feature badges (Beachside View, Private Pool, etc.)
  - "View Details" CTA
- **Filters**: view type, price range, max guests, bed type
- **Sort**: by price (low/high), popularity, size
- Smooth page transitions

### 🏖️ Room Detail Page
- Full-screen image gallery with lightbox
- Detailed description
- Complete feature list with icons
- Amenities included
- **Live availability calendar** showing:
  - 🟢 Available dates
  - 🔴 Booked dates (unclickable)
  - ⚫ Admin-blocked dates
  - Hover shows price per night
- Date range picker — click to check in, click to check out
- Live price calculation as dates change
- Guest count selector
- "Book Now" CTA opens booking flow
- Reviews section (if enabled)

### 📅 Availability Calendar (Guest View)
- Month-view calendar per room
- Visual date states:
  - Available (green accent)
  - Booked (struck through, disabled)
  - Blocked (gray, disabled)
  - Selected range (filled background)
- Prices shown per date on hover
- Minimum stay enforcement (e.g., 2 nights)
- Supports seasonal pricing display

### 📝 Booking Flow
1. **Room + Dates** (from room page)
2. **Sign in or Sign up** (if not logged in)
3. **Guest Details**: name, email, phone, special requests
4. **Review Summary**: dates, nights, subtotal, taxes, total
5. **Payment**:
   - Stripe test mode (real-feeling flow)
   - OR "Demo Approve" button for instant approval
6. **Confirmation**: success page with booking code + email

### 🔐 Authentication
- Email + password signup
- Google OAuth login
- Forgot password flow
- Email verification (optional)
- Session persistence

### 📊 User Dashboard
- **My Bookings** list:
  - Upcoming, past, cancelled tabs
  - Status badges
  - Click to see details
- **Booking Detail**: invoice, cancellation option
- **Profile**: update name, phone, password
- Cancel booking (with policy enforcement)
- Download invoice/receipt PDF (optional)

### 📧 Email Notifications
- Booking confirmation (with calendar `.ics` attachment)
- Payment receipt
- Booking cancelled
- Booking reminder (24 hours before check-in)
- Admin gets notified of new bookings

---

## 🛠️ Admin Panel Features

### 📊 Dashboard
- KPI cards at top:
  - Today's check-ins / check-outs
  - Occupancy % (today / this week / this month)
  - Revenue (this month)
  - Pending bookings count
- Recent bookings list (last 10)
- Revenue chart (last 30 days)
- Occupancy chart (last 30 days)

### 🏨 Room Management
- List all rooms in a table (name, type, price, active status, bookings count)
- **Create Room**:
  - Name, slug, type, description
  - Feature checkboxes
  - Capacity, bed type, size
  - Base price + weekend price
  - Multiple image upload (drag-drop) via Cloudinary
  - Set primary photo
  - Active toggle
- **Edit Room**: all fields editable
- **Delete Room**: soft delete or hard delete with confirmation
- **Reorder**: drag to change display order on landing page

### 📅 Booking Management
- Full data table with:
  - Booking code, guest, room, check-in/out, status, amount
- **Filters**: status, room, date range, search by guest name/email
- **Sort**: by date, amount
- Click row → booking detail sheet:
  - Full guest info
  - Dates, nights, price breakdown
  - Payment details
  - Actions: Confirm, Check-in, Check-out, Cancel, Refund
- **Export**: CSV download of filtered bookings
- Create manual booking (for phone bookings)

### 🗓️ Master Calendar
- Gantt-style view: rooms as rows, dates as columns
- Color-coded cells:
  - Blue = confirmed booking
  - Yellow = pending
  - Red = cancelled
  - Gray = blocked
  - White = available
- Click a booking cell → details
- Click empty cell → quick actions (block / add booking)
- Switch views: week / month / 3-month

### 🚫 Availability Management
- Block date ranges per room
  - Reason: "Maintenance", "Private Event", "Deep Clean"
- Set seasonal pricing:
  - Name: "Christmas Week"
  - Date range + override price
- List of all active blocks and seasonal prices
- Delete blocks/prices anytime

### 👥 User Management
- List all guests
- Search by email/name
- View a guest's booking history
- Change role (promote to admin)
- Ban/suspend account

### 📈 Analytics
- **Revenue chart**: daily/weekly/monthly
- **Bookings trend**: line chart
- **Popular rooms**: pie chart
- **Lead time**: average days between booking and check-in
- **Average stay length**
- **Cancellation rate**
- **Occupancy heatmap**: which dates are most booked

### ⚙️ Settings
- Site toggles (maintenance mode, enable/disable payments)
- Demo payment toggle
- Tax rate configuration
- Minimum stay nights
- Cancellation policy text
- Homepage hero content (editable)
- Contact info

### 🔒 Security Features
- Admin-only routes (middleware protection)
- Role verification on every API call
- Rate limiting on login
- CSRF protection (NextAuth default)
- Input validation with zod (everywhere)
- Stripe webhook signature verification

---

## 🎨 UX Details

- **Loading states**: skeleton loaders, never blank screens
- **Optimistic UI**: booking shows immediately, confirms on server response
- **Toast notifications** for every user action
- **Error boundaries**: friendly error pages, never raw stack traces
- **Empty states**: helpful illustrations when no data
- **Form validation**: inline errors, clear messaging
- **Accessibility**: keyboard navigation, ARIA labels, color contrast

---

## 🌐 SEO & Performance

- Dynamic meta tags per room page
- Open Graph images auto-generated
- Sitemap.xml
- Robots.txt
- Schema.org markup for hotel/room
- Image lazy loading via `next/image`
- Code splitting per route
- Lighthouse score target: 90+ on all metrics

---

## 🔮 Future Enhancements (Phase 2)

- Multi-language: English, Malayalam, Hindi, German
- Loyalty program / repeat guest discounts
- Gift cards
- Restaurant reservations
- Spa bookings
- Virtual 360° room tours
- Live chat / WhatsApp concierge
- AI chatbot powered by Claude API
- Airbnb / Booking.com channel sync
- Mobile app (React Native)
