'use client'

import { useState } from 'react'
import type { RoomImage } from '@prisma/client'
import { cn } from '@/lib/utils'

export function RoomGallery({ images, slug }: { images: RoomImage[]; slug: string }) {
  const urls =
    images.length > 0
      ? images.map((i) => i.url)
      : placeholdersFor(slug, 4)
  const [active, setActive] = useState(0)

  return (
    <div className="grid gap-3 md:grid-cols-5">
      <div
        className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-cover bg-center md:col-span-5"
        style={{ backgroundImage: `url('${urls[active]}')` }}
      />
      <div className="col-span-5 flex gap-2 overflow-x-auto">
        {urls.map((u, i) => (
          <button
            key={u + i}
            onClick={() => setActive(i)}
            className={cn(
              'h-20 w-28 flex-shrink-0 overflow-hidden rounded-md border bg-cover bg-center transition',
              i === active ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100',
            )}
            style={{ backgroundImage: `url('${u}')` }}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function placeholdersFor(slug: string, n: number) {
  const base = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return Array.from({ length: n }, (_, i) =>
    `https://picsum.photos/seed/${base + i}/1200/900`,
  )
}
