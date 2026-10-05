import type { MetadataRoute } from 'next'
import { projects } from '@/content/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru'
  const pages = ['', '/about', '/motion', '/privacy', '/consent', '/cookies', '/offer', ...projects.map((p) => `/work/${p.slug}`)]
  return pages.map((p) => ({ url: `${base}${p}` }))
}
