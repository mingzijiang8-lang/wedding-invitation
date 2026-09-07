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

const keyClass =
  'flex items-center justify-center rounded-[5px] border border-black/80 bg-[linear-gradient(180deg,#3a3a3d,#26262a)] font-mono text-[#d6d6d2] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_2px_3px_rgba(0,0,0,0.6)] active:translate-y-px active:shadow-none'

/**
 * 记者的相机机背。照片在 LCD 里回放，用右侧拨盘上下翻，SET 看大图。
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

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => step(1), interval)
    return () => window.clearTimeout(t)
  }, [autoplay, index, interval, step])

  const dateShort = city.date.replace(/[（）()]/g, '')

  return (
    <div className="relative mx-auto w-full max-w-[400px] rounded-[16px] bg-[linear-gradient(160deg,#242427_0%,#1a1a1c_60%,#202023_100%)] p-3 pt-2 shadow-[0_26px_44px_-18px_rgba(0,0,0,0.75),0_1px_0_rgba(255,255,255,0.06)_inset]">
      {/* 蒙皮纹理 */}
      <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_0.8px,transparent_1.1px)] bg-[length:4px_4px]" />

      {/* 顶板：取景器与铭牌 */}
      <div className="relative flex h-9 items-center">
        <div className="absolute top-0 left-1/2 flex h-7 w-[34%] -translate-x-1/2 items-center justify-center rounded-b-[9px] border border-black/80 bg-[#101012] shadow-[0_2px_4px_rgba(0,0,0,0.6)_inset]">
          <div className="h-3.5 w-[64%] rounded-[3px] bg-[linear-gradient(180deg,#0a0a0b,#1c1c20)] shadow-[0_0_0_1px_#2a2a2e]" />
        </div>
        <span className="ml-1 font-mono text-[7px] tracking-[0.35em] text-[#8a8a86]">PRESS · 本报记者用机</span>
        <span className="ml-auto mr-1 font-mono text-[7px] tracking-[0.25em] text-[#6e6e6a]">No.{String(stop).padStart(3, '0')}</span>
      </div>

      <div className="relative mt-2 grid grid-cols-[minmax(0,1fr)_60px] gap-3">
        {/* LCD */}
        <motion.div
          ref={lcdRef}
          className="relative aspect-[3/4] overflow-hidden rounded-[5px] border border-[#3b3b3f] bg-black shadow-[0_0_0_3px_#0c0c0d,0_0_0_4px_#2a2a2e,0_3px_6px_rgba(0,0,0,0.6)_inset]"
          drag={n > 1 ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.05}
          dragSnapToOrigin
          onDragStart={rest}
          onDragEnd={(_, info) => {
            if (info.offset.y < -36 || info.velocity.y < -400) step(1)
            else if (info.offset.y > 36 || info.velocity.y > 400) step(-1)
          }}
          onTap={() => {
            if (n > 0) {
              rest()
              onOpen(index)
            }
          }}
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
              <motion.div
                key="none"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d0f]"
              >
                <Couple height={64} pose="idle" />
                <span className="font-mono text-[8px] tracking-[0.3em] text-[#9a9a96]">NO IMAGE · 照片冲印中</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 回放信息层 */}
          <div className="pointer-events-none absolute inset-0 font-mono text-[8px] tracking-[0.15em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
            <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
              <span className="text-[7px]">▶</span>
              <span>
                {n === 0 ? '0/0' : `${index + 1}/${n}`}
              </span>
            </div>
            <div className="absolute top-1.5 right-2 flex items-center gap-1.5">
              <span>JPG</span>
              <span className="flex h-[7px] w-[13px] items-center rounded-[1px] border border-white/90 px-px after:absolute after:top-1/2 after:-right-[3px] after:h-[3px] after:w-[2px] after:-translate-y-1/2 after:bg-white/90 after:content-['']">
                <span className="h-[3px] w-[70%] bg-white/90" />
              </span>
            </div>
            <div className="absolute bottom-1.5 left-2">{dateShort}</div>
            <div className="absolute right-2 bottom-1.5">{city.name}</div>

            {/* 四角取景框 */}
            <div className="absolute top-[9%] left-[9%] h-[6%] w-[8%] border-t border-l border-white/50" />
            <div className="absolute top-[9%] right-[9%] h-[6%] w-[8%] border-t border-r border-white/50" />
            <div className="absolute bottom-[9%] left-[9%] h-[6%] w-[8%] border-b border-l border-white/50" />
            <div className="absolute right-[9%] bottom-[9%] h-[6%] w-[8%] border-b border-r border-white/50" />
            {/* 对焦框：换图时先绿一下 */}
            {n > 0 && (
              <motion.div
                key={afTick}
                initial={{ borderColor: 'rgba(120,255,160,0.95)', scale: 1.12 }}
                animate={{ borderColor: 'rgba(255,255,255,0.85)', scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 h-[16%] w-[20%] -translate-x-1/2 -translate-y-1/2 border-[1.5px]"
              />
            )}
          </div>
        </motion.div>

        {/* 右侧按键区 */}
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <button type="button" onClick={rest} className={`${keyClass} h-6 w-11 text-[6px] tracking-[0.15em]`}>
            AF-ON
          </button>

          {/* 四向拨盘 */}
          <div className="relative mt-1 h-[60px] w-[60px] rounded-full bg-[linear-gradient(180deg,#3b3b3f,#1f1f22)] shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_3px_6px_rgba(0,0,0,0.7)]">
            <button
              type="button"
              aria-label="上一张"
              onClick={() => press(-1)}
              className="absolute top-0.5 left-1/2 h-4 w-6 -translate-x-1/2 text-[8px] text-[#d6d6d2] active:text-white"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="下一张"
              onClick={() => press(1)}
              className="absolute bottom-0.5 left-1/2 h-4 w-6 -translate-x-1/2 text-[8px] text-[#d6d6d2] active:text-white"
            >
              ▼
            </button>
            <button
              type="button"
              aria-label="上一张"
              onClick={() => press(-1)}
              className="absolute top-1/2 left-0.5 h-6 w-4 -translate-y-1/2 text-[8px] text-[#d6d6d2] active:text-white"
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="下一张"
              onClick={() => press(1)}
              className="absolute top-1/2 right-0.5 h-6 w-4 -translate-y-1/2 text-[8px] text-[#d6d6d2] active:text-white"
            >
              ▶
            </button>
            <button
              type="button"
              aria-label="看大图"
              onClick={() => {
                if (n > 0) {
                  rest()
                  onOpen(index)
                }
              }}
              className="absolute top-1/2 left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/80 bg-[linear-gradient(180deg,#2c2c30,#161618)] font-mono text-[5.5px] tracking-[0.1em] text-[#d6d6d2] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] active:translate-y-px"
            >
              SET
            </button>
          </div>

          <button type="button" onClick={rest} className={`${keyClass} mt-1 h-6 w-11 text-[6px] tracking-[0.2em]`}>
            INFO
          </button>
          <button type="button" onClick={rest} className={`${keyClass} h-6 w-11 text-[6px] tracking-[0.2em]`}>
            MENU
          </button>
          <button
            type="button"
            aria-label="看大图"
            onClick={() => {
              if (n > 0) {
                rest()
                onOpen(index)
              }
            }}
            className={`${keyClass} h-6 w-11 text-[7px]`}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="relative mt-2.5 flex items-center justify-between px-1 font-mono text-[6.5px] tracking-[0.3em] text-[#6e6e6a]">
        <span>PLAYBACK</span>
        <span>{n > 1 ? '▲▼ 翻看 · SET 放大' : n === 1 ? 'SET 放大' : 'NO CARD'}</span>
      </div>
    </div>
  )
}
