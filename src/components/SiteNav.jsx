import './SiteNav.css'
import { PERSON } from '../seo'

const LINKS = [
  { label: 'X', href: 'https://x.com/VedantRobot', external: true, me: true },
  { label: 'GitHub', href: 'https://github.com/VedSoni-dev', external: true, me: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vedantsonimech', external: true, me: true },
  { label: 'Email', href: `mailto:${PERSON.email}` },
]

export default function SiteNav({ className = '' }) {
  return (
    <nav className={`site-nav ${className}`.trim()} aria-label="Primary navigation">
      {LINKS.map((link) => (
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
