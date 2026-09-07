// 核对到站相册页：node scripts/shot-album.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage()
await page.goto(process.argv[2] ?? 'http://localhost:5180', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '轻触翻开本报' }).tap()
await page.waitForTimeout(1300)
await page.locator('[data-map]').scrollIntoViewIfNeeded()
await page.waitForTimeout(600)

await page.getByRole('button', { name: '漳州', exact: true }).tap()
await page.waitForTimeout(700)
await page.locator('article').first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/album-1-open.png' })

// 等自动翻：3.6s 间隔，0.42s 飞出
await page.waitForTimeout(3600 + 200)
await page.screenshot({ path: 'shots/album-2-flying.png' })
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/album-3-next.png' })

// 手指往左拨一张
const stack = page.locator('img[src*="zhangzhou"]').nth(1)
const box = await stack.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + box.width / 2 - 60, box.y + box.height / 2 + 5, { steps: 6 })
await page.screenshot({ path: 'shots/album-4-dragging.png' })
await page.mouse.move(box.x + box.width / 2 - 140, box.y + box.height / 2 + 10, { steps: 6 })
await page.mouse.up()
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/album-5-after-drag.png' })

await page.getByRole('button', { name: /回到地图/ }).tap()
await page.waitForTimeout(700)
await page.getByRole('button', { name: '厦门', exact: true }).tap()
await page.waitForTimeout(3000)
await page.screenshot({ path: 'shots/album-6-xiamen.png' })
await browser.close()
