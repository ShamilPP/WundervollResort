# 🎨 Design System

The visual language for **Wundervoll Resort** — colors, typography, spacing, and component patterns.

The brief: *luxury, warm, coastal, timeless*. Think Aman Resorts meets Soneva.

---

## 🎨 Color Palette

### Primary (Warm Earth Tones)

```css
--sand-50:  #FBF7F1   /* Page background */
--sand-100: #F3EBDC
--sand-200: #E6D7BB
--sand-300: #D4BE8E
--sand-400: #B8A068
--sand-500: #9C8450   /* Brand primary */
--sand-600: #7C6940
--sand-700: #5C4E30
--sand-800: #3D3420
--sand-900: #241F13   /* Deep text */
```

### Accent (Ocean)

```css
--ocean-50:  #EEF7F8
--ocean-400: #4A9CA8
--ocean-500: #2E7A87   /* Accent CTA */
--ocean-700: #1E5963
--ocean-900: #0D2E34
```

### Neutrals

```css
--ink:      #0F0F0F   /* Near-black text */
--charcoal: #1F1F1F
--stone:    #6B6660
--mist:     #E8E5E0
--cream:    #FBF9F5
--white:    #FFFFFF
```

### Semantic

```css
--success: #3F8A5C   /* Available date, confirmed */
--warning: #C99A3F   /* Pending */
--danger:  #B94A3B   /* Booked, errors */
--info:    #4A7FA8
```

### Tailwind Config

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      sand: { 50: '#FBF7F1', 100: '#F3EBDC', /* ... */ },
      ocean: { 50: '#EEF7F8', /* ... */ },
      ink: '#0F0F0F',
      cream: '#FBF9F5',
    }
  }
}
```

---

## ✍️ Typography

### Fonts

```tsx
// app/layout.tsx
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
})
```

| Family | Variable | Usage |
|--------|----------|-------|
| **Fraunces** | `font-serif` | Headings, hero text, display |
| **Inter** | `font-sans` | Body, UI, forms |
| *Optional* **Caveat** | `font-script` | Small accents, signatures |

### Scale

| Class | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-display-2xl` | 96px / 6rem | 1.0 | Hero headline |
| `text-display-xl` | 72px | 1.05 | Section hero |
| `text-display-lg` | 60px | 1.1 | Page titles |
| `text-4xl` | 36px | 1.2 | H1 |
| `text-3xl` | 30px | 1.2 | H2 |
| `text-2xl` | 24px | 1.3 | H3 |
| `text-xl` | 20px | 1.4 | H4, card titles |
| `text-lg` | 18px | 1.5 | Lead paragraph |
| `text-base` | 16px | 1.6 | Body |
| `text-sm` | 14px | 1.5 | Meta, captions |
| `text-xs` | 12px | 1.4 | Tags, labels |

### Headings

```tsx
<h1 className="font-serif text-display-xl font-light tracking-tight text-ink">
  Where the Ocean <em className="italic text-ocean-600">Writes Poetry</em>
</h1>
```

Treat headings with low font-weight (300-400) + italic accents for a luxury feel.

---

## 📏 Spacing

Use Tailwind's default scale. Prefer generous whitespace.

Standard section padding:
```tsx
<section className="py-24 md:py-32 lg:py-40">
```

Container:
```tsx
<div className="mx-auto max-w-7xl px-4 md:px-8">
```

---

## 🔲 Border Radius

| Class | Size | Use |
|-------|------|-----|
| `rounded-none` | 0 | Hero images |
| `rounded-sm` | 2px | Tags, small inputs |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 8px | Cards |
| `rounded-xl` | 12px | Modal, larger cards |
| `rounded-full` | 9999px | Avatars, pills |

---

## 🌑 Shadows

Subtle, never harsh.

```css
--shadow-soft:   0 2px 8px rgba(36, 31, 19, 0.04);
--shadow-raised: 0 4px 16px rgba(36, 31, 19, 0.08);
--shadow-lifted: 0 12px 32px rgba(36, 31, 19, 0.10);
--shadow-float:  0 24px 48px rgba(36, 31, 19, 0.12);
```

