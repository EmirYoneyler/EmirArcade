// Paste the pre-rendered classic view + head tags into dist/index.html,
// then write robots.txt and sitemap.xml for the configured site URL.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const ssr = await import(pathToFileURL(resolve('dist-ssr/prerender.js')).href)

const file = resolve(dist, 'index.html')
const html = readFileSync(file, 'utf8')
  .replace('<!--app-head-->', ssr.head())
  .replace('<!--app-html-->', ssr.render())
writeFileSync(file, html)

const url = ssr.siteUrl.replace(/\/$/, '')
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`)
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><changefreq>monthly</changefreq></url>\n</urlset>\n`,
)
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
console.log(`prerendered classic view (${(html.length / 1024).toFixed(1)} kB) for ${url}`)
