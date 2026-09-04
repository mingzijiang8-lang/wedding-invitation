import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect } from 'react'

type Props = {
  photos: string[]
  /** 当前索引；为 null 时关闭 */
  index: number | null
  onChange: (index: number) => void
  onClose: () => void
}

/** 手机上的全屏看图：左右滑动切换，点空白处或右上角关闭 */
export function Lightbox({ photos, index, onChange, onClose }: Props) {
  const open = index !== null

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index! < photos.length - 1) onChange(index! + 1)
      if (e.key === 'ArrowLeft' && index! > 0) onChange(index! - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, index, photos.length, onChange, onClose])

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (index === null) return
      const swipe = info.offset.x + info.velocity.x * 0.2
      if (swipe < -60 && index < photos.length - 1) onChange(index + 1)
      else if (swipe > 60 && index > 0) onChange(index - 1)
      else if (Math.abs(info.offset.y) > 120) onClose()
    },
    [index, photos.length, onChange, onClose],
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))] font-mono text-[10px] tracking-[0.25em] text-paper/70">
            <span>
              {index + 1} / {photos.length}
            </span>
            <button type="button" onClick={onClose} aria-label="关闭" className="px-2 py-1 text-[14px] leading-none">
              ✕
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={photos[index]}
                src={photos[index]}
                alt=""
                draggable={false}
                className="max-h-full max-w-full select-none object-contain shadow-2xl"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
                drag
                dragElastic={0.6}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragSnapToOrigin
                onDragEnd={onDragEnd}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
            {photos.map((p, i) => (
              <span key={p} className={`h-1 rounded-full transition-all ${i === index ? 'w-4 bg-paper' : 'w-1 bg-paper/40'}`} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
