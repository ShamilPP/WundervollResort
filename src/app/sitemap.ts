import type { MetadataRoute } from 'next'

import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const rooms = await prisma.room
    .findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
    .catch(() => [])

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/rooms`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/amenities`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/gallery`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const roomUrls: MetadataRoute.Sitemap = rooms.map((r) => ({
    url: `${base}/rooms/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticUrls, ...roomUrls]
}
