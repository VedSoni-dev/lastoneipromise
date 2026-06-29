import { useState, useRef, useEffect, useCallback, useId } from 'react'
import Grainient from '../components/Grainient'
import SEOHead from '../components/SEOHead'
import './Consult.css'

const STORIES = [
  {
    key: 'fern',
    name: 'fern',
    tag: 'AI for kids who can\'t speak',
    body: `fern started because of my brother.

watching someone you love struggle to communicate — and knowing the tools that exist to help are decades behind where they should be — changes you. i understood the problem from the inside. not as a builder looking for a market. as a family member who lived it.

so i built fern. AI-powered communication tools designed specifically for children with disabilities. no VC pressure, no growth hacking. just something that needed to exist.

it hit 10,000 users. the emails i get from parents are the reason i keep building. rebooted it from scratch in may 2026 — new architecture, same mission.`,
    link: 'https://fern-chi.vercel.app/',
  },
  {
    key: 'cognition',
    name: 'cognition',
    tag: 'YC-validated AI learning platform',
    body: `cognition was an AI-native learning platform — think personalized tutoring that actually adapts to how you think, not just what you got wrong.

within a week of launching we signed 8 clients, including a YC company. NVIDIA and Google DeepMind backed us. YC partners validated the approach.

i was cofounder & CTO. i built the entire technical architecture — from the adaptive learning engine to the inference pipeline. we got a YC interview. we didn't get in. we're going back.`,
    link: 'https://cognitionus.com',
  },
  {
    key: 'eden',
    name: 'eden robotics',
    tag: 'humanoid robots with cognitive architectures',
    body: `eden is a 15-person research team i founded and lead. we're building humanoid robots that don't just move — they reason.

we train reinforcement learning policies in NVIDIA Isaac Sim and design cognitive architectures that let robots adapt to unstructured environments in real time.

most robotics research optimizes for demos. we're optimizing for the real world.`,
    link: 'https://eden-robotics.github.io/Eden/',
  },
  {
    key: 'pillar',
    name: 'pillar AI',
    tag: 'AI automations for real estate',
    body: `real estate is one of the most process-heavy industries alive — and almost none of those processes have been touched by AI yet.

pillar AI changed that for 15+ clients. we automated lead follow-up, document processing, listing workflows, and client communication. agents that actually worked in production, not just in a pitch deck.

i built it, sold it, and ran it. then moved on.`,
    link: null,
  },
  {
    key: 'tamu',
    name: 'texas a&m — VP of IT',
    tag: 'only student SWE, handpicked out of 70k',
    body: `out of 70,000 students at texas a&m, i was the only one brought in as a software engineer directly by the VP of IT.

i build systems the university actually runs on — not student projects, not sandbox environments. production infrastructure used by faculty, staff, and students every day.

it taught me how to work inside large, complex orgs and actually ship. something most engineers never learn until way too late.`,
    link: null,
  },
]

function StoryCard({ story }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className={`story-card ${open ? 'open' : ''}`}>
      <button
        className="story-card-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id}
      >
        <div className="story-card-left">
          <span className="story-card-name">{story.name}</span>
          <span className="story-card-tag">{story.tag}</span>
        </div>
        <span className="story-card-arrow" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="story-card-body" id={id}>
          {story.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          {story.link && (
            <a
              href={story.link}
              className="story-card-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              see it →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

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

function StickyMobileCTA({ onClick }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-consult')
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`sticky-mobile-cta${visible ? ' visible' : ''}`}>
      <button onClick={onClick}>let's build →</button>
    </div>
  )
}

function BgOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </div>
  )
}

