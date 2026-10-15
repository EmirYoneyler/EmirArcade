import { useEffect, useState } from 'react'
import { useApp } from '../store/useApp'
import { site } from '../data/content'
import { track } from '../analytics'
import { SECRETS, SECRET_COUNT, SECRET_HINTS, type SecretId } from '../data/secrets'

/** Pixel speaker icon (no emoji): cone + waves when on, a cross when muted. */
function Speaker({ on }: { on: boolean }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" shapeRendering="crispEdges" aria-hidden>
      <path fill="currentColor" d="M0 4h3v6H0zM3 3h2v8H3zM5 2h2v10H5zM7 1h2v12H7z" />
      {on ? (
        <path fill="currentColor" d="M11 5h1v4h-1zM13 3h1v8h-1zM15 1h1v12h-1z" />
      ) : (
        <path fill="currentColor" d="M11 4h2v2h-2zM13 6h2v2h-2zM15 8h2v2h-2zM15 4h2v2h-2zM11 8h2v2h-2z" />
      )}
    </svg>
  )
}

/** Top-right cluster: secrets counter, mute toggle, and discovery toasts. */
export default function Corner() {
  const soundOn = useApp((s) => s.soundOn)
  const toggleSound = useApp((s) => s.toggleSound)
  const secrets = useApp((s) => s.secrets)
  const found = secrets.length
  const [listOpen, setListOpen] = useState(false)
  const toasts = useApp((s) => s.toasts)
  const dropToast = useApp((s) => s.dropToast)
  const setMode = useApp((s) => s.setMode)

  useEffect(() => {
    if (!toasts.length) return
    const id = window.setTimeout(() => dropToast(toasts[0].id), 3200)
    return () => window.clearTimeout(id)
  }, [toasts, dropToast])

  return (
    <div className="corner">
      <div className="corner__row">
        <button className="corner__btn corner__btn--text" onClick={() => setMode('classic')}>
          CLASSIC VIEW
        </button>
        <a
          className="corner__btn corner__btn--text"
          href={site.cvPdf}
          download
          onClick={() => track('CV downloaded', { from: 'corner' })}
        >
          CV ↓
        </a>
        <button
          className="corner__secrets"
          onClick={() => setListOpen((o) => !o)}
          aria-expanded={listOpen}
          aria-controls="secret-list"
          aria-label={`Secrets found: ${found} of ${SECRET_COUNT}. Show list`}
        >
          SECRETS {found}/{SECRET_COUNT}
        </button>
        <button className="corner__btn" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}>
          <Speaker on={soundOn} />
        </button>
      </div>
      {listOpen && (
        <ul className="secret-list" id="secret-list">
          {(Object.keys(SECRETS) as SecretId[]).map((id) => {
            const got = secrets.includes(id)
            return (
              <li key={id} data-found={got}>
                <span aria-hidden>{got ? '■' : '□'}</span>
                {got ? SECRETS[id] : SECRET_HINTS[id]}
                <span className="sr-only">{got ? ' — found' : ' — not found yet'}</span>
              </li>
            )
          })}
        </ul>
      )}
      <ul className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <li key={t.id} className="toast">
            <span>SECRET FOUND</span>
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
