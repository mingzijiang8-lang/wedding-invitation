// 核对头版与赴宴指南文案：node scripts/shot-info.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage()
await page.goto(process.argv[2] ?? 'http://localhost:5180', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /翻开/ }).tap()
await page.waitForTimeout(1300)
await page.screenshot({ path: 'shots/info-front.png' })
await page.getByRole('heading', { name: '赴宴指南' }).scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/info-guide.png' })
await browser.close()
