import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { photoNote, photoSrc, type CaptionStyle, type City } from '../content'
import { Couple } from '../pixel/Character'

type Props = {
  city: City
  stop: number
  captionStyle: CaptionStyle
  interval?: number
  paused?: boolean
  onOpen: (index: number) => void
}

/** 机背照片里 LCD 显示区的位置（相对图片的百分比）。换图后跑 scripts/calibrate-camera.mjs 对一下 */
const LCD = { left: 35.7, top: 39.2, width: 48.3, height: 43 }
/** 各实体按键在图片上的中心点（百分比） */
const KEYS = {
  up: { x: 45.6, y: 21.6 },
  down: { x: 45.6, y: 31.1 },
  left: { x: 38.7, y: 26.4 },
  right: { x: 52.5, y: 26.4 },
  set: { x: 45.6, y: 26.4 },
  play: { x: 13, y: 90.7 },
  ok: { x: 70.9, y: 91.6 },
  info: { x: 64.4, y: 23.7 },
}

/**
 * 记者的相机（实拍机背，竖持）。照片在 LCD 里回放，多重选择器上下翻，OK / ▶ 看大图。
 */
export function CameraBack({ city, stop, captionStyle, interval = 4200, paused = false, onOpen }: Props) {
  const photos = (city.photos ?? []).map(photoSrc)
  const notes = (city.photos ?? []).map(photoNote)
  const n = photos.length
  const hasAnyNote = notes.some(Boolean)
  const [index, setIndex] = useState(0)
  const note = notes[index]
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
    <div>
      <div className="relative w-full overflow-hidden bg-[#1a1a1c]">
        <img src="/camera-back.webp" alt="" draggable={false} className="block w-full select-none" />
        {/* 上下边缘压暗一点，让照片块和纸面衔接自然 */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0)_12%,rgba(0,0,0,0)_88%,rgba(0,0,0,0.4))]" />
        {/* 盖住机身上的品牌字 */}
        <div className="absolute rounded-[2px] bg-[#232325]" style={{ left: '31.6%', top: '72.4%', width: '5%', height: '8%' }} />

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
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.02)_35%,rgba(255,255,255,0)_60%)]" />

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
            {/* 照片的 note：两种放在屏幕里的样式 */}
            <AnimatePresence mode="wait">
              {note && captionStyle === 'lcd-bar' && (
                <motion.div
                  key={`bar-${index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="absolute inset-x-0 bottom-[16%] bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.55))] px-2.5 py-1.5"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="shrink-0 text-[6px] text-[#ffd479]">MEMO</span>
                    <span className="font-serif text-[9.5px] leading-snug tracking-[0.06em] [text-shadow:none]">{note}</span>
                  </div>
                </motion.div>
              )}
              {note && captionStyle === 'subtitle' && (
                <motion.div
                  key={`sub-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-[12%] bottom-[16%] text-center font-serif text-[10px] leading-snug tracking-[0.12em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.6)]"
                >
                  {note}
                </motion.div>
              )}
            </AnimatePresence>

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
        <HotKey at={KEYS.set} label="看大图" onClick={open} size={5} />
        <HotKey at={KEYS.play} label="看大图" onClick={open} />
        <HotKey at={KEYS.ok} label="看大图" onClick={open} />
        <HotKey at={KEYS.info} label="信息" onClick={rest} size={6} />
      </div>

      {/* 照片的 note：两种放在相机下方纸面上的样式。只要这一站有任何一张带 note，就固定留出这一行，避免翻到没字的那张时高度跳动 */}
      {hasAnyNote && captionStyle === 'cutline' && (
        <div className="flex min-h-[46px] items-start gap-2 border-b border-rule px-3 pt-2.5 pb-2">
          <span className="mt-[2px] shrink-0 border border-ink px-1 py-px font-mono text-[7px] tracking-[0.15em]">
            图 {index + 1}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.22 }}
              className={`font-serif text-[12px] leading-[1.6] ${note ? 'text-ink' : 'text-ink-faint'}`}
            >
              {note ?? '（这一张没有配文。）'}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
      {hasAnyNote && captionStyle === 'print' && (
        <div className="px-3 pt-3 pb-1">
          <motion.div
            key={index}
            initial={{ opacity: 0, rotate: -1.5, y: 4 }}
            animate={{ opacity: 1, rotate: index % 2 ? 0.6 : -0.8, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex min-h-[54px] items-center justify-between gap-3 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.08)]"
          >
            <span className={`font-serif text-[12px] leading-[1.6] tracking-[0.04em] ${note ? 'text-[#3a3a38]' : 'text-ink-faint'}`}>
              {note ?? '⋯'}
            </span>
            <span className="shrink-0 font-mono text-[9px] tracking-[0.1em] text-[#e07a2a] [text-shadow:0_0_4px_rgba(224,122,42,0.55)]">
              {filmDate(city.date)} · {index + 1}
            </span>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 font-mono text-[7px] tracking-[0.3em] text-ink-faint">
        <span>PRESS · 本报记者用机 · No.{String(stop).padStart(3, '0')}</span>
        <span>{n > 1 ? '拨盘 ▲▼ 翻看 · OK 放大' : n === 1 ? 'OK 放大' : 'NO CARD'}</span>
      </div>
    </div>
  )
}

/** 把「二〇二六年十月六日」压成胶片日期戳那种 '26 10 6 */
function filmDate(label: string) {
  const digit: Record<string, string> = { 〇: '0', 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10' }
  const m = label.match(/([〇一二三四五六七八九]{4})年(.+?)月(?:(.+?)日)?/)
  if (!m) return label.replace(/[（）()]/g, '')
  const year = [...m[1]].map((c) => digit[c]).join('').slice(2)
  const cn = (s: string) => {
    if (s === '十') return 10
    const [a, b] = s.split('十')
    if (b === undefined) return Number(digit[a] ?? 0)
    return (a ? Number(digit[a]) : 1) * 10 + (b ? Number(digit[b]) : 0)
  }
  return `'${year} ${cn(m[2])}${m[3] ? ` ${cn(m[3])}` : ''}`
}

function HotKey({
  at,
  label,
  onClick,
  size = 8,
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
      whileTap={{ scale: 0.92, backgroundColor: 'rgba(255,255,255,0.22)' }}
      className="absolute rounded-full bg-transparent"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${size}%`, aspectRatio: '1', x: '-50%', y: '-50%' }}
    />
  )
}
