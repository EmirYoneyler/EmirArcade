/**
 * Build-time entry (vite build --ssr). Renders the classic view and the
 * <head> tags to strings; scripts/prerender.mjs pastes them into index.html.
 */
import { renderToString } from 'react-dom/server'
import ClassicView from './classic/ClassicView'
import { about, projects, site } from './data/content'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export const siteUrl = site.url

export function render() {
  return renderToString(<ClassicView />)
}

export function head() {
  const title = `${about.name} — ${about.title}`
  const desc = `${about.name}: software engineer building backends in Java/Spring Boot and Go, and full-stack apps with React and Python. Explore the portfolio as a cozy late-night 3D arcade.`
  const url = site.url.replace(/\/$/, '')
  const img = `${url}${site.ogImage}`
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: about.name,
    jobTitle: about.title,
    email: `mailto:${about.email}`,
    url,
    sameAs: about.github.map((g) => g.href),
    alumniOf: 'Istanbul Aydın University',
    knowsAbout: ['Java', 'Spring Boot', 'Go', 'React', 'Python', 'PostgreSQL', 'Docker'],
  }
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${url}/" />`,
    `<meta name="author" content="${esc(about.name)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(about.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url}/" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="A cozy low-poly arcade room at night with three cabinets, a claw machine and a jukebox" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
    `<!-- ${projects.length} projects pre-rendered below -->`,
  ].join('\n    ')
}
