import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { City } from '../content'
import { Couple } from '../pixel/Character'

type Props = {
  city: City
  stop: number
  interval?: number
  paused?: boolean
  onOpen: (index: number) => void
}

/** 机背照片里 LCD 显示区的位置（相对图片的百分比），换图片时用 scripts/cutout-camera.mjs 重新量 */
const LCD = { left: 27, top: 30.5, width: 69.5, height: 58.5 }
/** 各实体按键在图片上的中心点（百分比） */
const KEYS = {
  up: { x: 67.5, y: 10.2 },
  down: { x: 67.5, y: 20.3 },
  left: { x: 59.3, y: 15.2 },
  right: { x: 75.8, y: 15.2 },
  set: { x: 67.5, y: 15.2 },
  play: { x: 50.8, y: 9.6 },
  disp: { x: 85.8, y: 9.6 },
}

/**
 * 记者的相机（实拍机背，竖持）。照片在 LCD 里回放，拨盘上下翻，SET / ▶ 看大图。
 */
export function CameraBack({ city, stop, interval = 4200, paused = false, onOpen }: Props) {
  const photos = city.photos ?? []
  const n = photos.length
  const [index, setIndex] = useState(0)
  const [afTick, setAfTick] = useState(0)
  const [resting, setResting] = useState(false)
  const restTimer = useRef(0)
  const lcdRef = useRef<HTMLDivElement>(null)
  const inView = useInView(lcdRef, { amount: 0.6 })

  const autoplay = n > 1 && inView && !paused && !resting

  const rest = useCallback(() => {
    setResting(true)
    window.clearTimeout(restTimer.current)
    restTimer.current = window.setTimeout(() => setResting(false), 9000)
  }, [])
  useEffect(() => () => window.clearTimeout(restTimer.current), [])

  const step = useCallback(
    (d: 1 | -1) => {
      if (n <= 1) return
      setIndex((i) => (i + d + n) % n)
      setAfTick((t) => t + 1)
    },
    [n],
  )
  const press = (d: 1 | -1) => {
    rest()
    step(d)
  }
  const open = () => {
    if (n === 0) return
    rest()
    onOpen(index)
  }

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => step(1), interval)
    return () => window.clearTimeout(t)
  }, [autoplay, index, interval, step])

  const dateShort = city.date.replace(/[（）()]/g, '')

  return (
    <div className="[perspective:1300px]">
      <motion.div
        className="relative mx-auto w-[86%]"
        style={{ rotateY: -7, rotateX: 3, transformOrigin: '50% 50%' }}
      >
        <img
          src="/camera-back.webp"
          alt=""
          draggable={false}
          className="block w-full select-none [filter:drop-shadow(0_28px_26px_rgba(43,42,39,0.42))_drop-shadow(0_4px_6px_rgba(43,42,39,0.35))]"
        />

        {/* LCD 显示区 */}
        <motion.div
          ref={lcdRef}
          className="absolute overflow-hidden rounded-[2px] bg-black"
          style={{ left: `${LCD.left}%`, top: `${LCD.top}%`, width: `${LCD.width}%`, height: `${LCD.height}%` }}
          drag={n > 1 ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.04}
          dragSnapToOrigin
          onDragStart={rest}
          onDragEnd={(_, info) => {
            if (info.offset.y < -36 || info.velocity.y < -400) step(1)
            else if (info.offset.y > 36 || info.velocity.y > 400) step(-1)
          }}
          onTap={open}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {n > 0 ? (
              <motion.img
                key={photos[index]}
                src={photos[index]}
                alt=""
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <motion.div key="none" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0b0d]">
                <Couple height={58} pose="idle" />
                <span className="font-mono text-[7px] tracking-[0.3em] text-[#9a9a96]">NO IMAGE · 照片冲印中</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 屏幕玻璃反光 */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.02)_35%,rgba(255,255,255,0)_60%)]" />

          {/* 回放信息层 */}
          <div className="pointer-events-none absolute inset-0 font-mono text-[7.5px] tracking-[0.15em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
            <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
              <span className="text-[6.5px]">▶</span>
              <span>{n === 0 ? '0/0' : `${index + 1}/${n}`}</span>
            </div>
            <div className="absolute top-1.5 right-2 flex items-center gap-1.5">
              <span>JPG</span>
              <span className="relative flex h-[7px] w-[13px] items-center rounded-[1px] border border-white/90 px-px after:absolute after:top-1/2 after:-right-[3px] after:h-[3px] after:w-[2px] after:-translate-y-1/2 after:bg-white/90 after:content-['']">
                <span className="h-[3px] w-[70%] bg-white/90" />
              </span>
            </div>
            <div className="absolute bottom-2 left-2">{dateShort}</div>
            <div className="absolute right-2 bottom-2">{city.name}</div>

            <div className="absolute top-[9%] left-[9%] h-[6%] w-[8%] border-t border-l border-white/50" />
            <div className="absolute top-[9%] right-[9%] h-[6%] w-[8%] border-t border-r border-white/50" />
            <div className="absolute bottom-[9%] left-[9%] h-[6%] w-[8%] border-b border-l border-white/50" />
            <div className="absolute right-[9%] bottom-[9%] h-[6%] w-[8%] border-b border-r border-white/50" />
            {n > 0 && (
              <motion.div
                key={afTick}
                initial={{ borderColor: 'rgba(120,255,160,0.95)', scale: 1.12 }}
                animate={{ borderColor: 'rgba(255,255,255,0.85)', scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 h-[16%] w-[20%] -translate-x-1/2 -translate-y-1/2 border-[1.5px]"
              />
            )}
            {/* 幻灯片进度：自动播放时从左到右走完一格 */}
            {autoplay && (
              <motion.div
                key={`bar-${index}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: interval / 1000, ease: 'linear' }}
                style={{ originX: 0 }}
                className="absolute inset-x-0 bottom-0 h-[2px] bg-white/70"
              />
            )}
          </div>
        </motion.div>

        {/* 实体按键的热区 */}
        <HotKey at={KEYS.up} label="上一张" onClick={() => press(-1)} />
        <HotKey at={KEYS.down} label="下一张" onClick={() => press(1)} />
        <HotKey at={KEYS.left} label="上一张" onClick={() => press(-1)} />
        <HotKey at={KEYS.right} label="下一张" onClick={() => press(1)} />
        <HotKey at={KEYS.set} label="看大图" onClick={open} size={5.5} />
        <HotKey at={KEYS.play} label="看大图" onClick={open} />
        <HotKey at={KEYS.disp} label="信息" onClick={rest} />
      </motion.div>

      <div className="mt-5 flex items-center justify-between px-3 font-mono text-[7px] tracking-[0.3em] text-ink-faint">
        <span>PRESS · 本报记者用机 · No.{String(stop).padStart(3, '0')}</span>
        <span>{n > 1 ? '拨盘翻看 · SET 放大' : n === 1 ? 'SET 放大' : 'NO CARD'}</span>
      </div>
    </div>
  )
}

function HotKey({
  at,
  label,
  onClick,
  size = 7.5,
}: {
  at: { x: number; y: number }
  label: string
  onClick: () => void
  size?: number
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9, backgroundColor: 'rgba(255,255,255,0.18)' }}
      className="absolute rounded-full bg-transparent"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${size}%`, aspectRatio: '1', x: '-50%', y: '-50%' }}
    />
  )
}
