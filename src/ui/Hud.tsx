import { useEffect, useRef } from 'react'
import { projects } from '../data/content'
import { useL, L } from '../i18n'
import { OBJECTS, activate, objectName } from '../scene/actions'
import { sfx } from '../audio/sfx'
import { useApp } from '../store/useApp'
import { pressStart, goBack, chooseProject, stepProject } from '../flow'

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
  const setTapeHover = useApp((s) => s.setTapeHover)
  const { t, projects } = useL()
  return (
    <nav className="sr-only" aria-label={t.projectTapes}>
      <ul>
        {projects.map((p, i) => (
          <li key={p.id}>
            <button onFocus={() => setTapeHover(i)} onBlur={() => setTapeHover(null)} onClick={() => chooseProject(i)}>
              {t.tape} {i + 1}: {p.title} — {p.pitch}
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
  const { t } = useL()
  return (
    <nav className="sr-only" aria-label={t.roomObjects}>
      <ul>
        {OBJECTS.map((o) => (
          <li key={o.id}>
            <button onFocus={() => setFocused(o.id)} onBlur={() => setFocused(null)} onClick={() => activate(o.id)}>
              {objectName(o.id)}
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
  const { t, about } = useL()

  // BYTE says hello once the room is up
  useEffect(() => {
    const unsub = useApp.subscribe((s, prev) => {
      if (s.ready && !prev.ready) setTimeout(() => useApp.getState().view === 'room' && useApp.getState().say(L().byteLines.welcome), 1400)
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
        s.say(L().byteLines.konami)
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
        // arrows / Space drive the game; number keys insert a tape
        const n = Number(e.key)
        if (Number.isInteger(n) && n >= 1 && n <= projects.length) chooseProject(n - 1)
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
      <a className="skip" href="#" onClick={(e) => (e.preventDefault(), useApp.getState().setMode('classic'))}>
        {t.skipClassic}
      </a>
      <h1 className="hud-title">
        {about.name.toUpperCase()}
        <small>{about.title}</small>
      </h1>
      <Tooltip />
      {view === 'room' && <RoomMirror />}
      {view === 'cabinet' && <MenuMirror />}
      {view === 'room' && (
        <button className="hud-btn hud-btn--start" onClick={pressStart}>
          {t.pressStart} <kbd>ENTER</kbd>
        </button>
      )}
      {(view === 'cabinet' || view === 'loading') && (
        <button className="hud-btn hud-btn--back" onClick={goBack}>
          ◀ {t.back} <kbd>ESC</kbd>
        </button>
      )}
    </>
  )
}
