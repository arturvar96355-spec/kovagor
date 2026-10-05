import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout-header'
import { Footer } from '@/components/footer'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Lab } from '@/components/lab/lab'

export const metadata: Metadata = {
  title: 'Лаборатория движения — KOVAGOR',
  description: 'Приёмы анимации, из которых собран сайт KOVAGOR: попробуйте руками.',
}

export default function MotionPage() {
  return (
    <>
      <Header />
      <main id="top" className="pt-36">
        <section className="container-x pb-16">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-mute">Лаборатория движения</p>
          <SplitReveal as="h1" immediate className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.98]">
            Приёмы, из которых собран этот сайт
          </SplitReveal>
          <p className="mt-8 max-w-xl text-lg text-ink-2">Девять живых примеров. Всё работает прямо здесь: наводите, тяните, листайте. Если в системе включено «уменьшить движение», анимации отключатся — это проверено.</p>
        </section>
        <section className="container-x pb-[14vh]">
          <Lab />
          <div className="mt-16">
            <Link href="/#contact" data-goal="cta_lab" className="inline-flex rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">
              Хочу такое на своём сайте
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
