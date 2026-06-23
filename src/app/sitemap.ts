import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts = []
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    })
  } catch (e) {
    // ignore
  }

  const newsUrls = posts.map((post) => ({
    url: `https://layucateca.com/news/${post.slug}`,
    lastModified: post.createdAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const staticUrls = [
    '',
    '/news',
    '/portfolio',
    '/about',
    '/contact',
    '/soluciones-digitales',
    '/citizen-report',
    '/mercadito',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `https://layucateca.com${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...staticUrls, ...newsUrls]
}
