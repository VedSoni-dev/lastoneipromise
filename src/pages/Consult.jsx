import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import RetroEmulator from '../components/RetroEmulator'
import SiteNav from '../components/SiteNav'
import './Consult.css'

const PAST_PROJECTS = [
  { label: 'fern', href: 'https://trytalkr.com' },
  { label: 'eden-robotics', href: 'https://eden-robotics.github.io/Eden/' },
  { label: 'cognition', href: 'https://cognitionus.com' },
  { label: 'recreach' },
]

export default function ConsultPage() {
  return (
    <div className="aura-page">
      <SEOHead
        title="Vedant Soni"
        description="Vedant Soni is building Wick, an AI that maps how companies run and rebuilds workflows so AI can operate them end to end. Previously built Fern, Cognition (35,000+ users, Google DeepMind), and Eden."
        keywords="Vedant Soni, Wick, AI, robotics, Texas A&M"
        url="https://vedantsoni.com"
      />

      <header className="aura-header">
        <Link to="/" className="aura-name">Vedant Soni</Link>
        <SiteNav />
      </header>

      <main className="aura-main">
        <div className="aura-grid">
          <div className="aura-copy">
            <p>
              I'm 20, building Wick. It maps how a company actually runs, then rebuilds
              workflows so AI can operate them end to end.
            </p>
            <p>
              I previously built{' '}
              <a href="https://trytalkr.com" target="_blank" rel="noreferrer">Fern</a>
              ,{' '}
              <a href="https://cognitionus.com" target="_blank" rel="noreferrer">Cognition</a>
              , which reached 35,000+ users and was backed by Google DeepMind, and{' '}
              <a href="https://eden-robotics.github.io/Eden/" target="_blank" rel="noreferrer">Eden</a>
              , a Texas A&amp;M lab putting emotions and memory inside robots.
              I think legacy companies should become AI native, not just talk about it.
            </p>

            <footer className="aura-footer">
              <span className="aura-footer-label">past</span>
              {PAST_PROJECTS.map((item, i) => (
                <span key={item.label} className="aura-footer-item">
                  {i > 0 && <span className="aura-sep" aria-hidden="true">|</span>}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </footer>
          </div>

          <div className="aura-game">
            <p className="aura-game-hint">play while you're here</p>
            <RetroEmulator />
          </div>
        </div>
      </main>
    </div>
  )
}
