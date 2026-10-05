'use client'

import { motion } from 'motion/react'

/** Плавное появление страницы при навигации (template пересоздаётся на каждый переход). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}
