import { useEffect, useRef, useState } from 'react'
import { useL } from '../i18n'
import { useApp } from '../store/useApp'
import { goBack, stepProject } from '../flow'
import { projectUrl } from '../share'
import { track } from '../analytics'

/** Media paths are written root-relative; respect a non-root build base. */
const asset = (src: string) => import.meta.env.BASE_URL + src.replace(/^\//, '')

/**
 * Full-screen project page that the camera "lands" in. Styled as the CRT
 * we just flew into: amber phosphor on black, scanlines, curved edges.
 */
export default function ProjectPage() {
  const view = useApp((s) => s.view)
  const id = useApp((s) => s.selectedProject)
  const { t, projects } = useL()
  const open = view === 'project'
  const index = Math.max(0, projects.findIndex((p) => p.id === id))
  const p = projects[index]
  const heading = useRef<HTMLHeadingElement>(null)
  const glass = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)

  // React 18 has no `inert` prop; keep the hidden page out of the Tab order
  useEffect(() => {
    root.current?.toggleAttribute('inert', !open)
  }, [open])

  // move focus into the page when it opens / switches, and reset scroll
  useEffect(() => {
    if (!open) return
    glass.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [open, id])

  useEffect(() => {
    if (open && id) track('Project opened', { project: id })
  }, [open, id])

  const [copied, setCopied] = useState(false)
  useEffect(() => setCopied(false), [id])
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl(p.id))
      setCopied(true)
    } catch {
      window.prompt(t.copyPrompt, projectUrl(p.id))
    }
  }

  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  return (
    <div className="crt-page" data-open={open} ref={root} aria-hidden={!open}>
      <div className="crt-tube">
      <div className="crt-page__glass" ref={glass}>
        <article className="crt-page__content" key={p.id}>
          <header className="crt-head">
            <p className="crt-kicker">
              {t.tape.toUpperCase()} {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              <span className="crt-status" data-status={p.status}>
                {t.status[p.status]}
              </span>
            </p>
            <h1 ref={heading} tabIndex={-1}>
              {p.title}
            </h1>
            <p className="crt-pitch">{p.pitch}</p>
          </header>

          <dl className="crt-meta">
            <div>
              <dt>{t.role}</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>{t.statusH}</dt>
              <dd>{t.status[p.status]}</dd>
            </div>
          </dl>

          <section>
            <h2>{t.screens}</h2>
            {p.media.length ? (
              <div className="crt-media">
                {p.media.map((src, i) => (
                  <a key={src} href={asset(src)} target="_blank" rel="noreferrer" aria-label={t.openShot(p.title, i + 1)}>
                    <img src={asset(src)} alt={t.shot(p.title, i + 1)} loading={i ? 'lazy' : 'eager'} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="crt-media crt-media--empty" role="img" aria-label={t.comingSoon}>
                <span>{t.noSignal}</span>
                <small>{t.comingSoon}</small>
              </div>
            )}
          </section>

          <section>
            <h2>{t.caseStudy}</h2>
            <dl className="crt-case">
              <div>
                <dt>{t.problem.toUpperCase()}</dt>
                <dd>{p.caseStudy.problem}</dd>
              </div>
              <div>
                <dt>{t.approach.toUpperCase()}</dt>
                <dd>{p.caseStudy.approach}</dd>
              </div>
              <div>
                <dt>{t.outcome.toUpperCase()}</dt>
                <dd>{p.caseStudy.outcome}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>{t.whatItIs}</h2>
            <p>{p.about}</p>
          </section>

          <section>
            <h2>{t.highlights}</h2>
            <ul className="crt-list">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t.stack}</h2>
            <ul className="crt-chips">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t.links}</h2>
            <ul className="crt-links">
              {p.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
              <li>
                <button className="crt-share" onClick={copyLink} aria-live="polite">
                  {copied ? t.linkCopied : t.copyLink}
                </button>
              </li>
            </ul>
          </section>
        </article>
      </div>

      <nav className="crt-bar" aria-label={t.projectNav}>
        <button onClick={() => stepProject(-1)} aria-label={t.prevProject(prev.title)}>
          ◀ {t.prev} <span className="crt-bar__name">{prev.cartridge}</span>
        </button>
        <button className="crt-bar__back" onClick={goBack}>
          {t.back} <kbd>ESC</kbd>
        </button>
        <button onClick={() => stepProject(1)} aria-label={t.nextProject(next.title)}>
          <span className="crt-bar__name">{next.cartridge}</span> {t.next} ▶
        </button>
      </nav>

      <div className="crt-page__scan" aria-hidden />
      </div>
    </div>
  )
}
