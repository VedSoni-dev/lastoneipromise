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
  { label: 'Wick', href: 'https://vedantsoni.com', note: 'AI native workflows for legacy companies' },
]

const PLANS = [
  {
    name: 'Intro call',
    price: 'Free',
    time: '30 min',
    body: "A no-pressure call to talk through what you're building and see if I can actually help.",
  },
  {
    name: 'Coaching session',
    price: '$150 / hr',
    time: '60 min',
    body: 'Flat rate per hour, split however many people you bring — solo is $150, bring a friend or co-founder and it\'s $75 each, bring three and it\'s $50 each.',
  },
  {
    name: 'Bootcamp',
    price: 'Ask',
    time: 'multi-session',
    body: 'Want something more structured for your team? I\'ll put together a custom program — just ask.',
  },
]

const EMAIL_SUBJECT = encodeURIComponent('Coaching call')
const EMAIL_BODY = encodeURIComponent(
  "Hey Vedant — I'd like to book a coaching call.\n\nWhat I'm building:\nWhere I'm stuck:\nHow many people (just me, or bringing others):\nTimes that work for me:\n"
)
const BOOK_HREF = `mailto:${PERSON.email}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`

export default function CoachingPage() {
  return (
    <div className="coach-page">
      <SEOHead
        title={`Coaching — ${PERSON.name}`}
        description="1:1 startup and AI coaching from Vedant Soni — founder of Wick, builder of Fern and Cognition (35,000+ users). Book a call to get unstuck on your bootstrapped build."
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

        <section className="coach-section" aria-labelledby="coach-plans-heading">
          <h3 id="coach-plans-heading" className="coach-section-title">How it works</h3>
          <div className="coach-plans">
            {PLANS.map((plan) => (
              <div key={plan.name} className="coach-plan">
                <div className="coach-plan-top">
                  <span className="coach-plan-name">{plan.name}</span>
                  <span className="coach-plan-time">{plan.time}</span>
                </div>
                <span className="coach-plan-price">{plan.price}</span>
                <p className="coach-plan-body">{plan.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="coach-cta" aria-labelledby="coach-cta-heading">
          <h3 id="coach-cta-heading" className="coach-cta-heading">Book a call</h3>
          <p className="coach-cta-body">
            Email me what you're working on and a few times that work for you — I'll reply to
            lock in the intro call.
          </p>
          <a className="coach-cta-button" href={BOOK_HREF}>
            Email {PERSON.email}
          </a>
        </section>
      </main>
    </div>
  )
}
