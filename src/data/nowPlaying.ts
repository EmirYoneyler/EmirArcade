import { useEffect, useState } from 'react'

/**
 * What Emir is listening to (YouTube Music → Last.fm → /api/now-playing).
 * Stays `null` until the Vercel function is configured, so nothing shows
 * on sites without it (local dev, previews without the env vars).
 */
export type Track = { title: string; artist: string; album: string; url: string; image: string | null; nowPlaying: boolean; playedAt: number | null }
export type Listening = { nowPlaying: Track | null; recent: Track[] }

/** Latest result, for code outside React (BYTE's jukebox line). */
export let latestListening: Listening | null = null

const listeners = new Set<(l: Listening | null) => void>()
let timer: number | null = null

async function poll() {
  try {
    const r = await fetch('/api/now-playing')
    const ok = r.ok && r.headers.get('content-type')?.includes('json')
    latestListening = ok ? await r.json() : null
  } catch {
    latestListening = null
  }
  listeners.forEach((fn) => fn(latestListening))
}

/** Subscribe to now-playing; polls once a minute while anything is listening. */
export function useListening() {
  const [value, setValue] = useState<Listening | null>(latestListening)
  useEffect(() => {
    listeners.add(setValue)
    if (timer === null) {
      poll()
      timer = window.setInterval(poll, 60_000)
    }
    return () => {
      listeners.delete(setValue)
      if (!listeners.size && timer !== null) {
        window.clearInterval(timer)
        timer = null
      }
    }
  }, [])
  return value
}

/** The track to talk about: playing now, else the most recent one. */
export const currentTrack = (l: Listening | null) => l?.nowPlaying ?? l?.recent[0] ?? null
