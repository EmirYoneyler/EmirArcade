import { useEffect, useRef } from 'react'
import { useApp } from '../store/useApp'
import { pressStart, goBack } from '../flow'

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

export default function Hud() {
  const view = useApp((s) => s.view)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack()
      if (e.key === 'Enter' && useApp.getState().view === 'room' && document.activeElement === document.body) pressStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Tooltip />
      {view === 'room' && (
        <button className="hud-btn hud-btn--start" onClick={pressStart}>
          PRESS START <kbd>ENTER</kbd>
        </button>
      )}
      {view !== 'room' && (
        <button className="hud-btn hud-btn--back" onClick={goBack}>
          ◀ BACK <kbd>ESC</kbd>
        </button>
      )}
    </>
  )
}
