// Render dist/cv.html and dist/cv-tr.html (written by `npm run build`) to
// public/emir-yoneyler-cv.pdf and public/emir-yoneyler-cv-tr.pdf.
// Needs Playwright with Chromium: `npm run build && npm run cv:pdf`.
// Set PLAYWRIGHT_MODULE to a full path if playwright is installed globally.
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const browser = await chromium.launch()
const page = await browser.newPage()
for (const [html, pdf] of [
  ['dist/cv.html', 'public/emir-yoneyler-cv.pdf'],
  ['dist/cv-tr.html', 'public/emir-yoneyler-cv-tr.pdf'],
]) {
  await page.goto(pathToFileURL(resolve(html)).href, { waitUntil: 'networkidle' })
  await page.pdf({ path: resolve(pdf), format: 'A4', preferCSSPageSize: true, printBackground: true })
  console.log(`wrote ${pdf}`)
}
await browser.close()
