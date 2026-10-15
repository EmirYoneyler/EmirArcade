/**
 * Build-time entry (vite build --ssr). Renders the classic view and the
 * <head> tags to strings; scripts/prerender.mjs pastes them into index.html.
 */
import { renderToString } from 'react-dom/server'
import ClassicView from './classic/ClassicView'
import { about, projects, site, skills } from './data/content'
import { projectPath } from './share'
import { localized, type Lang } from './i18n'

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
    sameAs: [...about.github.map((g) => g.href), about.linkedin],
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

/** Head tags for one project's own page (/projects/<id>), used for link previews. */
export function projectHead(id: string) {
  const p = projects.find((x) => x.id === id)!
  const url = site.url.replace(/\/$/, '') + projectPath(id)
  const title = `${p.title} — ${about.name}`
  const img = p.media[0] ? site.url.replace(/\/$/, '') + p.media[0] : site.url.replace(/\/$/, '') + site.ogImage
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(p.pitch)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="author" content="${esc(about.name)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${esc(about.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(p.pitch)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:alt" content="${esc(`${p.title} screenshot`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(p.pitch)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
  ].join('\n    ')
}

export const projectIds = projects.map((p) => p.id)

const h = (s: string) => esc(s).replace(/>/g, '&gt;')
const bare = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/** A one-page, print-ready CV (A4). scripts/cv-pdf.mjs turns it into the PDF. */
const CV_HEAD = {
  en: { profile: 'Profile', experience: 'Experience', projects: 'Selected projects', education: 'Education', skills: 'Skills' },
  tr: { profile: 'Profil', experience: 'Deneyim', projects: 'Seçilmiş projeler', education: 'Eğitim', skills: 'Yetenekler' },
}

export function cvHtml(lang: Lang = 'en') {
  const { about, cv, projects, t } = localized(lang)
  const H = CV_HEAD[lang]
  const site_ = site.url.replace(/\/$/, '')
  const contacts = [
    `<a href="mailto:${about.email}">${about.email}</a>`,
    `<a href="${about.linkedin}">${bare(about.linkedin)}</a>`,
    ...about.github.map((g) => `<a href="${g.href}">${bare(g.href)}</a>`),
    `<a href="${site_}">${bare(site_)}</a>`,
  ].join('<span class="dot">·</span>')
  const proj = projects
    .map((p) => {
      const link = p.links[0]
      return `<div class="item">
        <div class="row"><strong>${h(p.title)}</strong><span class="meta">${h(t.statusPlain[p.status])}</span></div>
        <p>${h(p.pitch)} ${h(p.caseStudy.outcome)}</p>
        <p class="stack">${h(p.stack.join(' · '))}${link ? ` — <a href="${link.href}">${h(bare(link.href))}</a>` : ''}</p>
      </div>`
    })
    .join('')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${h(about.name)} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 12mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 9.4pt/1.4 'IBM Plex Sans', system-ui, sans-serif; color: #1f2421; }
a { color: inherit; text-decoration: none; }
h1 { font: 600 21pt/1.1 'IBM Plex Mono', monospace; margin: 0; letter-spacing: -.01em; }
.sub { margin: 3px 0 7px; color: #9a4a1c; font-weight: 500; }
.contacts { font-size: 8.8pt; color: #4a4f4b; }
.dot { margin: 0 6px; color: #b9b1a3; }
h2 { font: 600 8.6pt 'IBM Plex Mono', monospace; letter-spacing: .12em; text-transform: uppercase; color: #9a4a1c;
  margin: 15px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #e3ddd2; }
p { margin: 0; }
.item { margin: 0 0 8px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.meta { color: #6b706c; font-size: 8.6pt; white-space: nowrap; }
.stack { color: #6b706c; font-size: 8.4pt; margin-top: 1px; }
ul { margin: 0; padding-left: 15px; }
li { margin: 1px 0; }
</style></head><body>
<header>
  <h1>${h(about.name)}</h1>
  <p class="sub">${h(about.title)} · ${h(about.location)}</p>
  <p class="contacts">${contacts}</p>
</header>
<h2>${H.profile}</h2>
<p>${h(about.summary)}</p>
<h2>${H.experience}</h2>
${cv.experience
  .map((e) => `<div class="item"><div class="row"><strong>${h(e.title)} — ${e.href ? `<a href="${e.href}">${h(e.place)}</a>` : h(e.place)}</strong><span class="meta">${h(e.when)}</span></div><p>${h(e.detail)}</p></div>`)
  .join('')}
<h2>${H.projects}</h2>
${proj}
<h2>${H.education}</h2>
${cv.education
  .map((e) => `<div class="item"><div class="row"><strong>${h(e.title)} — ${h(e.place)}</strong><span class="meta">${h(e.when)}</span></div></div>`)
  .join('')}
<h2>${H.skills}</h2>
<p><strong>${h(skills.join(' · '))}</strong></p>
<ul>${cv.focus.map((f) => `<li>${h(f)}</li>`).join('')}</ul>
</body></html>`
}
