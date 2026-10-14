import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store/useApp'
import { drawByte } from '../scene/crt/byte'
import { PALETTE } from '../theme/palette'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** BYTE's portrait, drawn with the same sprite as the CRT. */
function Portrait({ talking }: { talking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!
    let raf = 0
    const loop = (t: number) => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 64, 64)
      drawByte(ctx, {
        x: 8,
        y: 4 + (talking && Math.floor(t / 120) % 2 ? -2 : 0),
        s: 3,
        look: { x: 0.4, y: 0 },
        blink: t % 3800 < 140,
        step: 0,
        antenna: Math.floor(t / 400) % 3 !== 0,
        ink: PALETTE.amber,
        paper: '#000',
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [talking])
  return <canvas ref={ref} width={64} height={64} className="dialog__portrait" aria-hidden />
}

/**
 * Bottom-of-screen dialog box. BYTE's lines type out letter by letter;
 * click (or Space) to finish the line, again to close. Auto-closes.
 */
export default function DialogBox() {
  const dialog = useApp((s) => s.dialog)
  const close = useApp((s) => s.closeDialog)
  const hidden = useApp((s) => s.view === 'project')
  const [shown, setShown] = useState(0)
  const text = dialog?.text ?? ''
  const done = shown >= text.length

  useEffect(() => {
    if (!dialog) return
    if (reduceMotion()) return void setShown(dialog.text.length)
    setShown(0)
    const id = window.setInterval(() => setShown((n) => (n >= dialog.text.length ? n : n + 1)), 28)
    return () => window.clearInterval(id)
  }, [dialog])

  useEffect(() => {
    if (!dialog || !done) return
    const id = window.setTimeout(close, 3500 + text.length * 35)
    return () => window.clearTimeout(id)
  }, [dialog, done, close, text.length])

  const advance = () => (done ? close() : setShown(text.length))

  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && document.activeElement === document.body && useApp.getState().view !== 'cabinet') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!dialog || hidden) return null
  return (
    <div className="dialog" role="status" aria-live="polite" onClick={advance}>
      <Portrait talking={!done} />
      <div className="dialog__body">
        <div className="dialog__name">BYTE</div>
        {/* full line for screen readers; typed copy is visual only */}
        <p className="sr-only">{text}</p>
        <p className="dialog__text" aria-hidden>
          {text.slice(0, shown)}
          {done && <span className="dialog__more">▼</span>}
        </p>
      </div>
    </div>
  )
}
