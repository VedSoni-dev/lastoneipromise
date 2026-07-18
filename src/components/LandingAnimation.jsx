import { useEffect, useRef, useState } from 'react'
import './LandingAnimation.css'

const MODES = [
  { id: 'neural', label: 'NEURAL CORE', description: 'Real-time learning graph & synapse routing' },
  { id: 'robotics', label: 'ROBOTICS MEMORY', description: 'Spatial memory matrix & sensor fusion' },
  { id: 'workflow', label: 'ENTERPRISE FLOW', description: 'Autonomous workflow execution engine' },
]

export default function LandingAnimation() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [activeMode, setActiveMode] = useState('neural')
  const [pulseCount, setPulseCount] = useState(0)

  // We keep active mode ref so raf loop always reads latest
  const modeRef = useRef(activeMode)
  useEffect(() => {
    modeRef.current = activeMode
  }, [activeMode])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    let rafId
    let width = 0
    let height = 0
    let dpr = window.devicePixelRatio || 1

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Mouse tracking
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isHover: false }
    const shockwaves = []

    // Node & Particle data structure
    let nodes = []
    let particles = []
    let packets = []

    const initNodesAndParticles = (w, h) => {
      nodes = []
      particles = []
      packets = []

      const numNodes = Math.floor(Math.min(w, h) / 32) + 12
      for (let i = 0; i < numNodes; i++) {
        const x = (0.15 + 0.7 * Math.random()) * w
        const y = (0.15 + 0.7 * Math.random()) * h
        nodes.push({
          id: i,
          baseX: x,
          baseY: y,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          radius: 3.5 + Math.random() * 4.5,
          isHub: i < 4,
          connections: [],
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        })
      }

      // Connect nearest neighbors to form organic graph
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].baseX - nodes[j].baseX
          const dy = nodes[i].baseY - nodes[j].baseY
          const dist = Math.hypot(dx, dy)
          const maxDist = Math.min(w, h) * 0.35
          if (dist < maxDist) {
            nodes[i].connections.push(j)
            if (nodes[j].connections.length < 3) {
              nodes[j].connections.push(i)
            }
          }
        }
      }

      // Floating ambient background particles
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 1 + Math.random() * 1.5,
          alpha: 0.15 + Math.random() * 0.35,
        })
      }

      // Data packets racing between connected nodes
      for (let i = 0; i < 18; i++) {
        const fromIdx = Math.floor(Math.random() * nodes.length)
        const fromNode = nodes[fromIdx]
        const toIdx = fromNode.connections.length > 0 
          ? fromNode.connections[Math.floor(Math.random() * fromNode.connections.length)]
          : (fromIdx + 1) % nodes.length
        packets.push({
          from: fromIdx,
          to: toIdx,
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.012,
          size: 2 + Math.random() * 2,
        })
      }
    }

    const resize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
      initNodesAndParticles(width, height)
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
      mouse.isHover = true
    }

    const onMouseLeave = () => {
      mouse.isHover = false
      mouse.targetX = -1000
      mouse.targetY = -1000
    }

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.75,
        alpha: 0.9,
      })
      setPulseCount((prev) => prev + 1)
    }

    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('click', onClick)

    resize()

    let frame = 0
    const draw = () => {
      frame++

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12
      mouse.y += (mouse.targetY - mouse.y) * 0.12

      ctx.clearRect(0, 0, width, height)

      // Background grid / radar lines based on mode
      const currentMode = modeRef.current
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.lineWidth = 1

      if (currentMode === 'robotics') {
        // Spatial radar circles
        const centerX = width / 2
        const centerY = height / 2
        for (let r = 40; r < Math.max(width, height); r += 60) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        // Rotating radar line
        const radarAngle = frame * 0.02
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(radarAngle) * Math.max(width, height), centerY + Math.sin(radarAngle) * Math.max(width, height))
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
        ctx.stroke()
      } else if (currentMode === 'workflow') {
        // Isometric / pipeline grid
        for (let x = 0; x < width; x += 36) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y < height; y += 36) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
      } else {
        // Neural dot matrix
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
        for (let x = 20; x < width; x += 30) {
          for (let y = 20; y < height; y += 30) {
            ctx.fillRect(x, y, 1.5, 1.5)
          }
        }
      }

      // Update and draw shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i]
        sw.radius += 8
        sw.alpha *= 0.94

        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 0, 0, ${sw.alpha * 0.5})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
          shockwaves.splice(i, 1)
        }
      }

      // Update ambient particles
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update node physics (spring back + mouse repel/attract + shockwaves)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.phase += n.pulseSpeed

        // Target positions change slightly based on mode
        let targetX = n.baseX
        let targetY = n.baseY
        if (currentMode === 'workflow') {
          // Align more to grid lines
          targetX = Math.round(n.baseX / 40) * 40
          targetY = Math.round(n.baseY / 40) * 40
        }

        const dxBase = targetX - n.x
        const dyBase = targetY - n.y

        // Spring force towards target
        n.vx += dxBase * 0.03
        n.vy += dyBase * 0.03

        // Mouse interaction force
        if (mouse.isHover) {
          const mdx = mouse.x - n.x
          const mdy = mouse.y - n.y
          const mDist = Math.hypot(mdx, mdy)
          const mMax = 140
          if (mDist < mMax && mDist > 0) {
            const force = (1 - mDist / mMax) * 1.2
            // Hubs attract slightly, normal nodes gently push or swirl
            if (n.isHub) {
              n.vx += (mdx / mDist) * force * 0.8
              n.vy += (mdy / mDist) * force * 0.8
            } else {
              n.vx -= (mdx / mDist) * force * 1.5
              n.vy -= (mdy / mDist) * force * 1.5
            }
          }
        }

        // Shockwave forces
        for (let sw of shockwaves) {
          const swdx = sw.x - n.x
          const swdy = sw.y - n.y
          const swDist = Math.hypot(swdx, swdy)
          if (Math.abs(swDist - sw.radius) < 35 && swDist > 0) {
            const push = (1 - Math.abs(swDist - sw.radius) / 35) * 5 * sw.alpha
            n.vx -= (swdx / swDist) * push
            n.vy -= (swdy / swDist) * push
          }
        }

        // Damping
        n.vx *= 0.85
        n.vy *= 0.85
        n.x += n.vx
        n.y += n.vy
      }

      // Draw connection lines between nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        for (let j of n.connections) {
          const n2 = nodes[j]
          if (!n2) continue
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y)
          const maxDist = Math.min(width, height) * 0.38
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`
            ctx.lineWidth = n.isHub || n2.isHub ? 1.5 : 1
            ctx.stroke()
          }
        }
      }

      // Draw mouse connection rays when hovering
      if (mouse.isHover) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          const mdx = mouse.x - n.x
          const mdy = mouse.y - n.y
          const mDist = Math.hypot(mdx, mdy)
          if (mDist < 130) {
            const alpha = (1 - mDist / 130) * 0.3
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`
            ctx.setLineDash([2, 2])
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // Update and draw data packets traveling along connections
      for (let i = 0; i < packets.length; i++) {
        const pkt = packets[i]
        pkt.progress += pkt.speed
        if (pkt.progress >= 1) {
          pkt.progress = 0
          pkt.from = pkt.to
          const fromNode = nodes[pkt.from]
          if (fromNode && fromNode.connections.length > 0) {
            pkt.to = fromNode.connections[Math.floor(Math.random() * fromNode.connections.length)]
          } else {
            pkt.to = (pkt.from + 1) % nodes.length
          }
        }

        const fromNode = nodes[pkt.from]
        const toNode = nodes[pkt.to]
        if (fromNode && toNode) {
          const px = fromNode.x + (toNode.x - fromNode.x) * pkt.progress
          const py = fromNode.y + (toNode.y - fromNode.y) * pkt.progress

          ctx.beginPath()
          ctx.arc(px, py, pkt.size, 0, Math.PI * 2)
          ctx.fillStyle = '#000'
          ctx.fill()

          // Packet glow tail
          ctx.beginPath()
          ctx.arc(px, py, pkt.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
          ctx.fill()
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const pulse = Math.sin(n.phase) * 1.5

        // Outer aura ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius + 3 + pulse, 0, Math.PI * 2)
        ctx.fillStyle = n.isHub ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)'
        ctx.fill()

        // Node center
        ctx.beginPath()
        if (currentMode === 'robotics' && n.isHub) {
          // Draw geometric diamond/square for hub in robotics mode
          const size = n.radius + 2
          ctx.rect(n.x - size, n.y - size, size * 2, size * 2)
        } else {
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        }
        ctx.fillStyle = n.isHub ? '#000' : '#222'
        ctx.fill()

        // Core highlight
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
      }

      // Draw custom cursor ring indicator on canvas when hovering
      if (mouse.isHover) {
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(draw)
      }
    }

    if (prefersReduced) {
      draw()
    } else {
      draw()
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [pulseCount])

  const activeInfo = MODES.find((m) => m.id === activeMode) || MODES[0]

  return (
    <div className="landing-animation-wrapper" ref={containerRef} aria-label="Interactive Teachy Neural Engine Visualization">
      <div className="landing-animation-hud">
        <div className="landing-hud-header">
          <span className="landing-hud-title">
            <span className="landing-hud-live-dot" />
            TEACHY.ENGINE // LIVE
          </span>
          <span className="landing-hud-pulse-count">PULSES: {pulseCount}</span>
        </div>

        <div className="landing-hud-controls" role="tablist">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              role="tab"
              aria-selected={activeMode === mode.id}
              className={`landing-mode-btn ${activeMode === mode.id ? 'landing-mode-btn--active' : ''}`}
              onClick={() => setActiveMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="landing-animation-canvas"
        title="Hover or click to interact with the neural node matrix"
      />

      <div className="landing-animation-footer">
        <span className="landing-mode-desc">{activeInfo.description}</span>
        <span className="landing-hint">Click to trigger neural shockwave</span>
      </div>
    </div>
  )
}
