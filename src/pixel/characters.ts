/**
 * 新郎新娘的精灵帧，来自婚礼抽奖项目（public/sprites/）。
 * 行走帧原图面朝左，向右走时需要镜像。
 */
export type Who = 'groom' | 'bride'
export type Pose = 'idle' | 'raise' | 'walk'

const prefix: Record<Who, string> = { groom: 'g', bride: 'b' }

export function frameSrc(who: Who, pose: Exclude<Pose, 'walk'>): string
export function frameSrc(who: Who, pose: 'walk', index: number): string
export function frameSrc(who: Who, pose: Pose, index = 0) {
  if (pose === 'walk') return `/sprites/${prefix[who]}_sw${(index % 4) + 1}.png`
  return `/sprites/${prefix[who]}_${pose}.png`
}

export const WALK_FPS = 8

const cache = new Map<string, HTMLImageElement>()

/** Canvas 用：同步取图，未加载完时 complete 为 false，绘制前需检查 */
export function loadFrame(src: string) {
  let img = cache.get(src)
  if (!img) {
    img = new Image()
    img.src = src
    cache.set(src, img)
  }
  return img
}

export function preloadAll() {
  for (const who of ['groom', 'bride'] as Who[]) {
    loadFrame(frameSrc(who, 'idle'))
    loadFrame(frameSrc(who, 'raise'))
    for (let i = 0; i < 4; i++) loadFrame(frameSrc(who, 'walk', i))
  }
}

/** 以"脚底中心"为锚点把一帧画到 canvas 上 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  footX: number,
  footY: number,
  height: number,
  flip = false,
) {
  if (!img.complete || !img.naturalWidth) return
  const w = (img.naturalWidth / img.naturalHeight) * height
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (flip) {
    ctx.translate(footX, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(img, -w / 2, footY - height, w, height)
  } else {
    ctx.drawImage(img, footX - w / 2, footY - height, w, height)
  }
  ctx.restore()
}
