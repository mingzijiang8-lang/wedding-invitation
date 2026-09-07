// 核对足迹版：地图态、到站相机态、切回地图：node scripts/shot-album.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage()
await page.goto(process.argv[2] ?? 'http://localhost:5180', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '轻触翻开本报' }).tap()
await page.waitForTimeout(1300)
await page.locator('[data-map]').evaluate((el) => el.closest('.border-ink').scrollIntoView({ block: 'start' }))
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/album-0-map.png' })

await page.getByRole('button', { name: '漳州', exact: true }).tap()
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/album-1-open.png' })

await page.getByRole('button', { name: '下一张' }).first().tap()
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/album-2-next.png' })

await page.getByRole('button', { name: /回到地图/ }).tap()
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/album-3-back.png' })

await page.getByRole('button', { name: '厦门', exact: true }).tap()
await page.waitForTimeout(2800)
await page.screenshot({ path: 'shots/album-4-xiamen.png' })
await browser.close()
