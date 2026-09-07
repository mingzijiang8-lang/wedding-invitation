// 把一张浅色背景上的相机照片抠成透明底 PNG，并旋转成竖持姿态，同时找出 LCD 黑屏的矩形。
// 用法：node scripts/cutout-camera.mjs /tmp/cam/src.jpg public/camera-back.png
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const [src, out, bgLum = '95'] = process.argv.slice(2)
const data = `data:image/jpeg;base64,${readFileSync(src).toString('base64')}`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const result = await page.evaluate(async ([data, BG_LUM]) => {
  const img = new Image()
  img.src = data
  await img.decode()
  const W = img.naturalWidth
  const H = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const im = ctx.getImageData(0, 0, W, H)
  const d = im.data
  const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]

  // 1) 从四边洪水填充：亮的像素算背景
  const bg = new Uint8Array(W * H)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const k = y * W + x
    if (bg[k]) return
    if (lum(k * 4) < BG_LUM) return
    bg[k] = 1
    stack.push(k)
  }
  for (let x = 0; x < W; x++) {
    push(x, 0)
    push(x, H - 1)
  }
  for (let y = 0; y < H; y++) {
    push(0, y)
    push(W - 1, y)
  }
  while (stack.length) {
    const k = stack.pop()
    const x = k % W
    const y = (k - x) / W
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }
  // 2) 边缘羽化：背景邻近的前景像素按亮度渐变
  for (let k = 0; k < W * H; k++) {
    if (bg[k]) {
      d[k * 4 + 3] = 0
      continue
    }
    const x = k % W
    const y = (k - x) / W
    let nearBg = false
    for (let dy = -2; dy <= 2 && !nearBg; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && bg[yy * W + xx]) {
          nearBg = true
          break
        }
      }
    if (nearBg) {
      const l = lum(k * 4)
      d[k * 4 + 3] = Math.max(0, Math.min(255, Math.round(255 * (1 - (l - 40) / 80))))
    }
  }
  // 3) 前景包围盒
  let x0 = W, y0 = H, x1 = 0, y1 = 0
  for (let k = 0; k < W * H; k++) {
    if (d[k * 4 + 3] > 8) {
      const x = k % W
      const y = (k - x) / W
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  // 4) LCD：机身内最大的一块"很黑"的区域。按列/行统计极暗像素占比，取连续高占比区间
  const dark = (x, y) => lum((y * W + x) * 4) < 28 && !bg[y * W + x]
  const colFrac = new Float32Array(W)
  for (let x = x0; x <= x1; x++) {
    let n = 0
    for (let y = y0; y <= y1; y++) if (dark(x, y)) n++
    colFrac[x] = n / (y1 - y0 + 1)
  }
  const rowFrac = new Float32Array(H)
  for (let y = y0; y <= y1; y++) {
    let n = 0
    for (let x = x0; x <= x1; x++) if (dark(x, y)) n++
    rowFrac[y] = n / (x1 - x0 + 1)
  }
  const longest = (arr, from, to, th) => {
    let best = [0, 0]
    let s = -1
    for (let i = from; i <= to + 1; i++) {
      const ok = i <= to && arr[i] >= th
      if (ok && s < 0) s = i
      if (!ok && s >= 0) {
        if (i - s > best[1] - best[0]) best = [s, i - 1]
        s = -1
      }
    }
    return best
  }
  const [lx0, lx1] = longest(colFrac, x0, x1, 0.3)
  const [ly0, ly1] = longest(rowFrac, y0, y1, 0.3)

  ctx.putImageData(im, 0, 0)
  // 5) 裁切 + 逆时针转 90°（竖持机身，按键在上）
  const cw = x1 - x0 + 1
  const ch = y1 - y0 + 1
  const o = document.createElement('canvas')
  o.width = ch
  o.height = cw
  const octx = o.getContext('2d')
  octx.translate(0, cw)
  octx.rotate(-Math.PI / 2)
  octx.drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch)

  // LCD 在旋转后的坐标（相对百分比）：原 (x,y) → 新 (y - y0, cw - (x - x0))
  const nx0 = (ly0 - y0) / ch
  const nx1 = (ly1 - y0 + 1) / ch
  const ny0 = (cw - (lx1 - x0 + 1)) / cw
  const ny1 = (cw - (lx0 - x0)) / cw
  return {
    png: o.toDataURL('image/png'),
    size: [o.width, o.height],
    lcd: { left: +(nx0 * 100).toFixed(2), top: +(ny0 * 100).toFixed(2), width: +((nx1 - nx0) * 100).toFixed(2), height: +((ny1 - ny0) * 100).toFixed(2) },
  }
}, [data, Number(bgLum)])
await browser.close()

writeFileSync(out, Buffer.from(result.png.split(',')[1], 'base64'))
console.log(JSON.stringify({ size: result.size, lcd: result.lcd }))
