import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { NoToneMapping, PCFSoftShadowMap } from 'three'
import { Selection } from '@react-three/postprocessing'
import { PALETTE } from '../theme/palette'
import { POSES } from '../config/camera'
import { useApp } from '../store/useApp'
import { registerCamera } from '../cameraBridge'
import { flyTo } from './flight'
import Room from './Room'
import Arcade from './Arcade'
import Props from './Props'
import Lighting from './Lighting'
import CameraRig from './CameraRig'
import Effects from './Effects'

/** Reports real loading progress to the boot screen: loaders + fonts, then GPU warm-up. */
function BootReporter() {
  const { gl, scene, camera } = useThree()
  const { active, progress } = useProgress()
  const setBoot = useApp((s) => s.setBoot)
  const [fonts, setFonts] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setFonts(true))
    if (import.meta.env.DEV) (window as unknown as { __gl: typeof gl }).__gl = gl
  }, [gl])

  useEffect(() => {
    if (!fonts || active) {
      setBoot('assets', (fonts ? 0.5 : 0) + (active ? progress / 200 : 0.5))
      return
    }
    // everything is in memory — compile every shader now so the first
    // interaction doesn't hitch, then reveal after two real frames
    setBoot('gpu', 0)
    gl.compile(scene, camera)
    let raf = requestAnimationFrame(() => {
      setBoot('gpu', 0.5)
      raf = requestAnimationFrame(() => setBoot('done'))
    })
    return () => cancelAnimationFrame(raf)
  }, [fonts, active, progress, gl, scene, camera, setBoot])

  return null
}

export default function Scene() {
  // the project page fully covers the canvas — stop rendering behind it
  const covered = useApp((s) => s.view === 'project')
  const [dpr, setDpr] = useState(1.5)
  const [lowFx, setLowFx] = useState(false)

  useEffect(() => {
    registerCamera(flyTo)
    return () => registerCamera(null)
  }, [])

  return (
    <div role="img" aria-label="A cozy late-night arcade room with three cabinets, a claw machine, a jukebox and a sleeping cat. Use Tab to explore its objects." style={{ position: 'fixed', inset: 0 }}>
      <Canvas
        frameloop={covered ? 'demand' : 'always'}
        dpr={dpr}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: POSES.room.fov, near: 0.1, far: 60, position: POSES.room.position.toArray() }}
        gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: NoToneMapping }}
      >
        {/* step quality down on slow GPUs: first resolution, then post effects */}
        <PerformanceMonitor
          onDecline={() => (dpr > 1 ? setDpr(1) : setLowFx(true))}
          onIncline={() => setDpr(1.5)}
          flipflops={3}
          onFallback={() => (setDpr(1), setLowFx(true))}
        />
        <color attach="background" args={[PALETTE.bg]} />
        <Selection>
          <Lighting />
          <Room />
          <Arcade />
          <Props />
          <CameraRig />
          <Effects low={lowFx} />
        </Selection>
        <BootReporter />
      </Canvas>
    </div>
  )
}
