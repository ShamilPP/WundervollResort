# ✨ Animations Plan

Detailed animation recipes for the **Wundervoll Resort** landing page and beyond.

Stack: **GSAP + ScrollTrigger** (cinematic scroll), **Framer Motion** (React components), **Lenis** (smooth scroll).

---

## 🎬 0. Page Load — SVG Stroke Reveal

Before the page appears, show a brief branded intro.

```tsx
// components/landing/LoadingScreen.tsx
'use client'
import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.2, duration: 0.6 }}
      onAnimationComplete={() => {/* unmount */}}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
    >
      <svg viewBox="0 0 600 100" className="w-[80%] max-w-2xl">
        <motion.text
          x="50%" y="70" textAnchor="middle"
          fill="none" stroke="#FBF9F5" strokeWidth="1"
          className="font-serif text-7xl"
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 1 }}
          transition={{
            pathLength: { duration: 1.8, ease: 'easeInOut' },
            fillOpacity: { delay: 1.5, duration: 0.6 }
          }}
        >
          WUNDERVOLL
        </motion.text>
      </svg>
    </motion.div>
  )
}
```

---

## 🌊 1. Smooth Scroll (Lenis)

Wrap the entire app in a smooth scroll provider.

```tsx
// components/shared/SmoothScrollProvider.tsx
'use client'
import { ReactLenis } from 'lenis/react'

export function SmoothScrollProvider({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
```

Use in root layout.

---

## 🎥 2. Hero — Parallax Video + Text Reveal

**Effect**: video stays fixed while text splits into words and fades up; as user scrolls, the video pushes up behind the next section.

```tsx
'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.video
        style={{ y }}
        autoPlay muted loop playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero-loop.mp4"
      />
      <div className="absolute inset-0 bg-ink/30" />

      <motion.div style={{ opacity }} className="relative z-10 flex h-full items-center justify-center">
        <h1 className="font-serif text-display-2xl text-cream text-center leading-none">
          {['Where', 'the', 'Ocean', 'Writes', 'Poetry'].map((word, i) => (
            <motion.span
              key={word}
              className="inline-block mx-2"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 2.5 + i * 0.12,
                duration: 1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
      </motion.div>
    </section>
  )
}
```

---

## 🖱️ 3. Custom Cursor

Grows when hovering interactive elements.

```tsx
// components/shared/CustomCursor.tsx
'use client'
import { motion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [hover, setHover] = useState(false)
  const x = useSpring(0, { stiffness: 500, damping: 40 })
  const y = useSpring(0, { stiffness: 500, damping: 40 })

  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 16); y.set(e.clientY - 16) }
    window.addEventListener('mousemove', move)

    const links = document.querySelectorAll('a, button')
    links.forEach(l => {
      l.addEventListener('mouseenter', () => setHover(true))
      l.addEventListener('mouseleave', () => setHover(false))
    })

    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <motion.div
      style={{ x, y }}
      animate={{ scale: hover ? 2.5 : 1, opacity: hover ? 0.3 : 1 }}
      className="pointer-events-none fixed top-0 left-0 z-50 h-8 w-8 rounded-full border border-cream mix-blend-difference"
    />
  )
}
```

Only show on desktop (`useMediaQuery('(pointer: fine)')`).

---

## ➡️ 4. Horizontal Scroll Intro

