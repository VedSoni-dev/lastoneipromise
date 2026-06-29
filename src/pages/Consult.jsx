import { useState, useRef, useEffect, useCallback } from 'react'
import Grainient from '../components/Grainient'
import SEOHead from '../components/SEOHead'
import './Consult.css'

const CALM_COLOR_STOPS = [
  { color1: '#1B2A4A', color2: '#0F1A2E', color3: '#1E3050' }, // hero: deep navy
  { color1: '#152830', color2: '#1B2A40', color3: '#163040' }, // story 1: slate/teal
  { color1: '#141A38', color2: '#1A2042', color3: '#101828' }, // story 2: midnight indigo
  { color1: '#0A1220', color2: '#141C2E', color3: '#0D1622' }, // form: near-black
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
  const numSegments = CALM_COLOR_STOPS.length - 1
  const segment = Math.min(Math.floor(scrollProgress * numSegments), numSegments - 1)
  const segmentProgress = scrollProgress * numSegments - segment
  const from = CALM_COLOR_STOPS[segment]
  const to = CALM_COLOR_STOPS[Math.min(segment + 1, CALM_COLOR_STOPS.length - 1)]
  return {
    color1: lerpColor(from.color1, to.color1, segmentProgress),
    color2: lerpColor(from.color2, to.color2, segmentProgress),
    color3: lerpColor(from.color3, to.color3, segmentProgress),
  }
}

