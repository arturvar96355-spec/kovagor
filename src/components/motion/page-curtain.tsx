'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, ease } from '@/lib/animation'

/**
 * Шторка при переходе между страницами: чернильная панель закрывает экран, происходит переход, панель уходит вверх.
 * Работает для обычных внутренних ссылок на другие страницы; якоря на той же странице, новые вкладки и Ctrl/⌘-клики не затрагиваются.
 * При reduced-motion не включается (переход мгновенный).
 */
export function PageCurtain() {
  const router = useRouter()
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const current = useRef(pathname)

  // новая страница отрисована → открываем шторку
  useEffect(() => {
    if (current.current === pathname) return
    current.current = pathname
    if (!busy.current || !panel.current) return
    gsap.to(panel.current, {
      yPercent: -100,
      duration: 0.8,
      ease: ease.inOut,
      delay: 0.15,
      onComplete: () => {
        gsap.set(panel.current, { yPercent: 100 })
        busy.current = false
      },
    })
  }, [pathname])

  useEffect(() => {
    gsap.set(panel.current, { yPercent: 100 })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onClick = (e: MouseEvent) => {
      if (reduced.matches || busy.current || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname) return // якорь/тот же адрес — обычное поведение
      // Слушатель в фазе перехвата стоит раньше обработчика next/link: гасим его, переходом управляем сами
      e.preventDefault()
      e.stopPropagation()
      busy.current = true
      gsap.fromTo(panel.current, { yPercent: 100 }, {
        yPercent: 0,
        duration: 0.6,
        ease: ease.inOut,
        onComplete: () => router.push(url.pathname + url.search + url.hash),
      })
      // страховка: если переход не состоялся, не оставляем экран закрытым
      window.setTimeout(() => {
        if (busy.current && panel.current && current.current === location.pathname && url.pathname !== location.pathname) {
          gsap.to(panel.current, { yPercent: -100, duration: 0.6, onComplete: () => { gsap.set(panel.current, { yPercent: 100 }); busy.current = false } })
        }
      }, 5000)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return <div ref={panel} aria-hidden className="pointer-events-none fixed inset-0 z-[95] bg-ink" style={{ transform: 'translateY(100%)' }} />
}
