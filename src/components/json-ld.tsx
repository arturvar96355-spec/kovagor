import { faq } from '@/content/faq'
import { tariffs } from '@/content/tariffs'

/** Структурированные данные для поисковиков: организация с прайсом и FAQ. Только подтверждённые факты (без адреса, телефона, рейтингов). */
export function JsonLd({ siteUrl }: { siteUrl: string }) {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'KOVAGOR',
      url: siteUrl,
      logo: `${siteUrl}/brand/monogram.png`,
      description: 'Студия сайтов под ключ: дизайн, анимации, разработка и запуск.',
      makesOffer: tariffs.map((t) => ({
        '@type': 'Offer',
        name: t.name,
        priceSpecification: { '@type': 'PriceSpecification', minPrice: t.from, priceCurrency: 'RUB' },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
