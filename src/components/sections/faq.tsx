'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { faq } from '@/content/faq'
import { SectionHead } from '@/components/motion/section-head'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="container-x border-t border-line py-[14vh]">
      <SectionHead index="08" label="FAQ" title="Частые вопросы" />
      <div className="mx-auto max-w-4xl">
        {faq.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="border-b border-line">
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-7 text-left">
                <span className="font-display text-3xl md:text-4xl">{f.q}</span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="text-3xl" aria-hidden>+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                    <p className="max-w-2xl pb-7 text-lg text-ink-2">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
