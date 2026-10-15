import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store/useApp'
import { useL } from '../i18n'
import { track } from '../analytics'
import RecentRepos from './RecentRepos'
import ContactForm from './ContactForm'

/** Paper-style modal sheet used for the CV and the contact card. */
function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const { t } = useL()
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    return () => prev?.focus?.()
  }, [])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__pin" aria-hidden />
        <button ref={closeBtn} className="sheet__close" onClick={onClose} aria-label={t.close}>
          ✕
        </button>
        {children}
      </section>
    </div>
  )
}

function CV() {
  const { t, about, cv, projects, cvPdf } = useL()
  return (
    <>
      <h2 className="sheet__title">{about.name}</h2>
      <p className="sheet__sub">
        {about.title} · {about.location}
      </p>
      <p>{about.summary}</p>
      <p className="sheet__row">
        <a className="sheet__btn" href={cvPdf} download onClick={() => track('CV downloaded', { from: 'cork board' })}>
          {t.downloadPdf}
        </a>
        <a className="sheet__btn" href={about.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
      </p>
      <h3>{t.experience}</h3>
      {cv.experience.map((e) => (
        <div key={e.title} className="sheet__item">
          <strong>{e.title}</strong> —{' '}
          {e.href ? (
            <a href={e.href} target="_blank" rel="noreferrer">
              {e.place}
            </a>
          ) : (
            e.place
          )}{' '}
          <em>({e.when})</em>
          <div>{e.detail}</div>
        </div>
      ))}
      <h3>{t.education}</h3>
      {cv.education.map((e) => (
        <div key={e.title} className="sheet__item">
          <strong>{e.title}</strong> — {e.place} <em>({e.when})</em>
        </div>
      ))}
      <h3>{t.focus}</h3>
      <ul>
        {cv.focus.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <h3>{t.recentGithub}</h3>
      <RecentRepos />
      <h3>{t.projects}</h3>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.pitch}
          </li>
        ))}
      </ul>
    </>
  )
}

function Contact() {
  const { t, contact } = useL()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${contact.email}`
    }
  }
  return (
    <>
      <h2 className="sheet__title">{t.openForWork}</h2>
      <p>{contact.pitch}</p>
      <h3>{t.sendMessage}</h3>
      <ContactForm />
      <h3>{t.email}</h3>
      <p className="sheet__row">
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <button className="sheet__btn" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
      </p>
      <h3>{t.profiles}</h3>
      <ul>
        {contact.links.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Panels() {
  const { t } = useL()
  const panel = useApp((s) => s.panel)
  const setPanel = useApp((s) => s.setPanel)
  if (!panel) return null
  const close = () => setPanel(null)
  return (
    <Sheet title={panel === 'cv' ? t.cvTitle : t.contactTitle} onClose={close}>
      {panel === 'cv' ? <CV /> : <Contact />}
    </Sheet>
  )
}
