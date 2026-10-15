import { useEffect, useState } from 'react'
import { useApp } from '../store/useApp'
import { useL } from '../i18n'
import { track } from '../analytics'
import { SECRETS, SECRET_COUNT, type SecretId } from '../data/secrets'

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
  const setLang = useApp((s) => s.setLang)
  const { t, lang, secretNames, secretHints, cvPdf } = useL()

  useEffect(() => {
    if (!toasts.length) return
    const id = window.setTimeout(() => dropToast(toasts[0].id), 3200)
    return () => window.clearTimeout(id)
  }, [toasts, dropToast])

  return (
    <div className="corner">
      <div className="corner__row">
        <button className="corner__btn corner__btn--text" onClick={() => setMode('classic')}>
          {t.classicView}
        </button>
        <button
          className="corner__btn corner__btn--text"
          onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
          lang={lang === 'en' ? 'tr' : 'en'}
          aria-label={t.switchToLabel}
        >
          {t.switchTo}
        </button>
        <a
          className="corner__btn corner__btn--text"
          href={cvPdf}
          download
          onClick={() => track('CV downloaded', { from: 'corner' })}
        >
          {t.cv}
        </a>
        <button
          className="corner__secrets"
          onClick={() => setListOpen((o) => !o)}
          aria-expanded={listOpen}
          aria-controls="secret-list"
          aria-label={t.secretsAria(found, SECRET_COUNT)}
        >
          {t.secrets} {found}/{SECRET_COUNT}
        </button>
        <button className="corner__btn" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? t.mute : t.unmute}>
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
                {got ? secretNames[id] : secretHints[id]}
                <span className="sr-only">{` — ${got ? t.found : t.notFound}`}</span>
              </li>
            )
          })}
        </ul>
      )}
      <ul className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <li key={toast.id} className="toast">
            <span>{t.secretFound}</span>
            {secretNames[toast.secret]} · {toast.count}/{SECRET_COUNT}
          </li>
        ))}
      </ul>
    </div>
  )
}
