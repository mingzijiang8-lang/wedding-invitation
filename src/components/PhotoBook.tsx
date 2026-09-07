import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { City } from '../content'
import { Couple } from '../pixel/Character'

type Page =
  | { kind: 'title' }
  | { kind: 'photo'; src: string; index: number }
  | { kind: 'end'; empty: boolean }

type Props = {
  city: City
  stop: number
  interval?: number
  paused?: boolean
  onOpen: (index: number) => void
}

const TURN = 1.05
const ease = [0.65, 0, 0.3, 1] as const

function buildPages(city: City): Page[] {
  const photos = city.photos ?? []
  const pages: Page[] = [{ kind: 'title' }, ...photos.map((src, index) => ({ kind: 'photo' as const, src, index }))]
  // 两页一个对开，页数补成偶数；最后一页是"未完待续"
  if (pages.length % 2 === 1) pages.push({ kind: 'end', empty: photos.length === 0 })
  return pages
}

/**
 * 一本摊开的相册。每张"叶子"是一张纸，正面是右页、背面是翻过去后的左页，
 * 绕书脊转 180° 就是翻页。turned = 已经翻到左边的叶子数。
 */
export function PhotoBook({ city, stop, interval = 3800, paused = false, onOpen }: Props) {
  const pages = buildPages(city)
  const leafCount = pages.length / 2 + 1
  const maxTurned = pages.length / 2
  const [turned, setTurned] = useState(1)
  /** 自动倒回开头时，记下从第几页倒回，用来给每张叶子错开延时 */
  const [rewindFrom, setRewindFrom] = useState(0)
  const [resting, setResting] = useState(false)
  const restTimer = useRef(0)
  const bookRef = useRef<HTMLDivElement>(null)
  const inView = useInView(bookRef, { amount: 0.6 })

  const autoplay = inView && !paused && !resting && maxTurned > 1

  const rest = useCallback(() => {
    setResting(true)
    window.clearTimeout(restTimer.current)
    restTimer.current = window.setTimeout(() => setResting(false), 9000)
  }, [])
  useEffect(() => () => window.clearTimeout(restTimer.current), [])

  const next = useCallback(() => {
    setRewindFrom(0)
    setTurned((t) => Math.min(maxTurned, t + 1))
  }, [maxTurned])
  const prev = useCallback(() => {
    setRewindFrom(0)
    setTurned((t) => Math.max(1, t - 1))
  }, [])
  /** 翻到最后再自动从头来：所有叶子从最上面那张起依次翻回去 */
  const rewind = useCallback(() => {
    setRewindFrom(turned)
    setTurned(1)
  }, [turned])

  useEffect(() => {
    if (!autoplay) return
    const atEnd = turned >= maxTurned
    const t = window.setTimeout(atEnd ? rewind : next, atEnd ? interval + 800 : interval)
    return () => window.clearTimeout(t)
  }, [autoplay, turned, maxTurned, interval, next, rewind])

  const left = pages[2 * turned - 2]
  const right = pages[2 * turned - 1]
  const spreadPhoto = [left, right].find((p) => p?.kind === 'photo')

  return (
    <div>
      <div className="[perspective:1000px]">
        <motion.div
          ref={bookRef}
          className="relative mx-auto w-[90%] [transform-style:preserve-3d]"
          style={{ rotateX: 22, rotateZ: -1.5 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.04}
          dragSnapToOrigin
          onDragStart={rest}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40 || info.velocity.x < -400) next()
            else if (info.offset.x > 40 || info.velocity.x > 400) prev()
          }}
        >
          {/* 封面板 */}
          <div className="absolute -inset-x-[3%] -inset-y-[4.5%] rounded-[4px] bg-[linear-gradient(135deg,#443b34_0%,#332c27_55%,#3d352f_100%)] shadow-[0_26px_44px_-16px_rgba(43,42,39,0.75),0_1px_0_rgba(255,255,255,0.06)_inset]" />
          {/* 书口露出来的纸页厚度：左右两叠，越靠下越深 */}
          {[3, 2, 1].map((i) => (
            <div key={i} className="pointer-events-none absolute inset-0">
              <div
                className="absolute top-0 bottom-0 left-0 w-1/2"
                style={{ transform: `translate(${-i * 1.3}px, ${i * 1.6}px)`, background: i % 2 ? '#e4dfd2' : '#d5cfc0' }}
              />
              <div
                className="absolute top-0 right-0 bottom-0 w-1/2"
                style={{ transform: `translate(${i * 1.3}px, ${i * 1.6}px)`, background: i % 2 ? '#e4dfd2' : '#d5cfc0' }}
              />
            </div>
          ))}

          {/* 页面区：两页对开，总比例 3:2 */}
          <div className="relative aspect-[3/2] w-full [transform-style:preserve-3d]">
            {Array.from({ length: leafCount }, (_, j) => (
              <Leaf
                key={j}
                front={pages[2 * j - 1]}
                back={pages[2 * j]}
                turned={j < turned}
                zIndex={j < turned ? j + 1 : leafCount - j + 1}
                delay={rewindFrom ? Math.max(0, rewindFrom - 1 - j) * 0.09 : 0}
                city={city}
                stop={stop}
                pageNo={[2 * j, 2 * j - 1]}
                onTap={() => {
                  rest()
                  if (j < turned) prev()
                  else next()
                }}
              />
            ))}
            {/* 书脊阴影 */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-50 w-[10%] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(43,42,39,0)_0%,rgba(43,42,39,0.18)_45%,rgba(43,42,39,0.28)_50%,rgba(43,42,39,0.18)_55%,rgba(43,42,39,0)_100%)]" />
          </div>
        </motion.div>
      </div>

      <div className="mt-6 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => {
            rest()
            prev()
          }}
          disabled={turned <= 1}
          className="h-7 w-9 border border-rule font-mono text-[12px] text-ink-soft disabled:opacity-30"
          aria-label="上一页"
        >
          ‹
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">
            {turned} / {maxTurned}
          </span>
          {spreadPhoto && spreadPhoto.kind === 'photo' && (
            <button
              type="button"
              onClick={() => {
                rest()
                onOpen(spreadPhoto.index)
              }}
              className="border-b border-ink font-mono text-[9px] tracking-[0.2em] text-ink"
            >
              看大图
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            rest()
            next()
          }}
          disabled={turned >= maxTurned}
          className="h-7 w-9 border border-rule font-mono text-[12px] text-ink-soft disabled:opacity-30"
          aria-label="下一页"
        >
          ›
        </button>
      </div>
    </div>
  )
}

