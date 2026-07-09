import { useEffect, useRef } from 'react'
import './AIWorkVisual.css'

function ConsumerCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0
    let particles = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor((rect.width * rect.height) / 900)
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: 0.6 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const t = prefersReduced ? 0 : frame * 0.008

      for (const p of particles) {
        p.x += p.vx + Math.sin(t + p.phase) * 0.12
        p.y += p.vy + Math.cos(t * 0.7 + p.phase) * 0.12

        if (p.x < -4) p.x = w + 4
        if (p.x > w + 4) p.x = -4
        if (p.y < -4) p.y = h + 4
        if (p.y > h + 4) p.y = -4

        const pulse = 0.15 + (Math.sin(t * 1.4 + p.phase) + 1) * 0.22
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${pulse})`
        ctx.fill()
      }

      // density clusters — the "mass" of consumer scale
      const clusters = [
        { cx: w * 0.28, cy: h * 0.38, spread: w * 0.18 },
        { cx: w * 0.62, cy: h * 0.55, spread: w * 0.22 },
        { cx: w * 0.78, cy: h * 0.28, spread: w * 0.14 },
      ]

      for (const c of clusters) {
        const grad = ctx.createRadialGradient(c.cx, c.cy, 0, c.cx, c.cy, c.spread)
        grad.addColorStop(0, 'rgba(0,0,0,0.09)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(c.cx - c.spread, c.cy - c.spread, c.spread * 2, c.spread * 2)
      }

      frame++
      if (!prefersReduced) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="ai-visual-canvas" aria-hidden="true" />
}

function BespokeCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawBlueprint = (w, h, t) => {
      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.5
      const scale = Math.min(w, h) * 0.34

      // outer ring — slow rotation
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * 0.06)

      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const r = scale * (0.85 + Math.sin(t + i) * 0.04)
        ctx.beginPath()
        ctx.arc(0, 0, r, angle, angle + Math.PI / 3 - 0.08)
        ctx.stroke()
      }

      // core structure — bespoke, one-of-one geometry
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2.5
      const nodes = 8
      const pts = []
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2 - Math.PI / 2
        const wobble = Math.sin(t * 0.5 + i * 1.1) * scale * 0.06
        pts.push({
          x: Math.cos(a) * (scale * 0.55 + wobble),
          y: Math.sin(a) * (scale * 0.55 + wobble),
        })
      }

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.closePath()
      ctx.stroke()

      // inner cross-hatch — precision lines
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      for (let i = 0; i < nodes; i++) {
        const next = (i + 3) % nodes
        ctx.beginPath()
        ctx.moveTo(pts[i].x, pts[i].y)
        ctx.lineTo(pts[next].x, pts[next].y)
        ctx.stroke()
      }

      // center node
      ctx.beginPath()
      ctx.arc(0, 0, 6 + Math.sin(t) * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()

      // annotation ticks
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = 1
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        const r1 = scale * 0.72
        const r2 = scale * (i % 3 === 0 ? 0.82 : 0.76)
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1)
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2)
        ctx.stroke()
      }

      ctx.restore()

      // corner brackets — blueprint framing
      const pad = 28
      const len = 48
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      const corners = [
        [pad, pad + len, pad, pad, pad + len, pad],
        [w - pad, pad + len, w - pad, pad, w - pad - len, pad],
        [pad, h - pad - len, pad, h - pad, pad + len, h - pad],
        [w - pad, h - pad - len, w - pad, h - pad, w - pad - len, h - pad],
      ]
      for (const [x1, y1, x2, y2, x3, y3] of corners) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.stroke()
      }

      // scan line
      const scanY = pad + ((Math.sin(t * 0.4) + 1) / 2) * (h - pad * 2)
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, scanY)
      ctx.lineTo(w - pad, scanY)
      ctx.stroke()
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      drawBlueprint(canvas.clientWidth, canvas.clientHeight, prefersReduced ? 0 : frame * 0.016)
      frame++
      if (!prefersReduced) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="ai-visual-canvas" aria-hidden="true" />
}

const SECTIONS = [
  {
    id: 'consumer',
    label: 'Consumer AI',
    title: 'I build consumer AI.',
    body: 'Products that reach real people at scale — Fern for families, Cognition for 35,000+ learners backed by Google DeepMind. Mass adoption, not demos.',
    bold: true,
    Visual: ConsumerCanvas,
    refs: [
      { label: 'Fern', href: 'https://trytalkr.com' },
      { label: 'Cognition', href: 'https://cognitionus.com' },
    ],
  },
  {
    id: 'bespoke',
    label: 'Bespoke AI',
    title: 'I build bespoke AI.',
    body: 'Custom systems mapped to how one company actually runs — Wick rebuilds workflows end to end. Eden put memory and emotion inside robots. Built for one context, not everyone.',
    bold: false,
    Visual: BespokeCanvas,
    refs: [
      { label: 'Wick', href: 'https://vedantsoni.com' },
      { label: 'Eden', href: 'https://eden-robotics.github.io/Eden/' },
    ],
  },
]

export default function AIWorkVisual() {
  return (
    <section className="ai-work" aria-label="What I build">
      {SECTIONS.map((section, i) => (
        <article
          key={section.id}
          className={`ai-work-block${section.bold ? ' ai-work-block--bold' : ''}`}
        >
          <div className="ai-work-visual">
            <section.Visual />
            <span className="ai-work-tag">{section.label}</span>
          </div>

          <div className="ai-work-copy">
            <span className="ai-work-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h2 className="ai-work-title">{section.title}</h2>
            <p className="ai-work-body">{section.body}</p>
            <div className="ai-work-refs">
              {section.refs.map((ref, j) => (
                <span key={ref.label} className="ai-work-ref">
                  {j > 0 && <span className="ai-work-ref-sep" aria-hidden="true">·</span>}
                  <a href={ref.href} target="_blank" rel="noreferrer">
                    {ref.label}
                  </a>
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
