// 只截地图区域，用来检查城市标签是否重叠：node scripts/shot-map.mjs [url]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5180'
mkdirSync('shots', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
await page.goto(url, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /翻开/ }).click()
await page.waitForTimeout(1200)
const map = page.locator('canvas[data-map]')
await map.scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await map.screenshot({ path: 'shots/map-only.png' })
// 点到最后一站，等走完
const buttons = page.locator('button', { hasText: /^\d+\s*\S+$/ })
await buttons.last().click()
await page.waitForTimeout(40000)
await map.screenshot({ path: 'shots/map-only-end.png' })
await browser.close()
