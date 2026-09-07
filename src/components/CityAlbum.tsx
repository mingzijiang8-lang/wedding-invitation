import { motion } from 'framer-motion'
import type { City } from '../content'
import { PhotoStack } from './PhotoStack'

type Props = {
  city: City
  visited: number
  total: number
  lightboxOpen: boolean
  onBack: () => void
  onOpen: (index: number) => void
}

const ease = [0.22, 1, 0.36, 1] as const

/** 到站后盖在地图位置上的一页：摊开的一叠照片 + 这一站的一段故事 */
export function CityAlbum({ city, visited, total, lightboxOpen, onBack, onOpen }: Props) {
  const photos = city.photos ?? []

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

      <div className="relative border-b border-rule bg-paper-deep/70 px-4 pt-7 pb-5">
        <span className="pointer-events-none absolute top-2 right-3 font-mono text-[8px] tracking-[0.2em] text-ink-faint">
          {photos.length > 1 ? '左右拨动 · 轻触看大图' : photos.length === 1 ? '轻触看大图' : '照片冲印中'}
        </span>
        <PhotoStack photos={photos} paused={lightboxOpen} onOpen={onOpen} />
      </div>

      <div className="px-4 pt-4">
        <h3 className="font-serif text-[22px] leading-tight font-semibold tracking-[0.08em]">
          {city.name}
          {city.title && city.title !== city.name && (
            <span className="ml-2 align-[3px] font-normal text-[12px] tracking-[0.2em] text-ink-soft">
              {city.title}
            </span>
          )}
        </h3>
        <p className="mt-2.5 font-serif text-[13px] leading-[1.9] text-ink-soft">{city.text}</p>
      </div>

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
