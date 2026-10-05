import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru'
  // NEXT_PUBLIC_NOINDEX=1 — закрыть сайт от поисковиков на время доработки (черновой деплой)
  if (process.env.NEXT_PUBLIC_NOINDEX === '1') return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml` }
}
