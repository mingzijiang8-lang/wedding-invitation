// 在机背图上叠出 LCD 区和按键热区，用来校准 CameraBack.tsx 里的百分比：node scripts/calibrate-camera.mjs
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const src = readFileSync('src/components/CameraBack.tsx', 'utf8')
const lcd = JSON.parse(src.match(/const LCD = (\{[^}]+\})/)[1].replace(/(\w+):/g, '"$1":'))
const keys = Object.fromEntries(
  [...src.matchAll(/(\w+): \{ x: ([\d.]+), y: ([\d.]+) \}/g)].map((m) => [m[1], { x: +m[2], y: +m[3] }]),
)
const data = `data:image/webp;base64,${readFileSync('public/camera-back.webp').toString('base64')}`
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 700, height: 1100 } })
const dots = Object.entries(keys)
  .map(
    ([k, p]) =>
      `<div style="position:absolute;left:${p.x}%;top:${p.y}%;width:7.5%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:rgba(0,200,255,.45);outline:1px solid #fff;font:10px monospace;color:#fff;display:flex;align-items:center;justify-content:center">${k}</div>`,
  )
  .join('')
await page.setContent(
  `<body style="margin:0;background:#222"><div style="position:relative;width:700px"><img src="${data}" style="display:block;width:700px"><div style="position:absolute;left:${lcd.left}%;top:${lcd.top}%;width:${lcd.width}%;height:${lcd.height}%;background:rgba(255,0,0,.45);outline:1px solid #fff"></div>${dots}</div></body>`,
)
await page.waitForTimeout(300)
await page.screenshot({ path: 'shots/camera-calibrate.png', fullPage: true })
await browser.close()
console.log('shots/camera-calibrate.png')
