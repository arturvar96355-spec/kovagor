'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fmt, type Lead } from './data'

/** Чат менеджера с ботом: новая заявка приходит сообщением, кнопка «Взять в работу» двигает карточку в CRM. */
export function TgView({ leads, take, pay }: { leads: Lead[]; take: (id: number) => void; pay: (id: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const items = leads.filter((l) => l.source !== 'Звонок').sort((a, b) => a.id - b.id)

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' })
  }, [items.length])

  return (
    <div className="grid h-full place-items-center bg-[#dfe7ee] p-3 sm:p-5">
      <div className="flex h-full max-h-[470px] w-full max-w-[330px] flex-col overflow-hidden rounded-[28px] border-[6px] border-ink bg-[#f1f5f8] shadow-xl">
        <div className="flex items-center gap-3 bg-[#2b5278] px-4 py-3 text-white">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-white/20 font-display text-lg">Л</span>
          <div className="leading-tight">
            <p className="text-sm font-medium">Заявки · бот</p>
            <p className="text-[11px] text-white/70">группа менеджеров</p>
          </div>
        </div>
        <div ref={box} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <AnimatePresence initial={false}>
            {items.map((l) => (
              <motion.div key={l.id} layout initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }} className="max-w-[92%]">
                <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2.5 text-[13px] leading-snug text-ink shadow-sm">
                  <p className="font-medium">{l.stage === 'new' ? '🆕' : '📋'} Заявка №{l.id > 100 ? l.id - 100 + 5 : l.id} · {l.source}</p>
                  <p className="mt-1">{l.name} · {l.service}</p>
                  <p className="text-ink-2">{l.slot} · {fmt(l.sum)} ₽</p>
                  <p className="text-ink-2">{l.contact}</p>
                  {l.stage !== 'new' && (
                    <p className="mt-1.5 text-[#2b7a4b]">{l.stage === 'work' ? '✅ В работе у Марины' : '💰 Оплачено'}</p>
                  )}
                </div>
                {l.stage !== 'paid' && (
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={() => (l.stage === 'new' ? take(l.id) : pay(l.id))}
                      className="flex-1 rounded-xl bg-[#2b5278]/90 px-2 py-2 text-xs text-white transition-colors hover:bg-[#2b5278]"
                    >
                      {l.stage === 'new' ? 'Взять в работу' : 'Отметить оплату'}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
