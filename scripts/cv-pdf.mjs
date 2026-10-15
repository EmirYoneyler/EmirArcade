// Render dist/cv.html (written by `npm run build`) to public/emir-yoneyler-cv.pdf.
// Needs Playwright with Chromium: `npm run build && npm run cv:pdf`.
// Set PLAYWRIGHT_MODULE to a full path if playwright is installed globally.
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(pathToFileURL(resolve('dist/cv.html')).href, { waitUntil: 'networkidle' })
await page.pdf({ path: resolve('public/emir-yoneyler-cv.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true })
await browser.close()
console.log('wrote public/emir-yoneyler-cv.pdf')
