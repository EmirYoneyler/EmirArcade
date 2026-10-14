// Vercel serverless function: what Emir is listening to, via Last.fm.
// YouTube Music has no public listening-history API, so plays are
// "scrobbled" to Last.fm (Web Scrobbler extension / Pano Scrobbler app)
// and read back here. The API key stays on the server.
//
// Set in Vercel → Settings → Environment Variables:
//   LASTFM_API_KEY  — from https://www.last.fm/api/account/create
//   LASTFM_USER     — your Last.fm username
export default async function handler(req, res) {
  const key = process.env.LASTFM_API_KEY
  const user = process.env.LASTFM_USER
  if (!key || !user) {
    res.status(404).json({ error: 'not configured' })
    return
  }
  const url =
    'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&limit=6' +
    `&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}`
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`last.fm ${r.status}`)
    const data = await r.json()
    const raw = data?.recenttracks?.track ?? []
    const list = (Array.isArray(raw) ? raw : [raw]).map((t) => ({
      title: t.name,
      artist: t.artist?.['#text'] ?? t.artist?.name ?? '',
      album: t.album?.['#text'] ?? '',
      url: t.url,
      image: (t.image ?? []).find((i) => i.size === 'large')?.['#text'] || null,
      nowPlaying: t['@attr']?.nowplaying === 'true',
      playedAt: t.date?.uts ? Number(t.date.uts) * 1000 : null,
    }))
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    res.status(200).json({
      nowPlaying: list.find((t) => t.nowPlaying) ?? null,
      recent: list.filter((t) => !t.nowPlaying).slice(0, 5),
    })
  } catch {
    res.status(502).json({ error: 'last.fm unavailable' })
  }
}
