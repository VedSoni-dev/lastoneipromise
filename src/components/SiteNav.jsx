import { Link, useLocation } from 'react-router-dom'
import './SiteNav.css'
import { PERSON } from '../seo'

const PAGE_LINKS = [
  { label: 'Consulting', to: '/consulting' },
  { label: 'Coaching', to: '/coaching' },
]

const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/VedantRobot', external: true, me: true },
  { label: 'GitHub', href: 'https://github.com/VedSoni-dev', external: true, me: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vedantsonimech', external: true, me: true },
  { label: 'Email', href: `mailto:${PERSON.email}` },
]

export default function SiteNav({ className = '' }) {
  const { pathname } = useLocation()

  return (
    <nav className={`site-nav ${className}`.trim()} aria-label="Primary navigation">
      {PAGE_LINKS.filter((link) => link.to !== pathname).map((link) => (
        <Link key={link.label} to={link.to} className="site-nav-page">
          {link.label}
        </Link>
      ))}
      <span className="site-nav-sep" aria-hidden="true" />
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.external ? { target: '_blank', rel: link.me ? 'me noreferrer' : 'noreferrer' } : {})}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
