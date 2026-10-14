import { lazy, Suspense } from 'react'
import { useProgress } from '@react-three/drei'
import { about } from './data/content'
import { useApp } from './store/useApp'
import Hud from './ui/Hud'

// 3D bundle is code-split so first paint stays light.
const Scene = lazy(() => import('./scene/Scene'))

function Boot() {
  const { progress, active } = useProgress()
  const ready = useApp((s) => s.ready)
  const done = ready && !active
  return (
    <div className="boot" data-done={done} aria-live="polite">
      <div>
        <div>EMIR-1 BOOT</div>
        <div className="boot__bar"><i style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <div className="hud-title">
        {about.name.toUpperCase()}
        <small>{about.title}</small>
      </div>
      <Suspense fallback={<div className="boot"><div>EMIR-1 BOOT</div></div>}>
        <Scene />
      </Suspense>
      <Hud />
      <Boot />
    </>
  )
}
