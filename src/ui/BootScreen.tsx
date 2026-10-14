import { useEffect, useState } from 'react'
import { useApp, type BootStage } from '../store/useApp'

const ORDER: BootStage[] = ['rom', 'assets', 'gpu', 'done']
/** share of the bar each stage owns */
const WEIGHT: Record<BootStage, [number, number]> = { rom: [0, 0.55], assets: [0.55, 0.85], gpu: [0.85, 1], done: [1, 1] }

const LINES: { at: BootStage; text: string }[] = [
  { at: 'rom', text: 'EMIR-1 SYSTEM BIOS  v1.0' },
  { at: 'rom', text: 'CPU ........ OK' },
  { at: 'rom', text: 'LOADING ROM' },
  { at: 'assets', text: 'ROM ........ OK' },
  { at: 'assets', text: 'FONTS + TEXTURES' },
  { at: 'gpu', text: 'WARMING UP THE TUBES' },
  { at: 'done', text: 'INSERT COIN' },
]

/**
 * Arcade boot sequence. The bar tracks real stages: downloading the 3D
 * bundle, loading fonts/assets, compiling shaders, first frame.
 */
export default function BootScreen() {
  const stage = useApp((s) => s.bootStage)
  const p = useApp((s) => s.bootProgress)
  const setMode = useApp((s) => s.setMode)
  const [ram, setRam] = useState(0)
  const done = stage === 'done'

  useEffect(() => {
    const id = window.setInterval(() => setRam((r) => (r >= 640 ? 640 : r + 32)), 30)
    return () => window.clearInterval(id)
  }, [])

  const [a, b] = WEIGHT[stage]
  const pct = Math.round((a + (b - a) * Math.min(1, p)) * 100)
  const reached = ORDER.indexOf(stage)
  const lines = LINES.filter((l) => ORDER.indexOf(l.at) <= reached)

  return (
    <div className="boot" data-done={done} aria-hidden={done}>
      <div className="boot__screen" role="status" aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className="boot__line">
            {l.text}
            {i === 1 && ` · RAM ${ram}K`}
          </div>
        ))}
        <div className="boot__bar" aria-label={`Loading ${pct}%`}>
          <i style={{ width: `${pct}%` }} data-busy={stage === 'rom' && p === 0} />
        </div>
        <div className="boot__pct">{pct}%</div>
        <button className="boot__skip" onClick={() => setMode('classic')}>
          Skip to classic view
        </button>
      </div>
    </div>
  )
}
