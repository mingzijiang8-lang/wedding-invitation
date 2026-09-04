import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  page: string
  title: string
  children: ReactNode
  className?: string
}

/** 每个"版面"的外框：页码 + 栏目名 + 分栏线 */
export function Section({ page, title, children, className = '' }: Props) {
  return (
    <motion.section
      className={`px-5 pt-10 pb-4 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="rule-double mb-5 flex items-baseline justify-between pt-2">
        <span className="font-mono text-[10px] tracking-[0.3em] text-ink-faint uppercase">{page}</span>
        <h2 className="font-serif text-[15px] font-semibold tracking-[0.35em]">{title}</h2>
      </header>
      {children}
    </motion.section>
  )
}

export function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">{children}</p>
}

export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`rule border-t ${className}`} />
}
