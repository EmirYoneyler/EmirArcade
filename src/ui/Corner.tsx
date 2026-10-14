import { useEffect } from 'react'
import { useApp } from '../store/useApp'
import { SECRET_COUNT } from '../data/secrets'

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
  const found = useApp((s) => s.secrets.length)
  const toasts = useApp((s) => s.toasts)
  const dropToast = useApp((s) => s.dropToast)

  useEffect(() => {
    if (!toasts.length) return
    const id = window.setTimeout(() => dropToast(toasts[0].id), 3200)
    return () => window.clearTimeout(id)
  }, [toasts, dropToast])

  return (
    <div className="corner">
      <div className="corner__row">
        <span className="corner__secrets" aria-label={`Secrets found: ${found} of ${SECRET_COUNT}`}>
          SECRETS {found}/{SECRET_COUNT}
        </span>
        <button className="corner__btn" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}>
          <Speaker on={soundOn} />
        </button>
      </div>
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
