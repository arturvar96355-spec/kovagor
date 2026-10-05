import { Header } from '@/components/layout-header'
import { GlobalScene } from '@/components/three/global-scene'
import { Hero } from '@/components/sections/hero'
import { Manifesto } from '@/components/sections/manifesto'
import { Marquee } from '@/components/motion/marquee'
import { Services } from '@/components/sections/services'
import { Work } from '@/components/sections/work'
import { Process } from '@/components/sections/process'
import { Pricing } from '@/components/sections/pricing'
import { Faq } from '@/components/sections/faq'
import { Footer } from '@/components/footer'
import { Contact } from '@/components/sections/contact'

export default function Home() {
  return (
    <>
      <Header />
      <GlobalScene />
      <main id="top">
        <Hero />
        <Manifesto />
        <Marquee items={['Сайты', 'Анимации', 'Брендинг', 'Запуск']} />
        <Services />
        <Process />
        <Pricing />
        <Work />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
