import { useEffect, useRef } from 'react'
import { projects } from '../data/content'
import { useApp } from '../store/useApp'
import { goBack, stepProject } from '../flow'

/** Media paths are written root-relative; respect a non-root build base. */
const asset = (src: string) => import.meta.env.BASE_URL + src.replace(/^\//, '')

const STATUS_LABEL = { LIVE: 'LIVE', 'IN DEV': 'IN DEVELOPMENT', DONE: 'SHIPPED' } as const

/**
 * Full-screen project page that the camera "lands" in. Styled as the CRT
 * we just flew into: amber phosphor on black, scanlines, curved edges.
 */
export default function ProjectPage() {
  const view = useApp((s) => s.view)
  const id = useApp((s) => s.selectedProject)
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

  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  return (
    <div className="crt-page" data-open={open} ref={root} aria-hidden={!open}>
      <div className="crt-tube">
      <div className="crt-page__glass" ref={glass}>
        <article className="crt-page__content" key={p.id}>
          <header className="crt-head">
            <p className="crt-kicker">
              TAPE {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              <span className="crt-status" data-status={p.status}>
                {STATUS_LABEL[p.status]}
              </span>
            </p>
            <h1 ref={heading} tabIndex={-1}>
              {p.title}
            </h1>
            <p className="crt-pitch">{p.pitch}</p>
          </header>

          <dl className="crt-meta">
            <div>
              <dt>ROLE</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd>{STATUS_LABEL[p.status]}</dd>
            </div>
          </dl>

          <section>
            <h2>SCREENS</h2>
            {p.media.length ? (
              <div className="crt-media">
                {p.media.map((src, i) => (
                  <a key={src} href={asset(src)} target="_blank" rel="noreferrer" aria-label={`Open ${p.title} screenshot ${i + 1} full size`}>
                    <img src={asset(src)} alt={`${p.title} screenshot ${i + 1}`} loading={i ? 'lazy' : 'eager'} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="crt-media crt-media--empty" role="img" aria-label="Screenshots coming soon">
                <span>NO SIGNAL</span>
                <small>screenshots coming soon</small>
              </div>
            )}
          </section>

          <section>
            <h2>WHAT IT IS</h2>
            <p>{p.about}</p>
          </section>

          <section>
            <h2>HIGHLIGHTS</h2>
            <ul className="crt-list">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>STACK</h2>
            <ul className="crt-chips">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>LINKS</h2>
            {p.links.length ? (
              <ul className="crt-links">
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="crt-dim">Private or client repository — happy to walk through it on a call.</p>
            )}
          </section>
        </article>
      </div>

      <nav className="crt-bar" aria-label="Project navigation">
        <button onClick={() => stepProject(-1)} aria-label={`Previous project: ${prev.title}`}>
          ◀ PREV <span className="crt-bar__name">{prev.cartridge}</span>
        </button>
        <button className="crt-bar__back" onClick={goBack}>
          BACK <kbd>ESC</kbd>
        </button>
        <button onClick={() => stepProject(1)} aria-label={`Next project: ${next.title}`}>
          <span className="crt-bar__name">{next.cartridge}</span> NEXT ▶
        </button>
      </nav>

      <div className="crt-page__scan" aria-hidden />
      </div>
    </div>
  )
}
