import { Link, useLocation } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import RetroEmulator from '../components/RetroEmulator'
import './Consult.css'

const FOOTER_LINKS = [
  { label: 'fern', href: 'https://fern-chi.vercel.app/' },
  { label: 'eden-robotics', href: 'https://eden-robotics.github.io/Eden/' },
  { label: 'cognition', href: 'https://cognitionus.com' },
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
        description="Vedant Soni builds AI products and researches robotics at Texas A&M."
        keywords="Vedant Soni, AI, robotics, Fern, Texas A&M"
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
              I'm 20, building{' '}
              <a href="https://fern-chi.vercel.app/" target="_blank" rel="noreferrer">Fern</a>
              , AI tools for children with disabilities with 10,000+ users, and researching
              humanoid robots at{' '}
              <a href="https://www.tamu.edu/" target="_blank" rel="noreferrer">Texas A&amp;M</a>
              , backed by{' '}
              <a href="https://www.nvidia.com/" target="_blank" rel="noreferrer">NVIDIA</a>
              {' '}and{' '}
              <a href="https://deepmind.google/" target="_blank" rel="noreferrer">Google DeepMind</a>.
            </p>
            <p>
              I've always believed AI should be useful to normal people, not just researchers.
              That's what I build.
            </p>

            <footer className="aura-footer">
              {FOOTER_LINKS.map((link, i) => (
                <span key={link.label} className="aura-footer-item">
                  {i > 0 && <span className="aura-sep" aria-hidden="true">|</span>}
                  <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
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
