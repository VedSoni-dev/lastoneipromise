import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import SiteNav from '../components/SiteNav'
import { PERSON } from '../seo'
import './Consult.css'

const PAST_PROJECTS = [
  { label: 'fern', href: 'https://trytalkr.com' },
  { label: 'piller' },
  { label: 'eden-robotics', href: 'https://eden-robotics.github.io/Eden/' },
  { label: 'cognition', href: 'https://cognitionus.com' },
  { label: 'recreach' },
]

export default function ConsultPage() {
  return (
    <div className="aura-page" itemScope itemType="https://schema.org/ProfilePage">
      <SEOHead />

      <header className="aura-header">
        <h1 className="aura-name" itemProp="name">
          <Link to="/" itemProp="url">{PERSON.name}</Link>
        </h1>
        <SiteNav />
      </header>

      <main className="aura-main" itemProp="mainEntity" itemScope itemType="https://schema.org/Person">
        <meta itemProp="givenName" content={PERSON.givenName} />
        <meta itemProp="familyName" content={PERSON.familyName} />
        <meta itemProp="jobTitle" content={`${PERSON.jobTitle}, Teachy`} />
        <meta itemProp="image" content={PERSON.image} />
        <link itemProp="url" href={PERSON.url} />

        <article className="aura-intro">
          <p className="aura-lede" itemProp="description">
            I'm 20, building Teachy. The simplest interface in the world to learn AI,
            build software, or anything.
          </p>
          <p>
            I previously built{' '}
            <a href="https://trytalkr.com" target="_blank" rel="noreferrer">Fern</a>
            {' '}(12,500 users),{' '}
            <a href="https://cognitionus.com" target="_blank" rel="noreferrer">Cognition</a>
            {' '}(35,000+ users, backed by Google DeepMind),{' '}
            <span>Piller</span>
            {' '}(bespoke AI for real estate firms and realtors), and{' '}
            <a href="https://eden-robotics.github.io/Eden/" target="_blank" rel="noreferrer">Eden</a>
            , a Texas A&amp;M lab putting emotions and memory inside robots.
            I think legacy companies should become AI native, not just talk about it.
          </p>
          <p>
            I also <Link to="/coaching">coach founders</Link> bootstrapping their own software,
            and <Link to="/consulting">consult for companies</Link> who want bespoke AI built.
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
        </article>

      </main>
    </div>
  )
}
