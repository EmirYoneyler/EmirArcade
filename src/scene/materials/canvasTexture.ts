import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

/**
 * Paint a texture with the 2D canvas API (labels, signs, paper). Redraws
 * once the pixel font has loaded so text never sticks in the fallback font.
 */
export function useCanvasTexture(w: number, h: number, draw: Draw, deps: unknown[] = []) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    const paint = () => {
      ctx.clearRect(0, 0, w, h)
      draw(ctx, w, h)
      t.needsUpdate = true
    }
    paint()
    document.fonts?.ready.then(paint)
    t.userData.repaint = paint
    return t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, ...deps])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

export const pixelFont = (px: number, bold = false) => `${bold ? 'bold ' : ''}${px}px Silkscreen, monospace`
