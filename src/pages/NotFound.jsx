import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import SiteNav from '../components/SiteNav'
import './NotFound.css'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <SEOHead
        title="404 | Vedant Soni"
        description="Page not found."
        url="https://vedantsoni.com/404"
      />

      <header className="not-found-header">
        <Link to="/" className="not-found-name">Vedant Soni</Link>
        <SiteNav />
      </header>

      <main className="not-found-main">
        <p className="not-found-code">404</p>
        <p className="not-found-message">page not found</p>
        <Link to="/" className="not-found-link">back home</Link>
      </main>
    </div>
  )
}
