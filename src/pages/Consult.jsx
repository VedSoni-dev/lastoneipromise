import { Link, useLocation } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import RetroEmulator from '../components/RetroEmulator'
import './Consult.css'

const FOOTER_ITEMS = [
  { label: 'fern', href: 'https://trytalkr.com' },
  { label: 'eden-robotics', href: 'https://eden-robotics.github.io/Eden/' },
  { label: 'cognition', href: 'https://cognitionus.com' },
  { label: 'recreach' },
]

function AuraNav() {
  const { pathname } = useLocation()

  return (
    <nav className="aura-nav" aria-label="Primary navigation">
      <Link to="/" className={pathname === '/' ? 'active' : undefined}>Home</Link>
      <a href="https://github.com/VedSoni-dev" target="_blank" rel="noreferrer">GitHub</a>
      <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noreferrer">LinkedIn</a>
    </nav>
  )
}

export default function ConsultPage() {
  return (
    <div className="aura-page">
      <SEOHead
        title="Vedant Soni"
        description="Vedant Soni is building Wick, an AI that turns legacy companies AI native and self-driving. Previously built Fern. Researches robotics at Texas A&M."
        keywords="Vedant Soni, Wick, AI, robotics, Texas A&M"
        url="https://vedantsoni.com"
      />

      <header className="aura-header">
        <Link to="/" className="aura-name">Vedant Soni</Link>
        <AuraNav />
      </header>

      <main className="aura-main">
        <div className="aura-grid">
          <div className="aura-copy">
            <p>
              I'm 20, building Wick, an AI that turns legacy companies AI native and self-driving.
              I previously built{' '}
              <a href="https://trytalkr.com" target="_blank" rel="noreferrer">Fern</a>
              , AI tools for children with disabilities that reached 10,000+ users, and I'm researching
              humanoid robots at{' '}
              <a href="https://www.tamu.edu/" target="_blank" rel="noreferrer">Texas A&amp;M</a>
              , backed by{' '}
              <a href="https://www.nvidia.com/" target="_blank" rel="noreferrer">NVIDIA</a>
              {' '}and{' '}
              <a href="https://deepmind.google/" target="_blank" rel="noreferrer">Google DeepMind</a>.
            </p>
            <p>
              I've always believed legacy companies should become AI native, not just talk about it.
              That's what Wick is for.
            </p>

            <footer className="aura-footer">
              {FOOTER_ITEMS.map((item, i) => (
                <span key={item.label} className="aura-footer-item">
                  {i > 0 && <span className="aura-sep" aria-hidden="true">|</span>}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  ) : (
                    <span className="aura-footer-label">{item.label}</span>
                  )}
                </span>
              ))}
            </footer>
          </div>

          <RetroEmulator />
        </div>
      </main>
    </div>
  )
}
