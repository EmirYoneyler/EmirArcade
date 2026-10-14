import { lazy, Suspense, useEffect } from 'react'
import Hud from './ui/Hud'
import ProjectPage from './ui/ProjectPage'
import DialogBox from './ui/DialogBox'
import Panels from './ui/Panels'
import Corner from './ui/Corner'
import { useApp } from './store/useApp'
import './audio/chiptune'

// the big 3D bundle (three, r3f, drei, postprocessing, gsap) loads on its own
const Scene = lazy(() => import('./scene/Scene'))

/** Everything for the 3D arcade mode. Itself lazy-loaded by App. */
export default function ArcadeApp() {
  useEffect(() => {
    useApp.getState().setBoot('rom', 0.35) // UI shell is in; the 3D bundle is next
    // the jukebox is playing when you walk in (starts on the first click/key)
    useApp.getState().setMusic(true)
    return () => useApp.getState().setMusic(false)
  }, [])
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Hud />
      <Corner />
      <DialogBox />
      <Panels />
      <ProjectPage />
    </>
  )
}
