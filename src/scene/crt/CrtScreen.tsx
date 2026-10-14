import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Mesh, NearestFilter, ShaderMaterial, SRGBColorSpace, Vector3 } from 'three'
import { PROGRAMS, type ProgramName, type CrtInput } from './programs'
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
}

/** A CRT tube face: draws a 2D pixel program into a canvas texture. */
export default function CrtScreen({ program, width, height, res = [320, 240], fps = 30 }: Props) {
  const mesh = useRef<Mesh>(null)
  const lightsOn = useApp((s) => s.lightsOn)
  const { canvas, ctx, tex } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = res[0]
    canvas.height = res[1]
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    return { canvas, ctx, tex }
  }, [res])

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { map: { value: tex }, uTime: { value: 0 }, uBoost: { value: 1.6 }, uLines: { value: res[1] / 2 } },
        vertexShader: vert,
        fragmentShader: frag,
        toneMapped: false,
      }),
    [tex, res],
  )
  useEffect(() => () => (tex.dispose(), mat.dispose()), [tex, mat])

  const clock = useRef({ start: 0, last: -1, prog: program })
  const input = useMemo<CrtInput>(() => ({ t: 0, look: { x: 0, y: 0 } }), [])
  const v = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const now = state.clock.elapsedTime
    const c = clock.current
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
    PROGRAMS[program](ctx, canvas.width, canvas.height, input)
    tex.needsUpdate = true
  })

  return (
    <mesh ref={mesh} material={mat}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}
