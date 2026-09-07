import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { journey, wedding, type City } from '../content'
import { CHINA_BITMAP, CHINA_COLS, CHINA_ROWS, project } from '../map/chinaBitmap'
import { CITY_COORDS } from '../map/cities'
import { drawFrame, frameSrc, loadFrame, preloadAll, WALK_FPS } from '../pixel/characters'
import { CityAlbum } from './CityAlbum'
import { Lightbox } from './Lightbox'
import { Section } from './Section'

/** 静态底图每格多少"基准像素"，所有绘制都在这个坐标系里，最后整体缩放到容器宽度 */
const BASE = 4
const W = CHINA_COLS * BASE
const H = CHINA_ROWS * BASE
const SPEED = 52 // 基准像素 / 秒
const CHAR_H = 30 // 角色高度（基准像素）

const C = {
  sea: '#eae7dd',
  seaDot: '#dfdbcf',
  neighbor: '#e0dcd0',
  land: '#cfc8b8',
  landDot: '#c2bba9',
  coast: '#b0a897',
  ink: '#2b2a27',
  inkSoft: '#5c5952',
  inkFaint: '#9a958a',
  paper: '#f3efe6',
  rose: '#b89a93',
  accent: '#8a6f5c',
}

type Pt = { x: number; y: number }
type Placed = City & { px: number; py: number }

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function cellAt(c: number, r: number) {
  if (c < 0 || r < 0 || c >= CHINA_COLS || r >= CHINA_ROWS) return '.'
  return CHINA_BITMAP[r][c]
}

function isLand(c: number, r: number) {
  return cellAt(c, r) === '#'
}

function placeCities(): Placed[] {
  return journey.cities.map((c) => {
    const coord = c.lng != null && c.lat != null ? [c.lng, c.lat] : CITY_COORDS[c.name]
    if (!coord) console.warn(`[journey] 城市「${c.name}」没有坐标，请在 content.ts 里补 lng/lat`)
    const [lng, lat] = coord ?? [104, 35]
    const { x, y } = project(lng, lat)
    return { ...c, px: x * BASE, py: y * BASE }
  })
}

function drawStatic(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.sea
  ctx.fillRect(0, 0, W, H)
  for (let r = 0; r < CHINA_ROWS; r++) {
    for (let c = 0; c < CHINA_COLS; c++) {
      const cell = cellAt(c, r)
      if (cell === ',') {
        ctx.fillStyle = C.neighbor
        ctx.fillRect(c * BASE, r * BASE, BASE, BASE)
        continue
      }
      if (cell === '.') {
        if ((c + r) % 4 === 0 && hash(c, r) < 0.35) {
          ctx.fillStyle = C.seaDot
          ctx.fillRect(c * BASE + 1, r * BASE + 1, 1, 1)
        }
        continue
      }
      const coast =
        !isLand(c - 1, r) || !isLand(c + 1, r) || !isLand(c, r - 1) || !isLand(c, r + 1)
      ctx.fillStyle = coast ? C.coast : C.land
      ctx.fillRect(c * BASE, r * BASE, BASE, BASE)
      if (!coast && hash(c, r) < 0.16) {
        ctx.fillStyle = C.landDot
        ctx.fillRect(c * BASE + 1, r * BASE + 1, BASE - 2, BASE - 2)
      }
    }
  }
  // 南海诸岛示意框
  const bw = 40
  const bh = 52
  const bx = W - bw - 6
  const by = H - bh - 6
  ctx.fillStyle = C.sea
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeStyle = C.inkFaint
  ctx.lineWidth = 1
  ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1)
  ctx.fillStyle = C.coast
  for (const [dx, dy] of [
    [10, 10],
    [16, 14],
    [22, 22],
    [12, 28],
    [26, 34],
    [18, 40],
    [30, 44],
  ]) {
    ctx.fillRect(bx + dx, by + dy, 2, 2)
  }
}

/** 婚礼城市：名字和 wedding.city 相同的那一站；没有的话取最后一站 */
function weddingIndex(cities: Placed[]) {
  const i = cities.findIndex((c) => c.name === wedding.city)
  return i >= 0 ? i : cities.length - 1
}

