import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout-header'
import { Footer } from '@/components/footer'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Reveal } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'О студии — KOVAGOR',
  description: 'KOVAGOR — молодая студия сайтов под ключ: как мы работаем сейчас, что обещаем и чего не обещаем.',
}

// TODO(content): добавить состав команды и фото, когда владелец подтвердит публикацию.
const blocks = [
  {
    title: 'Кто мы',
    text: 'Молодая команда, в которой дизайн, анимации и разработка делаются вместе. Мы только начинаем, поэтому честно говорим об этом и компенсируем вниманием к каждому проекту.',
  },
  {
    title: 'Как мы работаем сейчас',
    text: 'Стартовые цены ниже рыночных: мы набираем портфолио. Взамен просим разрешения показать готовую работу (по согласованию, с вашей правкой текста). Всё фиксируем письменно: состав работ, цену, срок и этапы.',
  },
  {
    title: 'Что мы обещаем',
    text: 'Показывать промежуточный результат на каждом этапе. Отвечать в течение рабочего дня. Передать вам доступы, права по договору и инструкцию. Не добавлять работы и платежи без вашего согласия.',
  },
  {
    title: 'Чего мы не обещаем',
    text: 'Не обещаем «рост продаж в два раза», первое место в поиске или конкретное число заявок: это зависит от вашего продукта и рекламы. Не показываем выдуманных отзывов и логотипов клиентов.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="top" className="pt-36">
        <section className="container-x">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-mute">О студии</p>
          <SplitReveal as="h1" immediate className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.98]">
            Мы только начинаем — и делаем это всерьёз
          </SplitReveal>
        </section>
        <Reveal className="container-x mx-auto grid max-w-6xl gap-px py-[12vh] md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.title} data-stagger className="border-t border-line py-10 md:pr-12">
              <h2 className="font-display text-4xl md:text-5xl">{b.title}</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">{b.text}</p>
            </div>
          ))}
        </Reveal>
        <section className="container-x pb-[14vh]">
          <div className="flex flex-wrap gap-4">
            <Link href="/#contact" data-goal="cta_about" className="rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">Обсудить проект</Link>
            <Link href="/#process" className="rounded-full border border-ink px-9 py-5 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper">Как мы работаем</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
