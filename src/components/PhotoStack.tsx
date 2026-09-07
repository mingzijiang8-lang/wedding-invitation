import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Photo } from '../pixel/Photo'

type Props = {
  photos: string[]
  /** 自动翻下一张的间隔（毫秒） */
  interval?: number
  /** 外部打开了大图时暂停自动翻 */
  paused?: boolean
  onOpen: (index: number) => void
}

/** 一叠照片里每一层的姿态：最上面一张端正，下面两张歪着露出边角 */
const POSES = [
  { x: 0, y: 0, rotate: -1.5, scale: 1, opacity: 1 },
  { x: 16, y: 10, rotate: 5, scale: 0.97, opacity: 1 },
  { x: -14, y: 16, rotate: -6.5, scale: 0.94, opacity: 1 },
  { x: 0, y: 20, rotate: 0, scale: 0.9, opacity: 0 },
]

const spring = { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 } as const

/**
 * 摊在桌上的一叠照片。最上面一张会定时自己抽出来、滑到一边塞回底下，
 * 手指也可以直接把它拨走（或往回拨），点一下看大图。
 */
export function PhotoStack({ photos, interval = 3600, paused = false, onOpen }: Props) {
  const n = photos.length
  const [current, setCurrent] = useState(0)
  const [flying, setFlying] = useState(false)
  /** 用户刚动过手，先歇一会儿再自动翻 */
  const [resting, setResting] = useState(false)
  const restTimer = useRef(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { amount: 0.6 })

  const dragX = useMotionValue(0)
  const dragRotate = useTransform(dragX, [-200, 0, 200], [-10, 0, 10])
  const dragOpacity = useTransform(dragX, [-260, -150, 0, 150, 260], [0, 1, 1, 1, 0])

  const autoplay = n > 1 && inView && !paused && !resting

  /** 最上面一张往 side 那边飞出去、塞回底下，下一张顶上来 */
  const flyOut = useCallback(
    (side: 1 | -1) => {
      if (n <= 1 || flying) return
      setFlying(true)
      animate(dragX, side * 320, { duration: 0.42, ease: [0.4, 0, 0.6, 1] }).then(() => {
        setCurrent((c) => (c + 1) % n)
        dragX.jump(0)
        setFlying(false)
      })
    },
    [dragX, flying, n],
  )

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => flyOut(1), interval)
    return () => window.clearTimeout(t)
  }, [autoplay, current, flyOut, interval])

  useEffect(() => () => window.clearTimeout(restTimer.current), [])

  const touch = () => {
    setResting(true)
    window.clearTimeout(restTimer.current)
    restTimer.current = window.setTimeout(() => setResting(false), 8000)
  }

  if (n === 0) {
    return (
      <div className="mx-auto w-[72%] -rotate-[1.5deg] bg-paper p-[5px] pb-[9px] shadow-[0_1px_0_rgba(43,42,39,0.18),0_14px_30px_-14px_rgba(43,42,39,0.55)]">
        <Photo size="small" ratio="3 / 4" />
      </div>
    )
  }

  return (
    <div>
      <div ref={stageRef} className="relative mx-auto aspect-[3/4] w-[72%] py-1">
        {photos.map((src, k) => {
          const depth = (k - current + n) % n
          const pose = POSES[Math.min(depth, POSES.length - 1)]
          const isTop = depth === 0
          return (
            <motion.div
              key={src}
              initial={false}
              animate={pose}
              transition={spring}
              style={{ zIndex: n - depth, transformOrigin: '50% 60%' }}
              className="absolute inset-0"
            >
              <motion.div
                style={isTop ? { x: dragX, rotate: dragRotate, opacity: dragOpacity } : undefined}
                drag={isTop && n > 1 && !flying ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                dragSnapToOrigin
                dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
                onDragStart={touch}
                onDragEnd={(_, info) => {
                  const throwIt = Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500
                  if (throwIt) flyOut(info.offset.x + info.velocity.x * 0.1 > 0 ? 1 : -1)
                }}
                onTap={() => {
                  touch()
                  onOpen(k)
                }}
                className={`h-full w-full bg-paper p-[5px] pb-[9px] shadow-[0_1px_0_rgba(43,42,39,0.18),0_14px_30px_-14px_rgba(43,42,39,0.55)] ${
                  isTop ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  loading={depth <= 2 ? 'eager' : 'lazy'}
                  className="pointer-events-none h-full w-full object-cover"
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {n > 1 && (
        <div className="mx-auto mt-5 flex w-[72%] items-center gap-1.5">
          {photos.map((src, k) => (
            <button
              key={src}
              type="button"
              aria-label={`第 ${k + 1} 张`}
              onClick={() => {
                touch()
                if (k !== current) flyOut(1)
              }}
              className="relative h-3 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
              {k === current && (
                <motion.span
                  key={`${current}-${autoplay ? 'run' : 'hold'}`}
                  initial={{ scaleX: autoplay ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={autoplay ? { duration: interval / 1000, ease: 'linear' } : { duration: 0 }}
                  style={{ originX: 0 }}
                  className="absolute inset-x-0 top-1/2 h-px bg-ink"
                />
              )}
              {k < current && <span className="absolute inset-x-0 top-1/2 h-px bg-ink-faint" />}
            </button>
          ))}
          <span className="ml-2 shrink-0 font-mono text-[9px] tracking-[0.2em] text-ink-faint">
            {current + 1}/{n}
          </span>
        </div>
      )}
    </div>
  )
}
