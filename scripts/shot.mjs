// 本地预览截图：node scripts/shot.mjs [url]
// 需要本机已安装 playwright（npx playwright install chromium）
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5180'
mkdirSync('shots', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
page.on('pageerror', (e) => console.error('pageerror:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1600)
await page.screenshot({ path: 'shots/0-cover.png' })

await page.getByRole('button', { name: /翻开/ }).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: 'shots/1-front.png' })

const h = await page.evaluate(() => document.documentElement.scrollHeight)
console.log('page height', h)
let i = 2
for (let y = 844; y < h; y += 800) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `shots/${i}-scroll-${y}.png` })
  i++
}
// 等地图自动巡游一段时间再拍一张
const map = page.locator('canvas[data-map]')
await map.scrollIntoViewIfNeeded()
await page.waitForTimeout(2500)
await page.screenshot({ path: `shots/${i}-map-walking.png` })
await page.waitForTimeout(12000)
await page.screenshot({ path: `shots/${i + 1}-map-tour.png` })
// 点击第一个城市，验证可以往回走；再等到终点看举手姿势
await page.getByRole('button', { name: /1\s*大理/ }).click()
await page.waitForTimeout(6000)
await page.screenshot({ path: `shots/${i + 2}-map-back.png` })
await page.getByRole('button', { name: /4\s*漳州/ }).click()
await page.waitForTimeout(22000)
await page.screenshot({ path: `shots/${i + 3}-map-wedding.png` })

await browser.close()
