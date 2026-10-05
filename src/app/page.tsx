import { Header } from '@/components/layout-header'
import { Hero } from '@/components/sections/hero'
import { Manifesto } from '@/components/sections/manifesto'
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
      <main id="top">
        <Hero />
        <Manifesto />
        <Services />
        <Work />
        <Process />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
