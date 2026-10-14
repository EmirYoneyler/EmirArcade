import { useEffect, useRef } from 'react'
import { useApp } from '../store/useApp'

/**
 * Run `fn` every time object `id` is activated — by click, by keyboard
 * (the Tab mirror), or by anything else calling `activate(id)`.
 * Compares counts (not a "first run" flag) so StrictMode's double effect
 * on mount can't fire it.
 */
export function usePulse(id: string, fn: () => void) {
  const count = useApp((s) => s.pulses[id] ?? 0)
  const seen = useRef(count)
  const cb = useRef(fn)
  cb.current = fn
  useEffect(() => {
    if (count === seen.current) return
    seen.current = count
    cb.current()
  }, [count])
}
