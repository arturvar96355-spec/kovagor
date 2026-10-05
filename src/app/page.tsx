import { Header } from '@/components/layout-header'
import { ScrollProgress } from '@/components/motion/scroll-progress'
import { GlobalScene } from '@/components/three/global-scene'
import { Hero } from '@/components/sections/hero'
import { Manifesto } from '@/components/sections/manifesto'
import { Marquee } from '@/components/motion/marquee'
import { Services } from '@/components/sections/services'
import { Work } from '@/components/sections/work'
import { Principles } from '@/components/sections/principles'
import { Process } from '@/components/sections/process'
import { Inside } from '@/components/sections/inside'
import { TariffQuiz } from '@/components/sections/tariff-quiz'
import { Pricing } from '@/components/sections/pricing'
import { Faq } from '@/components/sections/faq'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/json-ld'
import { Contact } from '@/components/sections/contact'

export default function Home() {
  return (
    <>
      <JsonLd siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru').replace(/\/$/, '')} />
      <ScrollProgress />
      <Header />
      <GlobalScene />
      <main id="top">
        <Hero />
        <Manifesto />
        <Marquee items={['Сайты', 'Анимации', 'Брендинг', 'Запуск']} />
        <Services />
        <Principles />
        <Process />
        <Inside />
        <TariffQuiz />
        <Pricing />
        <Work />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
