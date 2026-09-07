// 核对到站相机页：node scripts/shot-album.mjs
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
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/album-1-open.png' })

await page.getByRole('button', { name: '下一张' }).first().tap()
await page.waitForTimeout(200)
await page.screenshot({ path: 'shots/album-2-af.png' })
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/album-3-next.png' })

await page.getByRole('button', { name: /回到地图/ }).tap()
await page.waitForTimeout(700)
await page.getByRole('button', { name: '厦门', exact: true }).tap()
await page.waitForTimeout(2600)
await page.locator('article').first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'shots/album-4-xiamen.png' })
await browser.close()
