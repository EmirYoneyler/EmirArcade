import { useEffect, useState } from 'react'
import { about, contact, cv, projects, skills } from '../data/content'
import { useApp } from '../store/useApp'
import ByteMark from './ByteMark'
import RecentRepos from '../ui/RecentRepos'
import ContactForm from '../ui/ContactForm'
import NowListening from '../ui/NowListening'

const STATUS = { LIVE: 'Live', 'IN DEV': 'In development', DONE: 'Shipped' } as const

/**
 * The classic portfolio: one fast, plain, readable page using the same
 * content as the arcade. It is also pre-rendered into index.html at build
 * time, so crawlers and no-JS visitors get the full content.
 */
export default function ClassicView() {
  const setMode = useApp((s) => s.setMode)
  // client-only: was classic picked for them (small/weak device)?
  const [auto, setAuto] = useState(false)
  useEffect(() => setAuto(useApp.getState().modeAuto), [])

  return (
    <div className="classic">
      <a className="skip" href="#projects">
        Skip to projects
      </a>
      <header className="c-header">
        <div className="c-wrap c-header__row">
          <a href="#top" className="c-brand" aria-label="Home">
            <ByteMark size={28} />
            <span>EMIR</span>
          </a>
          <nav aria-label="Sections" className="c-nav">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </nav>
          <button className="c-btn c-btn--ghost" onClick={() => setMode('arcade')}>
            ▶ 3D arcade
          </button>
        </div>
      </header>

      <main id="top" className="c-wrap">
        <section className="c-hero" aria-labelledby="name">
          <p className="c-kicker">{about.title} · {about.location}</p>
          <h1 id="name">{about.name}</h1>
          <p className="c-lead">{about.summary}</p>
          <NowListening />
          <div className="c-actions">
            <a className="c-btn" href={`mailto:${about.email}`}>
              Email me
            </a>
            {about.github.map((g) => (
              <a key={g.href} className="c-btn c-btn--ghost" href={g.href} target="_blank" rel="noreferrer">
                GitHub · {g.label}
              </a>
            ))}
          </div>
          {auto && (
            <aside className="c-try">
              <ByteMark size={40} />
              <div>
                <strong>This portfolio is also a tiny 3D arcade.</strong>
                <p>Your browser doesn't support WebGL, so you're seeing the classic version. Open it in a recent Chrome, Firefox or Safari to play.</p>
              </div>
            </aside>
          )}
        </section>

        <section id="about" className="c-section" aria-labelledby="about-h">
          <h2 id="about-h">About</h2>
          <div className="c-grid2">
            <div>
              <h3>Experience</h3>
              {cv.experience.map((e) => (
                <div key={e.title} className="c-entry">
                  <div className="c-entry__head">
                    <strong>{e.title}</strong>
                    <span>{e.when}</span>
                  </div>
                  <div className="c-muted">{e.place}</div>
                  <p>{e.detail}</p>
                </div>
              ))}
            </div>
            <div>
              <h3>Education</h3>
              {cv.education.map((e) => (
                <div key={e.title} className="c-entry">
                  <div className="c-entry__head">
                    <strong>{e.title}</strong>
                    <span>{e.when}</span>
                  </div>
                  <div className="c-muted">{e.place}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="c-section" aria-labelledby="projects-h">
          <h2 id="projects-h">Projects</h2>
          <div className="c-projects">
            {projects.map((p, i) => (
              <article key={p.id} className="c-card" aria-labelledby={`p-${p.id}`}>
                <div className="c-card__top">
                  <span className="c-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="c-status" data-status={p.status}>
                    {STATUS[p.status]}
                  </span>
                </div>
                <h3 id={`p-${p.id}`}>{p.title}</h3>
                <p className="c-pitch">{p.pitch}</p>
                <p className="c-muted c-role">{p.role}</p>
                <p>{p.about}</p>
                <ul className="c-list">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <ul className="c-chips" aria-label="Tech stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {p.links.length > 0 && (
                  <div className="c-links">
                    {p.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="c-section c-github" aria-labelledby="github-h">
          <h2 id="github-h">Recently on GitHub</h2>
          <RecentRepos className="recent-repos c-repos" />
        </section>

        <section id="skills" className="c-section" aria-labelledby="skills-h">
          <h2 id="skills-h">Skills</h2>
          <ul className="c-chips c-chips--big">
            {skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <ul className="c-list">
            {cv.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section id="contact" className="c-section c-contact" aria-labelledby="contact-h">
          <h2 id="contact-h">Contact</h2>
          <p className="c-lead">{contact.pitch}</p>
          <p>
            <a className="c-email" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </p>
          <ContactForm />
          <p className="c-muted">
            {contact.links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && ' · '}
                <a href={l.href} target="_blank" rel="noreferrer">
                  github.com/{l.label}
                </a>
              </span>
            ))}
          </p>
        </section>
      </main>

      <footer className="c-footer c-wrap">
        <ByteMark size={20} />
        <span>Built by hand in Istanbul. BYTE says hi.</span>
      </footer>
    </div>
  )
}
