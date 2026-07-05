import './SiteNav.css'

const LINKS = [
  { label: 'X', href: 'https://x.com/VedantRobot', external: true },
  { label: 'GitHub', href: 'https://github.com/VedSoni-dev', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vedantsonimech', external: true },
  { label: 'Email', href: 'mailto:ved.soni@tamu.edu' },
]

export default function SiteNav({ className = '' }) {
  return (
    <nav className={`site-nav ${className}`.trim()} aria-label="Primary navigation">
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
