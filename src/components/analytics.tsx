'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import {
  CONSENT_EVENT,
  COOKIE_SETTINGS_EVENT,
  YM_ID,
  goal,
  readConsent,
  writeConsent,
  type Consent,
} from '@/lib/analytics'

const enabled = process.env.NODE_ENV === 'production' && Number.isInteger(YM_ID) && YM_ID > 0

/** Скрипт Метрики (без Вебвизора) — рендерится только при согласии. */
function MetrikaScript() {
  const code = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${YM_ID},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`
  return <Script id="yandex-metrika" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: code }} />
}

/** Цели по data-атрибутам: <a data-goal="cta_hero" data-goal-param="studio"> — без привязки кода к каждому компоненту. */
function useGoalClicks(active: boolean) {
  useEffect(() => {
    if (!active) return
    const on = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-goal]')
      if (!el) return
      const param = el.dataset.goalParam
      goal(el.dataset.goal!, param ? { value: param } : undefined)
    }
    document.addEventListener('click', on)
    return () => document.removeEventListener('click', on)
  }, [active])
}

/** Цели «дошёл до секции» — один раз за визит. */
function useReachGoals(active: boolean, pathname: string) {
  useEffect(() => {
    if (!active || pathname !== '/') return
    const targets: Record<string, string> = { pricing: 'reach_pricing', contact: 'reach_contact' }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          goal(targets[e.target.id])
          io.unobserve(e.target)
        }),
      { threshold: 0.35 },
    )
    Object.keys(targets).forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [active, pathname])
}

export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null)
  const [ready, setReady] = useState(false)
  const [asking, setAsking] = useState(false)
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    const sync = () => {
      const c = readConsent()
      setConsent(c)
      setAsking(c === null)
    }
    sync()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage доступен только на клиенте
    setReady(true)
    const reopen = () => setAsking(true)
    window.addEventListener(CONSENT_EVENT, sync)
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen)
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync)
      window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen)
    }
  }, [])

  const active = enabled && consent === 'granted'
  useGoalClicks(active)
  useReachGoals(active, pathname)

  // виртуальные просмотры при переходах между страницами (SPA)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (active && window.ym) window.ym(YM_ID, 'hit', location.href)
  }, [pathname, active])

  if (!ready || !enabled) return null
  return (
    <>
      {active && <MetrikaScript />}
      <AnimatePresence>
        {asking && (
          <motion.div
            role="dialog"
            aria-label="Настройки cookie"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 z-[80] rounded-2xl bg-ink p-5 text-paper shadow-2xl sm:right-auto sm:max-w-sm"
          >
            <p className="text-sm leading-relaxed opacity-80">
              Мы используем cookie и Яндекс.Метрику, чтобы понимать, как работает сайт. Подробнее — в{' '}
              <Link href="/cookies" className="underline underline-offset-4">политике cookie</Link>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => writeConsent('granted')} className="rounded-full bg-paper px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-ink">
                Принять
              </button>
              <button onClick={() => writeConsent('denied')} className="rounded-full border border-paper/30 px-5 py-2.5 text-xs uppercase tracking-[0.15em]">
                Только необходимые
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
