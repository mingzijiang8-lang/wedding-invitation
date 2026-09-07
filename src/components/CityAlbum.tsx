import { motion } from 'framer-motion'
import type { CaptionStyle, City } from '../content'
import { CameraBack } from './CameraBack'

type Props = {
  city: City
  stop: number
  captionStyle: CaptionStyle
  lightboxOpen: boolean
  onOpen: (index: number) => void
}

const ease = [0.22, 1, 0.36, 1] as const

/** 到站后盖在地图位置上的内容：记者的相机（照片在里面回放）+ 这一站的一段故事 */
export function CityAlbum({ city, stop, captionStyle, lightboxOpen, onOpen }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 40, x: 20 }}
      animate={{ opacity: 1, rotateY: 0, x: 0 }}
      exit={{ opacity: 0, rotateY: 40, x: 20 }}
      transition={{ duration: 0.45, ease }}
      style={{ transformOrigin: 'left center' }}
      className="bg-paper"
    >
      <CameraBack city={city} stop={stop} captionStyle={captionStyle} paused={lightboxOpen} onOpen={onOpen} />

      <div className="border-t border-rule px-4 pt-4 pb-5">
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
    </motion.div>
  )
}