type LeafProps = {
  front?: Page
  back?: Page
  turned: boolean
  zIndex: number
  delay: number
  city: City
  stop: number
  pageNo: [number, number]
  onTap: () => void
}

function Leaf({ front, back, turned, zIndex, delay, city, stop, pageNo, onTap }: LeafProps) {
  const rot = useMotionValue(turned ? -180 : 0)
  useEffect(() => {
    const target = turned ? -180 : 0
    if (rot.get() === target) return
    const ctrl = animate(rot, target, { duration: TURN, ease, delay })
    return () => ctrl.stop()
  }, [turned, rot, delay])

  // 翻到一半时纸面最暗；正在翻的那张压在所有页之上
  const shade = useTransform(rot, [-180, -90, 0], [0, 0.42, 0])
  const backShade = useTransform(rot, [-180, -90, 0], [0.06, 0.42, 0])
  const z = useTransform(rot, (v) => (v > -179.5 && v < -0.5 ? 99 : zIndex))

  return (
    <motion.div
      style={{ rotateY: rot, zIndex: z, transformOrigin: 'left center' }}
      className="absolute top-0 bottom-0 left-1/2 w-1/2 cursor-pointer [transform-style:preserve-3d]"
      onTap={onTap}
    >
      {/* 正面：右页 */}
      <div className="absolute inset-0 overflow-hidden bg-paper [backface-visibility:hidden]">
        <PageFace page={front} side="right" city={city} stop={stop} no={pageNo[1]} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(43,42,39,0.16),rgba(43,42,39,0)_14%)]" />
        <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-ink" />
      </div>
      {/* 背面：翻过去以后的左页 */}
      <div className="absolute inset-0 overflow-hidden bg-paper [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <PageFace page={back} side="left" city={city} stop={stop} no={pageNo[0]} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgba(43,42,39,0.16),rgba(43,42,39,0)_14%)]" />
        <motion.div style={{ opacity: backShade }} className="pointer-events-none absolute inset-0 bg-ink" />
      </div>
    </motion.div>
  )
}

function PageFace({
  page,
  side,
  city,
  stop,
  no,
}: {
  page?: Page
  side: 'left' | 'right'
  city: City
  stop: number
  no: number
}) {
  const numClass = `absolute bottom-[4%] font-mono text-[6px] tracking-[0.2em] text-ink-faint ${
    side === 'left' ? 'left-[7%]' : 'right-[7%]'
  }`
  if (!page) {
    // 封面内侧
    return <div className="absolute inset-0 bg-[#4a4039]" />
  }
  if (page.kind === 'photo') {
    return (
      <>
        <div className="absolute inset-[6%] bottom-[9%] overflow-hidden bg-paper-deep shadow-[0_1px_2px_rgba(43,42,39,0.25)]">
          <img src={page.src} alt="" draggable={false} className="h-full w-full object-cover" />
        </div>
        <span className={numClass}>{no}</span>
      </>
    )
  }
  if (page.kind === 'title') {
    return (
      <div className="absolute inset-0 flex flex-col px-[9%] pt-[10%] pb-[9%]">
        <span className="font-mono text-[6px] tracking-[0.3em] text-accent">TRAVEL STORY · 第 {stop} 站</span>
        <h4 className="mt-[8%] font-serif text-[clamp(14px,5.2vw,22px)] leading-tight font-semibold tracking-[0.1em]">
          {city.name}
        </h4>
        {city.title && city.title !== city.name && (
          <span className="mt-1 font-serif text-[clamp(8px,2.6vw,11px)] tracking-[0.25em] text-ink-soft">
            {city.title}
          </span>
        )}
        <span className="mt-[6%] block h-px w-[28%] bg-ink" />
        <span className="mt-[6%] font-mono text-[clamp(6px,1.9vw,8px)] tracking-[0.2em] text-ink-faint">{city.date}</span>
        <span className="mt-auto font-mono text-[6px] tracking-[0.3em] text-ink-faint">{city.name.toUpperCase()}</span>
      </div>
    )
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6%]">
      <Couple height={54} pose="idle" />
      <span className="font-mono text-[clamp(6px,2vw,8px)] tracking-[0.3em] text-ink-faint">
        {page.empty ? '照片冲印中' : '未完待续'}
      </span>
    </div>
  )
}
