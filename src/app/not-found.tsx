import Link from 'next/link'
import { Header } from '@/components/layout-header'
import { Footer } from '@/components/footer'
import { Monogram } from '@/components/brand'

export const metadata = { title: 'Страница не найдена — KOVAGOR' }

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="top" className="container-x relative flex min-h-svh flex-col justify-center overflow-hidden">
        <Monogram className="pointer-events-none absolute right-[-6vw] top-1/2 w-[50vw] max-w-[700px] -translate-y-1/2 text-ink/[0.06]" />
        <p className="mb-6 text-xs uppercase tracking-[0.35em] text-mute">Ошибка 404</p>
        <h1 className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.95]">Такой страницы нет</h1>
        <p className="mt-8 max-w-md text-lg text-ink-2">Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную — там всё найдётся.</p>
        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">
            На главную <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
