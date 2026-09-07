// 核对到站相册页：node scripts/shot-album.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage()
await page.goto(process.argv[2] ?? 'http://localhost:5180', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '轻触翻开本报' }).tap()
await page.waitForTimeout(1300)
const map = page.locator('[data-map]')
await map.scrollIntoViewIfNeeded()
await page.waitForTimeout(800)
await page.screenshot({ path: 'shots/album-0-map.png' })

// 点当前所在城市 → 直接翻开相册页
await page.getByRole('button', { name: '漳州', exact: true }).tap()
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/album-1-open.png' })

// 翻一页
await page.getByRole('button', { name: '下一张' }).tap()
await page.waitForTimeout(350)
await page.screenshot({ path: 'shots/album-2-flipping.png' })
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/album-3-page2.png' })

// 回到地图，去厦门
await page.getByRole('button', { name: /回到地图/ }).tap()
await page.waitForTimeout(700)
await page.getByRole('button', { name: '厦门', exact: true }).tap()
await page.waitForTimeout(400)
await page.screenshot({ path: 'shots/album-4-walking.png' })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'shots/album-5-xiamen.png' })
await browser.close()
