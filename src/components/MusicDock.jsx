import { useEffect, useRef, useState } from 'react'

const TRACK = {
  title: 'Solar Eclipse',
  artist: 'Drake & Don Toliver',
  album: 'HABIBTI (FOMO)',
  url: 'https://music.apple.com/us/album/solar-eclipse/6818059268?i=6818059593',
  artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/62/58/98/62589807-decc-d418-eb07-5060de9a2d3e/26UMGIM63617.rgb.jpg/300x300bb.jpg',
  preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9f/d3/6f/9fd36f93-027f-aef8-67cc-e9701f8cf4f5/mzaf_4702287322687146814.plus.aac.p.m4a',
}

export default function MusicDock() {
  const audioRef = useRef(null)
  const userControlledRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    let active = true
    let waitingForGesture = false
    audio.volume = 0.35

    function stopListening() {
      document.removeEventListener('click', startOnInteraction)
      document.removeEventListener('keydown', startOnInteraction)
    }

    async function start() {
      waitingForGesture = false
      try {
        await audio.play()
        stopListening()
      } catch (error) {
        if (!active || userControlledRef.current) return
        if (error.name === 'NotAllowedError') {
          waitingForGesture = true
        } else if (error.name !== 'AbortError') {
          setFailed(true)
          stopListening()
        }
      }
    }

    function startOnInteraction(event) {
      if (!waitingForGesture || userControlledRef.current) return
      // The player's own button handles its gesture so it never toggles twice.
      if (event.target.closest?.('.music-toggle')) return
      if (event.type === 'keydown' && (event.repeat || !['Enter', ' '].includes(event.key))) return
      void start()
    }

    document.addEventListener('click', startOnInteraction)
    document.addEventListener('keydown', startOnInteraction)
    void start()
    return () => {
      active = false
      stopListening()
      audio.pause()
    }
  }, [])

  async function toggle() {
    userControlledRef.current = true
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
    <audio ref={audioRef} src={TRACK.preview} preload="auto" loop
      onPlaying={() => { setPlaying(true); setLoading(false) }}
      onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setProgress(0) }}
      onError={() => { setFailed(true); setPlaying(false); setLoading(false) }}
      onTimeUpdate={event => {
        const audio = event.currentTarget
        setProgress(audio.duration && !audio.ended ? audio.currentTime / audio.duration : 0)
      }} />
    <a className="music-track" href={TRACK.url} target="_blank" rel="noreferrer" aria-label={`${TRACK.title} by ${TRACK.artist} on Apple Music`}>
      <img src={TRACK.artwork} width="44" height="44" alt={`${TRACK.album} album cover`} />
      <span><strong>{TRACK.title}</strong><span>{TRACK.artist}</span></span>
    </a>
    <button className="icon-button music-toggle" onClick={toggle} disabled={loading}
      aria-label={loading ? `Loading ${TRACK.title} preview` : playing ? `Pause ${TRACK.title}` : `Play ${TRACK.title} preview`}
      title={playing ? 'Pause' : 'Play preview'} aria-busy={loading}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {loading ? <circle className="music-loading" cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="35 16" /> : playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M7 3.8a.8.8 0 0 1 1.2-.7l12 8.2a.8.8 0 0 1 0 1.4l-12 8.2a.8.8 0 0 1-1.2-.7z" />}
      </svg>
    </button>
    <span className="music-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    {failed && <span className="music-error" role="status">Preview unavailable. Open in Apple Music.</span>}
  </section>
}
