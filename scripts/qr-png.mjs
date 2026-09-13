// 把链接生成一张二维码图片：node scripts/qr-png.mjs http://... → shots/qr.png
import qr from 'qrcode-terminal'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5180/'
const text = await new Promise((r) => qr.generate(url, { small: false }, r))
// qrcode-terminal 输出的是 ANSI 背景色块：[47m 白、[40m 黑，转成网格
const rows = text
  .split('\n')
  .filter((l) => l.includes('m'))
  .map((l) => [...l.matchAll(/\x1b\[(4[07])m/g)].map((m) => m[1] === '40'))
const size = rows.length
const cell = Math.floor(320 / size)
const cells = rows
  .map((row, y) => row.map((dark, x) => (dark ? `<i style="left:${x * cell}px;top:${y * cell}px"></i>` : '')).join(''))
  .join('')

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 420, height: 460 }, deviceScaleFactor: 2 })
await page.setContent(`<body style="margin:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:460px;font-family:-apple-system,sans-serif">
<div style="position:relative;width:${size * cell}px;height:${size * cell}px">${cells}</div>
<style>i{position:absolute;width:${cell}px;height:${cell}px;background:#111}</style>
<div style="margin-top:18px;font-size:13px;color:#333">${url}</div></body>`)
await page.screenshot({ path: 'shots/qr.png' })
await browser.close()
console.log('shots/qr.png')
