import { useListening, currentTrack } from '../data/nowPlaying'
import { useL } from '../i18n'

/** One line: what Emir is (or was last) listening to. Renders nothing until configured. */
export default function NowListening() {
  const listening = useListening()
  const { t } = useL()
  const track = currentTrack(listening)
  if (!track) return null
  return (
    <p className="now-listening">
      {listening?.nowPlaying ? t.listeningNow : t.lastPlayed}
      <a href={track.url} target="_blank" rel="noreferrer">
        {track.title} — {track.artist}
      </a>
    </p>
  )
}