A section where content scrolls horizontally as you scroll vertically.

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function HorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const container = ref.current
    const track = container.querySelector('.track')
    const distance = track.scrollWidth - window.innerWidth

    gsap.to(track, {
      x: -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${distance}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    })
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="track flex h-screen items-center gap-16 pl-16">
        {panels.map((p) => (
          <div key={p.id} className="shrink-0 w-[80vw] max-w-5xl">
            <img src={p.image} className="h-[70vh] w-full object-cover rounded-lg" />
            <h3 className="mt-6 font-serif text-4xl">{p.title}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## 🃏 5. Featured Rooms — 3D Tilt Cards

```tsx
'use client'
import { motion, useMotionValue, useTransform } from 'framer-motion'

export function RoomCard({ room }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="group relative overflow-hidden rounded-lg"
    >
      <motion.img
        src={room.image}
        style={{ transform: 'translateZ(40px)' }}
        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div style={{ transform: 'translateZ(60px)' }} className="absolute bottom-0 p-6 text-cream">
        <h3 className="font-serif text-2xl">{room.name}</h3>
      </div>
    </motion.div>
  )
}
```

---

## 📜 6. Scroll-Triggered Reveals

Reusable hook for "fade up when entering viewport":

```tsx
// hooks/useScrollAnimation.ts
'use client'
import { useInView } from 'react-intersection-observer'

export function useReveal() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
  return { ref, inView }
}
```

Use with Framer Motion:
```tsx
const { ref, inView } = useReveal()

<motion.div
  ref={ref}
  initial={{ y: 60, opacity: 0 }}
  animate={inView ? { y: 0, opacity: 1 } : {}}
  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
>
  ...
</motion.div>
```

---

## 🖼️ 7. Pinned Image Strip (Experiences)

User scrolls, images change beneath fixed text. Similar to Apple product pages.

```ts
useEffect(() => {
  const sections = gsap.utils.toArray('.experience-panel')

  sections.forEach((panel, i) => {
    gsap.fromTo(panel,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: panel,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        }
      }
    )
  })
}, [])
```

---

## 🔘 8. Morphing Booking CTA

Starts as a button, expands into a date picker when clicked. Uses `layout` animations.

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function BookingCTA() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      layout
      className="fixed bottom-8 right-8 bg-ink text-cream rounded-full overflow-hidden shadow-float"
      style={{ borderRadius: open ? 16 : 9999 }}
    >
      {!open ? (
        <motion.button layout onClick={() => setOpen(true)} className="px-8 py-4">
          Book your stay
        </motion.button>
      ) : (
        <motion.div layout className="p-6 w-80">
          {/* Date picker here */}
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2">×</button>
        </motion.div>
      )}
    </motion.div>
  )
}
```

---

## ✨ 9. Text Mask Image Reveal

Image revealed through letterforms.

```tsx
<h1
  className="font-serif text-[16vw] leading-none bg-clip-text text-transparent"
  style={{ backgroundImage: 'url(/images/ocean.jpg)', backgroundSize: 'cover' }}
>
  WUNDERVOLL
</h1>
```

Animate `backgroundPosition` on scroll for a subtle parallax within letters.

---

## 🎯 10. Number Count-Up (Stats)

```tsx
'use client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export function CountUp({ to }: { to: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, to, { duration: 2, ease: 'easeOut' })
    return controls.stop
  }, [to])

  return <motion.span>{rounded}</motion.span>
}
```

---

## 📋 Animation Audit Checklist

- [ ] Page transitions smooth (< 300ms perceived)
- [ ] No layout shift during animations
- [ ] `prefers-reduced-motion` respected on all animations
- [ ] 60fps on mid-range laptops
- [ ] Animations disabled/simplified on mobile where appropriate
- [ ] No auto-play sound
- [ ] Videos below 3MB with fallback poster
- [ ] Loading screen under 3 seconds
- [ ] Focus never gets lost during route changes

---

## 📱 Mobile Adjustments

| Desktop | Mobile |
|---------|--------|
| Custom cursor | Disabled |
| Horizontal scroll | Vertical scroll instead |
| 3D tilt cards | Simple hover scale |
| Hero parallax | Simpler fade |
| Complex stagger | 2-3 items max |

Wrap heavy animations in:
```tsx
const isDesktop = useMediaQuery('(min-width: 1024px)')
{isDesktop && <HeavyAnimation />}
```

---

## 🎨 Advanced (Optional)

- **WebGL hero** via React Three Fiber for water shader
- **Scroll-driven SVG path morph** (e.g., ocean wave that becomes a building outline)
- **Audio-reactive backgrounds** (ambient beach sounds)
- **Cursor trail particles** via canvas
