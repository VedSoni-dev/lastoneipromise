import { useState, useEffect, useCallback } from 'react'
import Grainient from './Grainient'
import './ScrollGrainient.css'

// Color stops for each scroll section
const COLOR_STOPS = [
  { color1: '#FF6B6B', color2: '#4ECDC4', color3: '#845EC2' }, // hero: coral/teal/purple
  { color1: '#4ECDC4', color2: '#845EC2', color3: '#F9A826' }, // work: teal/purple/gold
  { color1: '#845EC2', color2: '#F9A826', color3: '#FF6B6B' }, // blog: purple/gold/coral
  { color1: '#F9A826', color2: '#FF6B6B', color3: '#4ECDC4' }, // about: gold/coral/teal
]

function hexToFloats(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

function lerpColor(hex1, hex2, t) {
  const c1 = hexToFloats(hex1)
  const c2 = hexToFloats(hex2)
  const r = Math.round((c1[0] + (c2[0] - c1[0]) * t) * 255)
  const g = Math.round((c1[1] + (c2[1] - c1[1]) * t) * 255)
  const b = Math.round((c1[2] + (c2[2] - c1[2]) * t) * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getColors(scrollProgress) {
  const numSegments = COLOR_STOPS.length - 1
  const segment = Math.min(Math.floor(scrollProgress * numSegments), numSegments - 1)
  const segmentProgress = (scrollProgress * numSegments) - segment

  const from = COLOR_STOPS[segment]
  const to = COLOR_STOPS[Math.min(segment + 1, COLOR_STOPS.length - 1)]

  return {
    color1: lerpColor(from.color1, to.color1, segmentProgress),
    color2: lerpColor(from.color2, to.color2, segmentProgress),
    color3: lerpColor(from.color3, to.color3, segmentProgress),
  }
}

export default function ScrollGrainient({ scrollRef }) {
  const [colors, setColors] = useState(COLOR_STOPS[0])

  const handleScroll = useCallback(() => {
    const el = scrollRef?.current
    if (!el) return
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return
    const progress = Math.min(el.scrollTop / maxScroll, 1)
    setColors(getColors(progress))
  }, [scrollRef])

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollRef, handleScroll])

  return (
    <div className="scroll-grainient-bg">
      <Grainient
        color1={colors.color1}
        color2={colors.color2}
        color3={colors.color3}
        timeSpeed={0.15}
        warpStrength={1}
        warpFrequency={4}
        warpSpeed={1.5}
        warpAmplitude={60}
        blendSoftness={0.08}
        rotationAmount={400}
        noiseScale={2}
        grainAmount={0.08}
        grainScale={2}
        grainAnimated
        contrast={1.15}
        gamma={1.1}
        saturation={0.9}
        zoom={0.85}
      />
    </div>
  )
}
