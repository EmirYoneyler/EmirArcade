import { Canvas } from '@react-three/fiber'
import { NoToneMapping, PCFSoftShadowMap } from 'three'
import { PALETTE } from '../theme/palette'
import { POSES } from '../config/camera'
import { Selection } from '@react-three/postprocessing'
import Room from './Room'
import Arcade from './Arcade'
import Lighting from './Lighting'
import CameraRig from './CameraRig'
import Effects from './Effects'
import { useApp } from '../store/useApp'

export default function Scene() {
  const setReady = useApp((s) => s.setReady)
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      dpr={[1, 1.5]}
      shadows={{ type: PCFSoftShadowMap }}
      camera={{ fov: POSES.room.fov, near: 0.1, far: 60, position: POSES.room.position.toArray() }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(setReady))}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: NoToneMapping }}
    >
      <color attach="background" args={[PALETTE.bg]} />
      <Selection>
        <Lighting />
        <Room />
        <Arcade />
        <CameraRig />
        <Effects />
      </Selection>
    </Canvas>
  )
}
