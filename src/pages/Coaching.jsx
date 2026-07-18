import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import SiteNav from '../components/SiteNav'
import { PERSON, SITE_URL } from '../seo'
import './Coaching.css'

const BUILT = [
  { label: 'Fern', href: 'https://trytalkr.com', note: '12,500 users' },
  { label: 'Cognition', href: 'https://cognitionus.com', note: '35,000+ users, backed by Google DeepMind' },
  { label: 'Piller', note: 'bespoke AI for real estate firms' },
  { label: 'Eden', href: 'https://eden-robotics.github.io/Eden/', note: 'Texas A&M robotics lab' },
  { label: 'Teachy', href: 'https://vedantsoni.com', note: 'the simplest interface in the world to learn AI or build software' },
]

const EMAIL_SUBJECT = encodeURIComponent('Coaching call')
const EMAIL_BODY = encodeURIComponent(
  "Hey Vedant — I'd like to grab a coaching call.\n\nWhat I'm building:\nWhere I'm stuck:\nHow many people (just me, or bringing others):\n"
)
const BOOK_HREF = `mailto:${PERSON.email}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`

export default function CoachingPage() {
  return (
    <div className="coach-page">
      <SEOHead
        title={`Coaching — ${PERSON.name}`}
        description="1:1 startup and AI coaching from Vedant Soni — founder of Teachy, builder of Fern and Cognition (35,000+ users). Book a call to get unstuck on your bootstrapped build."
        url={`${SITE_URL}/coaching`}
      />

      <header className="coach-header">
        <h1 className="coach-name">
          <Link to="/">{PERSON.name}</Link>
        </h1>
        <SiteNav />
      </header>

      <main className="coach-main">
        <section className="coach-intro">
          <div className="coach-photo" role="img" aria-label={`Photo of ${PERSON.name}`}>
            <img
              src="/coaching-photo.jpg"
              alt={PERSON.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement.classList.add('coach-photo--empty')
              }}
            />
            <span className="coach-photo-fallback" aria-hidden="true">VS</span>
          </div>

          <div className="coach-intro-copy">
            <p className="coach-eyebrow">Coaching</p>
            <h2 className="coach-headline">I help founders bootstrap their software.</h2>
            <p>
              I'm 20. I've built and shipped four products — two consumer apps with tens of
              thousands of users, a bespoke AI platform for a whole industry, and a robotics
              lab project — without ever raising outside capital or hiring an agency. I coach
              other founders and builders through the same thing: scoping a real product, shipping
              fast with AI tools, and getting to users without burning your savings.
            </p>
            <p>
              I love this part of the work — most of my best ideas came from talking a problem
              through out loud with someone who'd actually built something before. That's what
              these calls are for.
            </p>
          </div>
        </section>

        <section className="coach-section" aria-labelledby="coach-built-heading">
          <h3 id="coach-built-heading" className="coach-section-title">What I've built</h3>
          <ul className="coach-built-list">
            {BUILT.map((item) => (
              <li key={item.label} className="coach-built-item">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                ) : (
                  <span className="coach-built-label">{item.label}</span>
                )}
                <span className="coach-built-note">{item.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="coach-cta" aria-labelledby="coach-cta-heading">
          <div className="coach-plan coach-plan--solo">
            <div className="coach-plan-top">
              <span className="coach-plan-name">Intro call</span>
              <span className="coach-plan-time">15 min</span>
            </div>
            <span className="coach-plan-price">Free</span>
            <p className="coach-plan-body">
              No pitch, no pressure — just tell me what you're building and where you're
              stuck. Solo or bring your co-founders. If it makes sense to keep working
              together after that, including a longer bootcamp-style program, we'll figure
              out the format and rate then.
            </p>
          </div>

          <h3 id="coach-cta-heading" className="coach-cta-heading">Interested? Email me.</h3>
          <a className="coach-cta-button" href={BOOK_HREF}>
            Email {PERSON.email}
          </a>
        </section>
      </main>
    </div>
  )
}
