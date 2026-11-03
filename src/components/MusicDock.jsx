import { useRef, useState } from 'react'

const TRACK = {
  title: 'Jumpman',
  artist: 'Drake & Future',
  url: 'https://music.apple.com/us/album/jumpman/1440848548?i=1440848846',
  artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/d3/74/1d/d3741d09-5c9a-461b-aba3-fa345d306d5a/00602547616678.rgb.jpg/300x300bb.jpg',
  preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/93/f1/31/93f131ce-feb5-dbef-ad21-b4c5fd99846f/mzaf_8501334934618208471.plus.aac.p.m4a',
}

export default function MusicDock() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)

  async function toggle() {
    const audio = audioRef.current
    if (!audio.paused) {
      audio.pause()
      return
    }
    setFailed(false)
    setLoading(true)
    try {
      if (audio.ended) audio.currentTime = 0
      await audio.play()
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return <section className="music-dock" aria-label="Music player">
    <audio ref={audioRef} src={TRACK.preview} preload="none"
      onPlaying={() => { setPlaying(true); setLoading(false) }}
      onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setProgress(0) }}
      onError={() => { setFailed(true); setPlaying(false); setLoading(false) }}
      onTimeUpdate={event => {
        const audio = event.currentTarget
        setProgress(audio.duration && !audio.ended ? audio.currentTime / audio.duration : 0)
      }} />
    <a className="music-track" href={TRACK.url} target="_blank" rel="noreferrer" aria-label="Jumpman by Drake & Future on Apple Music">
      <img src={TRACK.artwork} width="44" height="44" alt="What a Time To Be Alive album cover" />
      <span><strong>{TRACK.title}</strong><span>{TRACK.artist}</span></span>
    </a>
    <button className="icon-button music-toggle" onClick={toggle} disabled={loading}
      aria-label={loading ? 'Loading Jumpman preview' : playing ? 'Pause Jumpman' : 'Play Jumpman preview'}
      title={playing ? 'Pause' : 'Play preview'} aria-busy={loading}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {loading ? <circle className="music-loading" cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="35 16" /> : playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M7 3.8a.8.8 0 0 1 1.2-.7l12 8.2a.8.8 0 0 1 0 1.4l-12 8.2a.8.8 0 0 1-1.2-.7z" />}
      </svg>
    </button>
    <span className="music-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    {failed && <span className="music-error" role="status">Preview unavailable. Open in Apple Music.</span>}
  </section>
}