```tsx
<div className="shadow-[0_4px_16px_rgba(36,31,19,0.08)]">
```

---

## 🖼️ Imagery Guidelines

- **Hero video**: muted, looped, 4K, warm golden-hour tones
- **Room photos**: shot in natural light, no HDR, consistent color grade
- **Aspect ratios**:
  - Hero: `16:9` or full viewport
  - Room cards: `4:5` (portrait)
  - Gallery: mixed (`3:2`, `4:5`)
- Use Cloudinary transformations for different sizes:
  ```
  f_auto,q_auto,w_1200,c_fill
  ```

---

## 🧩 Component Patterns

### Button Variants

```tsx
// Primary — sand/dark
<Button className="bg-ink text-cream hover:bg-charcoal">Book Now</Button>

// Secondary — outline
<Button variant="outline" className="border-ink text-ink hover:bg-ink hover:text-cream">
  Learn More
</Button>

// Ghost — text only
<Button variant="ghost">Cancel</Button>

// Ocean accent
<Button className="bg-ocean-500 hover:bg-ocean-700 text-white">Confirm Payment</Button>
```

### Card

```tsx
<div className="group overflow-hidden rounded-lg bg-cream shadow-soft transition hover:shadow-lifted">
  <div className="aspect-[4/5] overflow-hidden">
    <Image
      src="..."
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />
  </div>
  <div className="p-6">
    <h3 className="font-serif text-2xl">Ocean Breeze Villa</h3>
    <p className="mt-2 text-stone">From ₹18,500 / night</p>
  </div>
</div>
```

### Badge / Feature Tag

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1 text-xs uppercase tracking-wider text-sand-700">
  <Icon className="h-3 w-3" />
  Beachside View
</span>
```

### Input

```tsx
<input className="w-full rounded-md border border-sand-300 bg-cream px-4 py-3 font-sans text-ink placeholder:text-stone focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20" />
```

### Section header

```tsx
<div className="mb-16 text-center">
  <p className="mb-4 text-xs uppercase tracking-[0.3em] text-sand-600">Accommodations</p>
  <h2 className="font-serif text-5xl font-light">Nine ways to arrive home</h2>
</div>
```

---

## 🎭 Motion Principles

- **Ease**: `cubic-bezier(0.22, 1, 0.36, 1)` (custom "ease-out-expo")
- **Durations**:
  - Micro: 150ms (hover)
  - Short: 300ms (tooltips, small UI)
  - Medium: 600ms (section reveals)
  - Long: 1200ms (hero entrances)
- **Stagger children**: 80–120ms between siblings
- Always respect `prefers-reduced-motion`

```ts
// Framer variant
export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}
```

---

## 📐 Grid System

- 12-column grid, 24px gutters on desktop
- 4-column on mobile, 16px gutters

```tsx
<div className="grid grid-cols-4 gap-4 md:grid-cols-12 md:gap-6">
  <div className="col-span-4 md:col-span-8 md:col-start-3">...</div>
</div>
```

---

## 🏷️ Icons

- **Lucide React** as primary set (clean, consistent)
- Sizes: `h-4 w-4`, `h-5 w-5`, `h-6 w-6`
- Stroke width: `1.5` for luxury feel
```tsx
<Palmtree className="h-5 w-5" strokeWidth={1.5} />
```

---

## 🌙 Dark Mode (Admin Only)

- Light by default on public site (luxury aesthetic)
- Admin panel supports dark toggle via `next-themes`
- Invert: sand → charcoal, cream → ink

---

## ♿ Accessibility

- Minimum color contrast: WCAG AA (4.5:1 for body text)
- All interactive elements: focus ring visible
- Semantic HTML everywhere (`<nav>`, `<main>`, `<article>`)
- Alt text on every image
- Form labels always paired with inputs
- Respect `prefers-reduced-motion`

---

## 🎯 Design Inspirations

Look at:
- [aman.com](https://aman.com)
- [soneva.com](https://soneva.com)
- [sixsenses.com](https://sixsenses.com)
- [belmond.com](https://belmond.com)
