import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CanvasTexture, Mesh, NearestFilter, ShaderMaterial, SRGBColorSpace, Vector3 } from 'three'
import type { CrtInput } from './programs'
import { PROGRAMS, type ProgramName } from './registry'
import { useApp } from '../../store/useApp'

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

// Barrel curvature + scanlines + edge falloff. Output is pushed past 1.0 so
// bright phosphor (and only that) picks up bloom.
const frag = /* glsl */ `
uniform sampler2D map;
uniform float uTime;
uniform float uBoost;
uniform float uLines;
varying vec2 vUv;
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv *= 1.0 + dot(uv, uv) * vec2(0.035, 0.05);
  uv = uv * 0.5 + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  vec3 c = texture2D(map, uv).rgb;
  float scan = 0.78 + 0.22 * sin(uv.y * uLines * 6.2831);
  vec2 e = uv * (1.0 - uv);
  float edge = clamp(pow(e.x * e.y * 18.0, 0.35), 0.0, 1.0);
  float flick = 0.985 + 0.015 * sin(uTime * 120.0);
  // faint phosphor haze so the black glass never reads as pure void
  vec3 haze = vec3(1.0, 0.69, 0.0) * 0.012;
  gl_FragColor = vec4((c * scan * uBoost * flick + haze) * edge, 1.0);
  #include <colorspace_fragment>
}`

type Props = {
  program: ProgramName
  width: number
  height: number
  res?: [number, number]
  fps?: number
  /** canvas pixels per logical pixel — 2 keeps menu text crisp up close */
  pixelScale?: number
  /** pointer events in logical CRT pixels (already corrected for curvature) */
  onPointer?: (type: 'move' | 'click' | 'leave', x: number, y: number) => void
}

/** Same barrel distortion as the shader, so hit tests land where pixels are drawn. */
function curve(u: number, v: number): [number, number] {
  const x = u * 2 - 1
  const y = v * 2 - 1
  const d = x * x + y * y
  return [(x * (1 + d * 0.035)) * 0.5 + 0.5, (y * (1 + d * 0.05)) * 0.5 + 0.5]
}

/** A CRT tube face: draws a 2D pixel program into a canvas texture. */
export default function CrtScreen({ program, width, height, res = [320, 240], fps = 30, pixelScale = 1, onPointer }: Props) {
  const lw = res[0] / pixelScale
  const lh = res[1] / pixelScale
  const mesh = useRef<Mesh>(null)
  const lightsOn = useApp((s) => s.lightsOn)
  const { ctx, tex } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = res[0]
    canvas.height = res[1]
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.scale(pixelScale, pixelScale)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    return { ctx, tex }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res[0], res[1], pixelScale])

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { map: { value: tex }, uTime: { value: 0 }, uBoost: { value: 1.6 }, uLines: { value: lh / 2 } },
        vertexShader: vert,
        fragmentShader: frag,
        toneMapped: false,
      }),
    [tex, lh],
  )
  useEffect(() => () => (tex.dispose(), mat.dispose()), [tex, mat])

  // own clock: R3F's restarts when the frameloop resumes after the project page
  const clock = useRef({ now: 0, start: 0, last: -1, prog: program })
  const input = useMemo<CrtInput>(() => ({ t: 0, look: { x: 0, y: 0 } }), [])
  const v = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    const c = clock.current
    c.now += Math.min(dt, 0.1)
    const now = c.now
    if (c.prog !== program) {
      c.prog = program
      c.start = now
    }
    mat.uniforms.uTime.value = now
    // screens glow a touch brighter when the room lights are off
    mat.uniforms.uBoost.value = lightsOn ? 1.6 : 1.9
    if (now - c.last < 1 / fps) return
    c.last = now

    mesh.current!.getWorldPosition(v).project(state.camera)
    input.t = now - c.start
    input.look.x = state.pointer.x - v.x
    input.look.y = state.pointer.y - v.y
    PROGRAMS[program](ctx, lw, lh, input)
    tex.needsUpdate = true
  })

  const handle = (type: 'move' | 'click') => (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!onPointer || !e.uv) return
    e.stopPropagation()
    const [u, v] = curve(e.uv.x, e.uv.y)
    onPointer(type, u * lw, (1 - v) * lh)
  }

  return (
    <mesh
      ref={mesh}
      material={mat}
      onPointerMove={onPointer && handle('move')}
      onClick={onPointer && handle('click')}
      onPointerLeave={onPointer && (() => onPointer('leave', -1, -1))}
    >
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}
