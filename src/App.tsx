import { lazy, Suspense } from 'react'
import { useApp } from './store/useApp'
import ClassicView from './classic/ClassicView'
import BootScreen from './ui/BootScreen'

const ArcadeApp = lazy(() => import('./ArcadeApp'))

export default function App() {
  const mode = useApp((s) => s.mode)
  if (mode === 'classic') return <ClassicView />
  return (
    <>
      <Suspense fallback={null}>
        <ArcadeApp />
      </Suspense>
      <BootScreen />
    </>
  )
}