function ScrollProgress({ scrollRef }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return
    const update = () => {
      const max = el.scrollHeight - el.clientHeight
      setPct(max > 0 ? Math.min(el.scrollTop / max, 1) : 0)
    }
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scrollRef])
  return (
    <div className="scroll-progress-bar" aria-hidden="true">
      <div className="scroll-progress-fill" style={{ transform: `scaleX(${pct})` }} />
    </div>
  )
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
      <StickyMobileCTA onClick={skipToForm} />
      <div className="consult-scroll-container" ref={scrollRef}>
        <ScrollProgress scrollRef={scrollRef} />
        <CalmGrainient scrollRef={scrollRef} />
        <BgOrbs />

        {/* Hero */}
        <section className="consult-section consult-hero" id="hero-consult">
          <div className="consult-section-inner">
            <p className="consult-eyebrow">vedant soni · age 20</p>
            <h1 className="consult-hero-title">
              i will be the next musk.<br />or jensen. or whoever<br />your favorite entrepreneur is.
            </h1>
            <p className="consult-hero-tagline">
              i build AI companies. now i'm building yours.<br />
              most teams spend months figuring out where AI fits.
              i'll have an answer — and something working — inside a week.
            </p>
            <div className="consult-receipts">
              <span>6 startups built</span>
              <span>10,000+ users shipped to</span>
              <span>backed by nvidia & deepmind</span>
              <span>$250K+ offers turned down</span>
            </div>
            <div className="consult-hero-actions">
              <button className="consult-cta-primary" onClick={skipToForm}>
                let's build →
              </button>
              <button className="consult-cta-ghost" onClick={skipToForm}>
                read my story
              </button>
            </div>
          </div>
        </section>

        {/* Story 1 — who i am */}
        <section className="consult-section" id="story1-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">who i am</p>
            <div className="consult-story-body">
              <p>
                i know how this looks. a 20-year-old calling himself a forward deployed AI engineer.
                so i'm not going to ask you to take my word for it.
              </p>
              <p>
                i've built 6 startups from scratch. led engineering teams. shipped products to real users.
                made real money. i'm also the only student software engineer at texas a&m —
                handpicked by the VP of IT out of 70,000 students to build systems the university actually runs on.
              </p>
              <p>
                i'm not a consultant with a deck. i'm a builder who's been in the trenches —
                debugging at 2am, closing clients, rebuilding from zero when it didn't work.
                the receipts are below. click anything.
              </p>
            </div>
            <div className="story-cards">
              {STORIES.map(s => <StoryCard key={s.key} story={s} />)}
            </div>
            <button className="consult-skip-link" style={{ marginTop: '2rem' }} onClick={skipToForm}>
              skip to the form →
            </button>
          </div>
        </section>

        {/* Story 2 — why i do this */}
        <section className="consult-section" id="story2-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">why i do this</p>
            <div className="consult-story-body">
              <p>
                every startup i built showed me the same thing from a different angle.
              </p>
              <p>
                with fern, i watched parents spend hours searching for tools to help their kids communicate —
                tools that already existed, or could be built in a week with AI.
                with cognition, i watched students grind through material the hard way
                when better learning was one prompt away.
              </p>
              <p>
                the problem wasn't the technology. the problem was that nobody knew how to use it.
              </p>
              <p>
                AI fluency is the unlock. and most people — most teams, most companies —
                don't have it yet. not because they're behind, but because nobody's shown them.
              </p>
              <p>
                i've been offered salaries over $250K to drop out and work as a forward deployed
                engineer at some of the biggest companies in the world. i turned them down.
              </p>
              <p>
                i'm 20. there is no better time in my life to take risk than right now.
                i'd rather use my skills and your experience to build something real together
                than collect a paycheck building someone else's vision.
              </p>
              <p>
                so here's what i actually do when i work with you:
              </p>
            </div>
            <ul className="consult-services">
              <li>i come into your company and understand how it actually runs</li>
              <li>i build an AI foundation — automating the processes that are slowing you down</li>
              <li>i make your team AI fluent on top of that foundation, so they own it</li>
              <li>i introduce you to my software to keep your team current on frontier AI tools</li>
            </ul>
            <p className="consult-honest-note">
              the goal is that you don't need me again. that's how i know it worked.
            </p>
            <button className="consult-skip-link" onClick={skipToForm}>
              let's talk →
            </button>
          </div>
        </section>

        {/* Case Study */}
        <section className="consult-section" id="casestudy-consult">
          <div className="consult-section-inner">
            <p className="consult-section-label">case study</p>
            <div className="case-study-card">
              <div className="case-study-header">
                <div>
                  <h2 className="case-study-name">pillar AI</h2>
                  <p className="case-study-meta">real estate automation · 15 clients · 2025</p>
                </div>
                <div className="case-study-stats">
                  <div className="case-stat">
                    <span className="case-stat-value">15+</span>
                    <span className="case-stat-label">clients</span>
                  </div>
                  <div className="case-stat">
                    <span className="case-stat-value">&lt;2min</span>
                    <span className="case-stat-label">lead response</span>
                  </div>
                  <div className="case-stat">
                    <span className="case-stat-value">10hrs</span>
                    <span className="case-stat-label">saved / week</span>
                  </div>
                </div>
              </div>

              <div className="case-study-body">
                <div className="case-block">
                  <p className="case-block-label">the problem</p>
                  <p className="case-block-text">
                    real estate agents were losing leads because follow-up was happening hours — sometimes days — after the initial inquiry. documents were processed by hand. writing a listing description took 45 minutes each. the agents knew they needed to move faster. they just didn't know how.
                  </p>
                </div>
                <div className="case-block">
                  <p className="case-block-label">what i built</p>
                  <p className="case-block-text">
                    an AI agent pipeline that triggered within 2 minutes of any new lead — personalized outreach, property recommendations, and follow-up sequences, fully automated. document extraction for contracts and disclosures. a listing description generator trained on high-converting copy.
                  </p>
                </div>
                <div className="case-block">
                  <p className="case-block-label">the result</p>
                  <p className="case-block-text">
                    15+ clients onboarded. lead response time dropped from hours to under 2 minutes. each agent saved 8–10 hours a week on admin. one client closed 3 deals in the first month they would have missed before.
                  </p>
                </div>
              </div>
            </div>
            <button className="consult-skip-link" style={{ marginTop: '2rem' }} onClick={skipToForm}>
              want this for your company? →
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
