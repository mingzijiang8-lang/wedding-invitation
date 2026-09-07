// 四种配文样式各截一张（漳州站第 1 张照片带配文，第 2 张不带）：node scripts/shot-captions.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const styles = ['lcd-bar', 'subtitle', 'cutline', 'print']
for (const s of styles) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await ctx.newPage()
  await page.addInitScript((v) => localStorage.setItem('captionStyle', v), s)
  await page.goto(process.argv[2] ?? 'http://localhost:5180', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '轻触翻开本报' }).tap()
  await page.getByText('配文样式').locator('..').getByRole('button').tap()
  await page.waitForTimeout(1300)
  await page.getByRole('button', { name: '漳州', exact: true }).tap()
  await page.waitForTimeout(1500)
  await page.locator('[data-map]').evaluate((el) => el.closest('.border-ink').scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(500)
  await page.screenshot({ path: `shots/cap-${s}-1.png` })
  await page.getByRole('button', { name: '下一张' }).first().tap()
  await page.waitForTimeout(700)
  await page.screenshot({ path: `shots/cap-${s}-2.png` })
  await ctx.close()
}
await browser.close()
