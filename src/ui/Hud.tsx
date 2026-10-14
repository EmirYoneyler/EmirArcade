import { useEffect, useRef } from 'react'
import { projects, byteLines } from '../data/content'
import { OBJECTS, activate } from '../scene/actions'
import { sfx } from '../audio/sfx'
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

/** Tab mirror of every object in the room — keyboard & screen-reader access. */
function RoomMirror() {
  const setFocused = useApp((s) => s.setFocused)
  return (
    <nav className="sr-only" aria-label="Objects in the arcade">
      <ul>
        {OBJECTS.map((o) => (
          <li key={o.id}>
            <button onFocus={() => setFocused(o.id)} onBlur={() => setFocused(null)} onClick={() => activate(o.id)}>
              {o.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const typing = () => {
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

export default function Hud() {
  const view = useApp((s) => s.view)

  // BYTE says hello once the room is up
  useEffect(() => {
    const unsub = useApp.subscribe((s, prev) => {
      if (s.ready && !prev.ready) setTimeout(() => useApp.getState().view === 'room' && useApp.getState().say(byteLines.welcome), 1400)
    })
    return unsub
  }, [])

  useEffect(() => {
    let k = 0
    const onKey = (e: KeyboardEvent) => {
      if (typing()) return
      // Konami code works anywhere
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0
      if (k === KONAMI.length) {
        k = 0
        const s = useApp.getState()
        s.discover('konami')
        sfx('secret')
        s.say(byteLines.konami)
        s.setCheat(true)
        setTimeout(() => useApp.getState().setCheat(false), 12000)
        return
      }
      const st = useApp.getState()
      const v = st.view
      if (e.key === 'Escape') {
        if (st.panel) return void st.setPanel(null)
        return void goBack()
      }
      if (v === 'room' && e.key === 'Enter' && document.activeElement === document.body && !st.panel) pressStart()
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
      {view === 'room' && <RoomMirror />}
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
