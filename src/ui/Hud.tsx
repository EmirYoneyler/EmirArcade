import { useEffect, useRef } from 'react'
import { projects } from '../data/content'
import { useApp } from '../store/useApp'
import { pressStart, goBack, moveMenu, chooseProject, stepProject } from '../flow'

/** Cursor-following name tag for whatever 3D prop is hovered. */
function Tooltip() {
  const hovered = useApp((s) => s.hovered)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className="tooltip" data-show={!!hovered} aria-hidden>
      {hovered}
    </div>
  )
}

/**
 * Screen-reader / Tab mirror of the CRT menu. Visually hidden; keeps the
 * same cursor as the canvas so keyboard and mouse never disagree.
 */
function MenuMirror() {
  const menuIndex = useApp((s) => s.menuIndex)
  const setMenuIndex = useApp((s) => s.setMenuIndex)
  return (
    <nav className="sr-only" aria-label="Select a project">
      <ul>
        {projects.map((p, i) => (
          <li key={p.id}>
            <button
              aria-current={i === menuIndex}
              onFocus={() => setMenuIndex(i)}
              onClick={() => chooseProject(i)}
            >
              {p.title} — {p.pitch}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const typing = () => {
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

export default function Hud() {
  const view = useApp((s) => s.view)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing()) return
      const v = useApp.getState().view
      if (e.key === 'Escape') return void goBack()
      if (v === 'room' && e.key === 'Enter' && document.activeElement === document.body) pressStart()
      if (v === 'cabinet') {
        if (e.key === 'ArrowUp') (e.preventDefault(), moveMenu(-1))
        if (e.key === 'ArrowDown') (e.preventDefault(), moveMenu(1))
        // a focused mirror button handles its own Enter via click
        if (e.key === 'Enter' && !(document.activeElement instanceof HTMLButtonElement)) chooseProject()
      }
      if (v === 'project') {
        if (e.key === 'ArrowLeft') stepProject(-1)
        if (e.key === 'ArrowRight') stepProject(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Tooltip />
      {view === 'cabinet' && <MenuMirror />}
      {view === 'room' && (
        <button className="hud-btn hud-btn--start" onClick={pressStart}>
          PRESS START <kbd>ENTER</kbd>
        </button>
      )}
      {(view === 'cabinet' || view === 'loading') && (
        <button className="hud-btn hud-btn--back" onClick={goBack}>
          ◀ BACK <kbd>ESC</kbd>
        </button>
      )}
    </>
  )
}
