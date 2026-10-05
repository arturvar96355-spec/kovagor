import { Hero } from '@/components/sections/hero'
import { Manifesto } from '@/components/sections/manifesto'

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <section id="contact" className="container-x border-t border-line py-[20vh]">
        <h2 className="font-display text-6xl">Контакты — скоро</h2>
      </section>
    </main>
  )
}
