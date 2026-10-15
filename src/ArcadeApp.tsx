import { lazy, Suspense, useEffect } from 'react'
import Hud from './ui/Hud'
import ProjectPage from './ui/ProjectPage'
import DialogBox from './ui/DialogBox'
import Panels from './ui/Panels'
import Corner from './ui/Corner'
import TouchPad from './ui/TouchPad'
import { useApp } from './store/useApp'
import './audio/chiptune'
import { linkedProjectIndex } from './share'
import { chooseProject } from './flow'

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

  // opened from a /projects/<id> link: once the room is up, play that tape
  useEffect(() => {
    const index = linkedProjectIndex()
    if (index < 0) return
    let timer = 0
    const go = () => void (timer = window.setTimeout(() => chooseProject(index), 400))
    if (useApp.getState().ready) {
      go()
      return () => window.clearTimeout(timer)
    }
    const unsub = useApp.subscribe((s, prev) => {
      if (s.ready && !prev.ready) {
        unsub()
        go()
      }
    })
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [])
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Hud />
      <TouchPad />
      <Corner />
      <DialogBox />
      <Panels />
      <ProjectPage />
    </>
  )
}
