import { useEffect, useState } from 'react'
import { useApp } from '../store/useApp'
import { input } from '../scene/crt/games'
import { projects } from '../data/content'
import { chooseProject } from '../flow'

type Key = 'up' | 'down' | 'left' | 'right' | 'fire'

/** One hold-to-press button that drives the game's input flags. */
function Pad({ k, label, wide }: { k: Key; label: string; wide?: boolean }) {
  const set = (on: boolean) => {
    input[k] = on
    if (on) input.active = true
  }
  return (
    <button
      className={`touchpad__btn${wide ? ' touchpad__btn--wide' : ''}`}
      aria-label={k}
      onPointerDown={(e) => {
        e.preventDefault()
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        set(true)
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onLostPointerCapture={() => set(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

/** On-screen game buttons for touch devices, shown while EMIR-1 is open. */
export default function TouchPad() {
  const view = useApp((s) => s.view)
  const game = useApp((s) => s.game)
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(window.matchMedia('(pointer: coarse)').matches), [])
  if (!touch || view !== 'cabinet') return null
  return (
    <>
    {/* on phones the rack is hard to tap, so the tapes also sit in a strip */}
    <nav className="tapestrip" aria-label="Project tapes">
      <span className="tapestrip__label">TAPES</span>
      {projects.map((p, i) => (
        <button key={p.id} className="tapestrip__tape" onClick={() => chooseProject(i)}>
          <small>{String(i + 1).padStart(2, '0')}</small>
          {p.cartridge}
        </button>
      ))}
    </nav>
    <div className="touchpad" aria-label="Game controls">
      {game === 'rally' ? (
        <div className="touchpad__col">
          <Pad k="up" label="▲" />
          <Pad k="down" label="▼" />
        </div>
      ) : (
        <>
          <div className="touchpad__row">
            <Pad k="left" label="◀" />
            <Pad k="right" label="▶" />
          </div>
          <Pad k="fire" label="FIRE" wide />
        </>
      )}
    </div>
    </>
  )
}
