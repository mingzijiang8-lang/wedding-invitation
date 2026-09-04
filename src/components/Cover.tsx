import { motion } from 'framer-motion'
import { couple, paper, wedding } from '../content'
import { Couple } from '../pixel/Character'

type Props = {
  edition: number
  onOpen: () => void
}

/** 折叠状态的报纸封面。点击后整张"翻开"，同时触发音乐（微信必须由用户手势触发） */
export function Cover({ edition, onOpen }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-paper"
      style={{ transformOrigin: 'top center', perspective: 1200 }}
      initial={{ opacity: 1 }}
      exit={{
        rotateX: -78,
        y: -40,
        opacity: 0,
        transition: { duration: 0.9, ease: [0.7, 0, 0.3, 1] },
      }}
    >
      <div className="flex-1 overflow-hidden px-6 pt-[max(24px,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-ink-faint">
          <span>{paper.volume}</span>
          <span>NO. {String(edition).padStart(3, '0')}</span>
        </div>

        <div className="rule mt-2 border-t border-b py-5 text-center">
          <motion.h1
            className="font-display text-[64px] leading-none tracking-[0.2em]"
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.2em' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            {paper.name}
          </motion.h1>
          <div className="mt-3 font-display text-[11px] tracking-[0.5em] text-ink-soft">
            {paper.nameEn}
          </div>
        </div>

        <div className="mt-10 flex items-stretch gap-6">
          <div className="vertical-text font-serif text-[22px] leading-none text-ink">
            {paper.coverLine}
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div className="text-right">
              <div className="font-mono text-[10px] tracking-[0.3em] text-ink-faint">
                {wedding.dateLabel}
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-ink-faint">
                {wedding.city}
              </div>
            </div>
            <div className="flex justify-end pb-1">
              <Couple height={128} />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="font-serif text-[20px] tracking-[0.3em]">
            {couple.groom}
            <span className="mx-3 text-ink-faint">&amp;</span>
            {couple.bride}
          </div>
          <div className="mt-1 font-display text-[10px] tracking-[0.4em] text-ink-faint">
            {couple.groomEn.toUpperCase()} · {couple.brideEn.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="px-6 pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="rule border-t pt-4 text-center">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-3 border border-ink px-8 py-3 font-serif text-[13px] tracking-[0.35em] active:bg-ink active:text-paper"
          >
            {paper.coverCta}
            <motion.span
              aria-hidden
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </button>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-ink-faint">
            翻开后将播放背景音乐
          </p>
        </div>
      </div>
    </motion.div>
  )
}
