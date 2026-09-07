import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { City } from '../content'
import { Photo } from '../pixel/Photo'

type Props = {
  city: City
  visited: number
  total: number
  onBack: () => void
  onOpen: (index: number) => void
}

const ease = [0.22, 1, 0.36, 1] as const

/** 翻页：向后翻时当前页绕左边缘合上，露出下一页；向前翻时上一页从左边缘翻回来 */
const pageVariants = {
  enter: (d: number) =>
    d > 0 ? { rotateY: 0, opacity: 1, scale: 0.985, zIndex: 1 } : { rotateY: -90, opacity: 0.4, scale: 1, zIndex: 2 },
  center: { rotateY: 0, opacity: 1, scale: 1, zIndex: 1 },
  exit: (d: number) =>
    d > 0 ? { rotateY: -90, opacity: 0.4, scale: 1, zIndex: 2 } : { rotateY: 0, opacity: 0, scale: 0.985, zIndex: 1 },
}

/** 到站后覆盖在地图位置上的"相册页"：左边是可翻页的照片，右边是日期与标题，下面是这一站的故事 */
export function CityAlbum({ city, visited, total, onBack, onOpen }: Props) {
  const photos = city.photos ?? []
  const n = photos.length
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)

  const flip = (d: number) => {
    if (n <= 1) return
    setDir(d)
    setPage((p) => (p + d + n) % n)
  }

  const caption = city.photoCaptions?.[page]

  return (
    <motion.article
      initial={{ opacity: 0, rotateY: 55, x: 24 }}
      animate={{ opacity: 1, rotateY: 0, x: 0 }}
      exit={{ opacity: 0, rotateY: 55, x: 24 }}
      transition={{ duration: 0.5, ease }}
      style={{ transformOrigin: 'left center' }}
      className="border border-ink bg-paper"
    >
      <div className="flex items-baseline justify-between border-b border-rule px-3 py-2">
        <span className="font-mono text-[9px] tracking-[0.25em] text-accent">{city.date}</span>
        <span className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">
          已到访 {visited} / {total}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 px-3 pt-4">
        <div className="relative aspect-[3/4] [perspective:1200px]">
          {n === 0 ? (
            <Photo size="small" className="h-full w-full [aspect-ratio:auto]" />
          ) : (
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={page}
                custom={dir}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease }}
                style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
                drag={n > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) flip(1)
                  else if (info.offset.x > 40) flip(-1)
                }}
                onTap={() => onOpen(page)}
                className="absolute inset-0 cursor-pointer border border-rule bg-paper p-1.5 shadow-[3px_4px_0_rgba(43,42,39,0.12)]"
              >
                <img
                  src={photos[page]}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />
                <span className="pointer-events-none absolute right-2.5 bottom-2.5 border border-paper/60 bg-ink/70 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-paper">
                  {page + 1} / {n}
                </span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h3 className="font-serif text-[17px] leading-snug font-semibold">
            {city.name}
            {city.title && city.title !== city.name && (
              <span className="mt-0.5 block text-[13px] font-normal text-ink-soft">{city.title}</span>
            )}
          </h3>
          <div className="rule mt-3 border-t pt-2 font-serif text-[11px] leading-relaxed text-ink-soft">
            {n === 0 ? '这一站的照片还在冲印中。' : caption ?? `第 ${page + 1} 张，共 ${n} 张。`}
          </div>
          {n > 1 && (
            <div className="mt-auto flex items-center gap-1 pt-3">
              <button
                type="button"
                onClick={() => flip(-1)}
                aria-label="上一张"
                className="h-7 w-7 border border-rule font-mono text-[12px] text-ink-soft active:bg-paper-deep"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => flip(1)}
                aria-label="下一张"
                className="h-7 w-7 border border-rule font-mono text-[12px] text-ink-soft active:bg-paper-deep"
              >
                ›
              </button>
              <span className="ml-1 font-mono text-[8px] tracking-[0.15em] text-ink-faint">左右滑动翻页</span>
            </div>
          )}
        </div>
      </div>

      <p className="px-3 pt-4 font-serif text-[13px] leading-relaxed text-ink-soft">{city.text}</p>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 flex w-full items-center justify-between border-t border-ink px-3 py-2.5 font-serif text-[12px] tracking-[0.15em] active:bg-paper-deep"
      >
        <span>← 回到地图，去下一站</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-ink-faint">还有 {total - visited} 站</span>
      </button>
    </motion.article>
  )
}