export function JourneyMap() {
  const cities = useMemo(() => placeCities(), [])
  const home = useMemo(() => weddingIndex(cities), [cities])
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const staticRef = useRef<HTMLCanvasElement | null>(null)
  const scaleRef = useRef(1)

  const posRef = useRef<Pt>({ x: cities[home].px, y: cities[home].py })
  /** 正在走向的目标点；为空表示站着 */
  const destRef = useRef<Pt | null>(null)
  const targetRef = useRef(home)
  const facingRef = useRef<1 | -1>(-1)
  const trailRef = useRef<Pt[]>([{ x: cities[home].px, y: cities[home].py }])

  const [active, setActive] = useState(home)
  const [target, setTarget] = useState(home)
  const [walking, setWalking] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([home]))
  const [lightbox, setLightbox] = useState<number | null>(null)
  /** map：看地图选目的地；album：到站后相册页盖住地图 */
  const [mode, setMode] = useState<'map' | 'album'>('map')
  const arriveTimerRef = useRef(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const firstModeRef = useRef(true)

  // 切换地图 / 相机页时把框顶带回视野，避免高度变化后读者不知道自己在哪
  useEffect(() => {
    if (firstModeRef.current) {
      firstModeRef.current = false
      return
    }
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [mode])

  const activeRef = useRef(active)
  const visitedRef = useRef(visited)
  useEffect(() => {
    activeRef.current = active
    visitedRef.current = visited
  }, [active, visited])

  const rebuild = useCallback(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const width = wrap.clientWidth
    // 相册页盖住地图时容器 display:none，宽度为 0，等回到地图再重算
    if (width === 0) return
    const s = width / W
    scaleRef.current = s
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.style.width = `${width}px`
    canvas.style.height = `${H * s}px`
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(H * s * dpr)

    if (!staticRef.current) {
      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const octx = off.getContext('2d')
      if (octx) drawStatic(octx)
      staticRef.current = off
    }
  }, [])

  /** 从当前所在位置直线走向第 j 个城市；走路途中再点别处会立刻改道；点已经站着的城市则直接翻开相册页 */
  const goTo = useCallback(
    (j: number) => {
      window.clearTimeout(arriveTimerRef.current)
      if (targetRef.current === j && !destRef.current) {
        setMode('album')
        return
      }
      setMode('map')
      destRef.current = { x: cities[j].px, y: cities[j].py }
      targetRef.current = j
      setTarget(j)
      setWalking(true)
    },
    [cities],
  )

  useEffect(() => {
    preloadAll()
    rebuild()
    const ro = new ResizeObserver(rebuild)
    if (wrapRef.current) ro.observe(wrapRef.current)

    let raf = 0
    let last = performance.now()
    let clock = 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += dt

      const dest = destRef.current
      if (dest) {
        const dx = dest.x - posRef.current.x
        const dy = dest.y - posRef.current.y
        const dist = Math.hypot(dx, dy)
        if (Math.abs(dx) > 0.5) facingRef.current = dx > 0 ? 1 : -1
        const step = SPEED * dt
        if (dist <= step) {
          posRef.current = { ...dest }
          destRef.current = null
          const arrived = targetRef.current
          setActive(arrived)
          setVisited((v) => (v.has(arrived) ? v : new Set(v).add(arrived)))
          setWalking(false)
          // 站定喘口气再翻开相册页；期间又点了别处就作罢
          window.clearTimeout(arriveTimerRef.current)
          arriveTimerRef.current = window.setTimeout(() => {
            if (!destRef.current) setMode('album')
          }, 550)
        } else {
          posRef.current = {
            x: posRef.current.x + (dx / dist) * step,
            y: posRef.current.y + (dy / dist) * step,
          }
        }
        const lastTrail = trailRef.current[trailRef.current.length - 1]
        if (Math.hypot(posRef.current.x - lastTrail.x, posRef.current.y - lastTrail.y) >= 3) {
          trailRef.current.push({ ...posRef.current })
        }
      }

      const canvas = canvasRef.current
      const stat = staticRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && stat && ctx) {
        const s = scaleRef.current
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(stat, 0, 0)

        // 走过的足迹
        ctx.fillStyle = C.ink
        for (const p of trailRef.current) ctx.fillRect(p.x - 0.8, p.y - 0.8, 1.6, 1.6)

        // 正在前往的目标：一条淡虚线
        if (destRef.current) {
          ctx.strokeStyle = C.inkFaint
          ctx.lineWidth = 0.8
          ctx.setLineDash([1.5, 3])
          ctx.beginPath()
          ctx.moveTo(posRef.current.x, posRef.current.y)
          ctx.lineTo(destRef.current.x, destRef.current.y)
          ctx.stroke()
          ctx.setLineDash([])
        }

        // 城市标记与名字
        const labeled = new Set<string>()
        cities.forEach((c, idx) => {
          const isWedding = idx === home
          const isActive = idx === activeRef.current && !destRef.current
          const size = isActive ? 8 : 6
          ctx.fillStyle = isWedding ? C.rose : visitedRef.current.has(idx) ? C.ink : C.paper
          ctx.fillRect(c.px - size / 2, c.py - size / 2, size, size)
          ctx.strokeStyle = C.ink
          ctx.lineWidth = 1
          ctx.strokeRect(c.px - size / 2, c.py - size / 2, size, size)

          const key = `${c.name}@${c.label ?? 'right'}`
          if (labeled.has(key)) return
          labeled.add(key)
          const fontPx = 9 / s
          ctx.font = `${isActive ? 600 : 400} ${fontPx}px "Noto Serif SC", "Songti SC", serif`
          ctx.fillStyle = isActive ? C.ink : C.inkSoft
          const side = c.label ?? 'right'
          const gap = 6
          if (side === 'right') {
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(c.name, c.px + gap, c.py)
          } else if (side === 'left') {
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillText(c.name, c.px - gap, c.py)
          } else if (side === 'top') {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillText(c.name, c.px, c.py - gap)
          } else {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(c.name, c.px, c.py + gap)
          }
        })

        // 两位当事人
        const moving = destRef.current !== null
        const atWedding = !moving && activeRef.current === home
        const pose = moving ? 'walk' : atWedding ? 'raise' : 'idle'
        const fi = Math.floor(clock * WALK_FPS) % 4
        const groomImg = loadFrame(pose === 'walk' ? frameSrc('groom', 'walk', fi) : frameSrc('groom', pose))
        const brideImg = loadFrame(pose === 'walk' ? frameSrc('bride', 'walk', (fi + 2) % 4) : frameSrc('bride', pose))
        const flip = facingRef.current === 1
        const footY = posRef.current.y + 2
        // 行走时新郎在前、新娘跟在后面；站立时新郎在左、新娘在右
        const lead = moving ? facingRef.current : -1
        const gx = posRef.current.x + lead * 7
        const bx = posRef.current.x - lead * 7
        ctx.fillStyle = 'rgba(43,42,39,0.18)'
        ctx.beginPath()
        ctx.ellipse(posRef.current.x, footY, 13, 2.2, 0, 0, Math.PI * 2)
        ctx.fill()
        drawFrame(ctx, brideImg, bx, footY, CHAR_H * 0.94, flip)
        drawFrame(ctx, groomImg, gx, footY, CHAR_H, flip)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(arriveTimerRef.current)
      ro.disconnect()
    }
  }, [rebuild, cities, home])

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const s = scaleRef.current
    const x = (e.clientX - rect.left) / s
    const y = (e.clientY - rect.top) / s
    let best = -1
    // 手指点击判定半径（基准像素），约 18 个 CSS 像素
    let bestD = 24
    cities.forEach((c, idx) => {
      const d = Math.hypot(c.px - x, c.py - y)
      if (d < bestD) {
        bestD = d
        best = idx
      }
    })
    if (best >= 0) goTo(best)
  }

  const city = cities[active]

  return (
    <Section page="第叁版 · Page 03" title={journey.title}>
      <p className="font-serif text-[12px] leading-relaxed text-ink-soft">{journey.intro}</p>

      {/* 一个固定的框：顶栏、底栏在两种模式下位置不变，只有中间在"地图"与"相机页"之间切换 */}
      <div ref={stageRef} className="mt-4 scroll-mt-3 border border-ink bg-paper">
        <div className="flex items-baseline justify-between border-b border-rule px-3 py-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={mode === 'album' ? `album-${active}` : walking ? `to-${target}` : `at-${active}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`font-mono text-[9px] tracking-[0.25em] ${mode === 'album' ? 'text-accent' : 'text-ink-faint'}`}
            >
              {mode === 'album'
                ? city.date
                : walking
                  ? `两位当事人正在前往 ${cities[target].name}……`
                  : `两位当事人在 ${city.name}`}
            </motion.span>
          </AnimatePresence>
          <span className="shrink-0 font-mono text-[9px] tracking-[0.25em] text-ink-faint">
            已到访 {visited.size} / {cities.length}
          </span>
        </div>

        {/* 地图与相机页叠在同一格里：谁显示谁决定高度 */}
        <div className="grid [perspective:1400px] *:col-start-1 *:row-start-1">
          <motion.div
            initial={false}
            animate={
              mode === 'map'
                ? { opacity: 1, rotateY: 0, x: 0, display: 'block' }
                : { opacity: 0, rotateY: -40, x: -16, display: 'none' }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center' }}
          >
            <div ref={wrapRef} className="relative w-full border-b border-rule">
              <canvas
                ref={canvasRef}
                onClick={onCanvasClick}
                data-map
                className="block cursor-pointer [touch-action:manipulation]"
              />
              <div className="pointer-events-none absolute right-[1.6%] bottom-[2.4%] w-[10.4%] text-center font-mono text-[7px] leading-none tracking-[0.1em] text-ink-faint">
                南海诸岛
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-3 py-3">
              {cities.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`border px-2.5 py-1 font-serif text-[11px] tracking-[0.15em] whitespace-nowrap ${
                    idx === active && !walking
                      ? 'border-ink bg-ink text-paper'
                      : idx === home
                        ? 'border-rose text-ink'
                        : visited.has(idx)
                          ? 'border-ink-soft text-ink'
                          : 'border-rule text-ink-soft'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {mode === 'album' && (
              <CityAlbum
                key={active}
                city={city}
                stop={active + 1}
                lightboxOpen={lightbox !== null}
                onOpen={setLightbox}
              />
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          disabled={mode === 'map' && walking}
          onClick={() => setMode(mode === 'map' ? 'album' : 'map')}
          className="flex w-full items-center justify-between border-t border-ink px-3 py-2.5 font-serif text-[12px] tracking-[0.15em] active:bg-paper-deep disabled:text-ink-faint"
        >
          <span>{mode === 'map' ? (walking ? '到站后自动翻开这一页' : `翻开 ${city.name} 这一页 →`) : '← 回到地图，去下一站'}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-ink-faint">还有 {cities.length - visited.size} 站</span>
        </button>
      </div>

      <Lightbox
        photos={city.photos ?? []}
        index={lightbox}
        onChange={setLightbox}
        onClose={() => setLightbox(null)}
      />
    </Section>
  )
}
