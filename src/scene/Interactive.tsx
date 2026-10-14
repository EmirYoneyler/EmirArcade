import { useRef, useState, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import type { Group } from 'three'
import { useApp } from '../store/useApp'

type Props = {
  name: string
  onActivate: () => void
  enabled?: boolean
  lift?: number
  children: ReactNode
}

/**
 * Wraps any prop to make it interactive: outline + small lift on hover,
 * cursor tooltip with its name, click to activate.
 */
export default function Interactive({ name, onActivate, enabled = true, lift = 0.03, children }: Props) {
  const ref = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const setHovered = useApp((s) => s.setHovered)
  const active = hover && enabled

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const goal = active ? lift : 0
    g.position.y += (goal - g.position.y) * Math.min(1, dt * 12)
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHover(true)
    if (enabled) {
      setHovered(name)
      document.body.style.cursor = 'pointer'
    }
  }
  const out = () => {
    setHover(false)
    setHovered(null)
    document.body.style.cursor = ''
  }

  return (
    <Select enabled={active}>
      <group
        ref={ref}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          if (!enabled) return
          e.stopPropagation()
          out()
          onActivate()
        }}
      >
        {children}
      </group>
    </Select>
  )
}
