import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import SiteNav from '../components/SiteNav'
import { PERSON, SITE_URL } from '../seo'
import './Coaching.css'

const STATS = [
  { value: '45,000+', label: 'combined users shipped' },
  { value: 'DeepMind', label: 'backed Cognition' },
  { value: 'Real estate, HVAC', label: 'verticals I build for' },
]

const PROCESS = [
  { step: '01', name: 'Discovery call', body: 'Free, 15 min. We talk through the workflow you want to automate or the system you want built.' },
  { step: '02', name: 'Scope & propose', body: "I map how the process actually runs today and come back with a fixed scope, timeline, and price." },
  { step: '03', name: 'Build & ship', body: 'I build the system end to end and get it running in your stack — not a demo, a working tool.' },
]

const BUILT = [
  { label: 'Piller', note: 'bespoke AI for real estate firms and realtors' },
  { label: 'Wick', href: 'https://vedantsoni.com', note: 'AI native workflows for legacy companies' },
  { label: 'Eden', href: 'https://eden-robotics.github.io/Eden/', note: 'bespoke robotics — memory + emotion systems' },
  { label: 'Fern', href: 'https://trytalkr.com', note: '12,500 users' },
  { label: 'Cognition', href: 'https://cognitionus.com', note: '35,000+ users, backed by Google DeepMind' },
]

const EMAIL_SUBJECT = encodeURIComponent('Consulting inquiry')
const EMAIL_BODY = encodeURIComponent(
  "Hey Vedant — we're interested in building bespoke AI.\n\nCompany:\nWhat you're trying to automate or build:\nRough timeline:\n"
)
const BOOK_HREF = `mailto:${PERSON.email}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`

export default function ConsultingPage() {
  return (
    <div className="coach-page">
      <SEOHead
        title={`Consulting — ${PERSON.name}`}
        description="Bespoke AI for companies, built by Vedant Soni — founder of Wick, builder of Piller and Eden Robotics. I map how your company actually runs and build AI that operates it end to end."
        keywords="AI consulting, bespoke AI development, custom AI for business, AI automation consultant, AI native workflows, Vedant Soni consulting"
        url={`${SITE_URL}/consulting`}
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
            <p className="coach-eyebrow">Consulting</p>
            <h2 className="coach-headline">I build bespoke AI for companies.</h2>
            <p>
              I'm 20, building Wick — I map how a company actually runs, then build AI that
              operates the workflow end to end, not a generic tool bolted on top. I've built
              bespoke systems for real estate (Piller) and I'm building the same for HVAC and
              other legacy industries through Wick, on top of two consumer products with
              45,000+ combined users.
            </p>
            <p>
              Most "AI for your business" work is a chatbot wrapper. I build the actual
              system: the data pipeline, the decision logic, the integrations into whatever
              you already run on. If your company should be AI native and isn't yet, that's
              the problem I want to solve with you.
            </p>
          </div>
        </section>

        <section className="coach-stats" aria-label="Track record">
          {STATS.map((stat) => (
            <div key={stat.label} className="coach-stat">
              <span className="coach-stat-value">{stat.value}</span>
              <span className="coach-stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="coach-section" aria-labelledby="coach-process-heading">
          <h3 id="coach-process-heading" className="coach-section-title">How it works</h3>
          <ol className="coach-process">
            {PROCESS.map((item) => (
              <li key={item.step} className="coach-process-item">
                <span className="coach-process-step">{item.step}</span>
                <div>
                  <span className="coach-process-name">{item.name}</span>
                  <p className="coach-process-body">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
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
              Tell me what you're trying to automate or build and I'll tell you honestly
              whether it's a fit. If it is, we'll scope the build and figure out pricing
              and timeline from there.
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