function CalmGrainient({ scrollRef }) {
  const [colors, setColors] = useState(CALM_COLOR_STOPS[0])

  const handleScroll = useCallback(() => {
    const el = scrollRef?.current
    if (!el) return
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return
    setColors(getColors(Math.min(el.scrollTop / maxScroll, 1)))
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
        timeSpeed={0.07}
        warpStrength={0.5}
        warpFrequency={3}
        warpSpeed={0.7}
        warpAmplitude={35}
        blendSoftness={0.15}
        rotationAmount={220}
        noiseScale={2}
        grainAmount={0.05}
        grainScale={2}
        grainAnimated
        contrast={0.98}
        gamma={1.0}
        saturation={0.5}
        zoom={0.9}
      />
    </div>
  )
}

function ConsultForm() {
  const [step, setStep] = useState(1)
  const [problem, setProblem] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleContinue = (e) => {
    e.preventDefault()
    if (problem.trim().length < 10) return
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, problem }),
      })
      if (res.ok) {
        setStatus('done')
        setStep(3)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (step === 3) {
    return (
      <div className="consult-done">
        <div className="consult-done-check">✓</div>
        <h3 className="consult-done-title">got it.</h3>
        <p className="consult-done-body">
          i read every request personally. i'll reach out once i've had a chance to review yours — usually within 48 hours.
        </p>
        <p className="consult-done-sub">
          in the meantime, feel free to connect on{' '}
          <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noopener noreferrer">linkedin</a>
          {' '}or follow along on{' '}
          <a href="https://x.com/VedantRobot" target="_blank" rel="noopener noreferrer">x</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="consult-form-wrapper">
      {step === 1 && (
        <form className="consult-step" onSubmit={handleContinue} key="step1">
          <label className="consult-label">
            what are you working on?<br />
            what's the problem?
          </label>
          <textarea
            className="consult-textarea"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="tell me about your situation. the messier, the better."
            rows={5}
            autoFocus
          />
          <button
            type="submit"
            className="consult-btn"
            disabled={problem.trim().length < 10}
          >
            continue →
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="consult-step" onSubmit={handleSubmit} key="step2">
          <label className="consult-label">your email.</label>
          <p className="consult-sublabel">
            so i can reach out once i've reviewed your request.
          </p>
          <input
            type="email"
            className="consult-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
          <div className="consult-form-actions">
            <button
              type="button"
              className="consult-back"
              onClick={() => { setStep(1); setStatus('idle') }}
            >
              ← back
            </button>
            <button
              type="submit"
              className="consult-btn"
              disabled={!email || status === 'sending'}
            >
              {status === 'sending' ? '...' : 'send it →'}
            </button>
          </div>
          {status === 'error' && (
            <p className="consult-error">something broke. try again.</p>
          )}
        </form>
      )}

      <div className="consult-step-indicator">
        <span className={step === 1 ? 'dot active' : 'dot'} />
        <span className={step === 2 ? 'dot active' : 'dot'} />
      </div>
    </div>
  )
}

export default function ConsultPage() {
  const scrollRef = useRef(null)

  const skipToForm = () => {
    const el = document.getElementById('form-consult')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <SEOHead
        title="AI Engineering & Coaching — Vedant Soni"
        description="Forward deployed AI engineer. 6 startups, led teams, handpicked by Texas A&M's VP of IT. I embed with your team and make AI actually work."
        url="https://vedantsoni.com"
      />
      <div className="consult-scroll-container" ref={scrollRef}>
        <CalmGrainient scrollRef={scrollRef} />

        {/* Hero */}
        <section className="consult-section consult-hero" id="hero-consult">
          <div className="consult-section-inner">
            <p className="consult-eyebrow">vedant soni</p>
            <h1 className="consult-hero-title">
              forward deployed<br />AI engineer.
            </h1>
            <p className="consult-hero-tagline">
              i embed with your team, figure out exactly where AI fits,
              and build it with you. startups and legacy businesses alike.
            </p>
            <div className="consult-hero-actions">
              <button className="consult-cta-primary" onClick={skipToForm}>
                work with me →
              </button>
              <button className="consult-cta-ghost" onClick={skipToForm}>
                skip my story
              </button>
            </div>
          </div>
        </section>

        {/* Story 1 */}
        <section className="consult-section" id="story1-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">who i am</p>
            <div className="consult-story-body">
              <p>
                i've built 6 startups. led engineering teams. made real money doing it.
              </p>
              <p>
                <strong>fern</strong> hit 10,000 users — AI tools for kids who can't communicate.
                <strong> cognition</strong> got backed by nvidia and google deepmind, validated by YC partners.
                <strong> pillar AI</strong> automated workflows for 15+ real estate clients.
                <strong> recreach</strong> got backed by google for startups.
              </p>
              <p>
                i'm also the only student software engineer at texas a&m — handpicked by the VP of IT
                out of 70,000 students. i build production systems that the university actually runs on.
              </p>
              <p>
                i know what it takes to ship real AI products, not demo-ware.
              </p>
            </div>
            <button className="consult-skip-link" onClick={skipToForm}>
              skip to the form →
            </button>
          </div>
        </section>

        {/* Story 2 */}
        <section className="consult-section" id="story2-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">why i do this</p>
            <div className="consult-story-body">
              <p>
                AI fluency is the problem. and it's not just a startup problem.
              </p>
              <p>
                fortune 500s, regional businesses, hospitals, law firms — they all know they need AI.
                none of them know what that actually means in practice.
                they're getting sold dashboards when they need workflows.
                they're paying for chatbots when they need agents.
              </p>
              <p>
                i embed directly with teams — startup or legacy — figure out where AI creates real leverage,
                and build it. hands-on. not a deck. not a strategy doc. actual working software.
              </p>
              <p>
                and i'll teach you everything along the way so you're not dependent on me forever.
              </p>
            </div>
            <ul className="consult-services">
              <li>AI fluency coaching for teams & leaders</li>
              <li>forward deployed engineering (i build with you)</li>
              <li>workflow automation & agent development</li>
              <li>architecture reviews & stack decisions</li>
            </ul>
            <button className="consult-skip-link" onClick={skipToForm}>
              let's talk →
            </button>
          </div>
        </section>

        {/* Form */}
        <section className="consult-section consult-form-section" id="form-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">let's work together</p>
            <h2 className="consult-form-title">tell me what you're dealing with.</h2>
            <p className="consult-form-subtitle">
              startup or 100-year-old company — doesn't matter. i read every request personally.
            </p>
            <ConsultForm />
          </div>

          <footer className="consult-footer">
            <div className="consult-footer-links">
              <a href="/portfolio" className="consult-footer-link">portfolio</a>
              <a href="/blog" className="consult-footer-link">blog</a>
              <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noopener noreferrer" className="consult-footer-link">linkedin</a>
              <a href="https://x.com/VedantRobot" target="_blank" rel="noopener noreferrer" className="consult-footer-link">x</a>
            </div>
            <p className="consult-footer-copy">&copy; {new Date().getFullYear()} Vedant Soni</p>
          </footer>
        </section>
      </div>
    </>
  )
}
