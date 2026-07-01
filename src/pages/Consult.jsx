import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { ARTICLES } from './Articles'
import './Consult.css'

const WORK = [
  {
    name: 'Fern',
    role: 'Founder',
    detail: 'AI communication tools for children with disabilities, used by more than 10,000 people.',
    href: 'https://fern-chi.vercel.app/',
  },
  {
    name: 'Eden Robotics',
    role: 'Founder and research lead',
    detail: 'A student research team teaching humanoid robots how to adapt outside a perfect demo.',
    href: 'https://eden-robotics.github.io/Eden/',
  },
  {
    name: 'Texas A&M',
    role: 'Software engineer and AI researcher',
    detail: 'I build production software and study how intelligent systems learn and work together.',
    href: 'https://www.tamu.edu/',
  },
]

export default function ConsultPage() {
  return (
    <div className="intro-page">
      <SEOHead
        title="Vedant Soni | I build AI and explain it simply"
        description="Vedant Soni builds AI products, researches robotics, and writes plain-English guides to help normal people understand and use AI."
        keywords="Vedant Soni, AI explained simply, how to use AI, what is AI, AI guides for beginners, AI researcher, robotics, Fern"
        url="https://vedantsoni.com"
      />

      <header className="intro-nav" aria-label="Primary navigation">
        <Link className="intro-wordmark" to="/">Vedant Soni</Link>
        <Link className="intro-nav-link" to="/blog">Read the guides</Link>
      </header>

      <main>
        <section className="intro-hero" aria-labelledby="intro-title">
          <p className="intro-hello">Hey, I’m Vedant.</p>
          <h1 id="intro-title">I build things with AI, then explain what I learned in normal English.</h1>
          <div className="intro-letter">
            <p>
              I’m a 20-year-old computer science student at Texas A&amp;M. I build AI products,
              research robots, and spend an unreasonable amount of time testing new tools.
            </p>
            <p>
              Lately, I’ve also been writing for people who do not live on tech Twitter.
              No buzzwords. No pretending every new app will change civilization. Just clear
              answers about what AI is, how to use it, and when it is actually useful.
            </p>
          </div>
          <div className="intro-hero-links">
            <Link to="/blog">Start with an AI guide</Link>
            <a href="mailto:ved.soni@tamu.edu">Say hello</a>
          </div>
        </section>

        <section className="intro-section intro-reading" aria-labelledby="reading-title">
          <div className="intro-section-heading">
            <h2 id="reading-title">AI, explained like a person</h2>
            <p>Useful guides for the questions people are already asking.</p>
          </div>

          <div className="article-list">
            {ARTICLES.map((article) => (
              <article className="article-row" key={article.slug}>
                <div className="article-row-meta">
                  <span>{article.category}</span>
                  <span>{article.readingTime}</span>
                </div>
                <h3>
                  <Link to={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                <p>{article.description}</p>
                <Link className="article-row-link" to={`/articles/${article.slug}`}>
                  Read this guide
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="intro-section intro-work" aria-labelledby="work-title">
          <div className="intro-section-heading">
            <h2 id="work-title">What I do when I’m not writing</h2>
            <p>I like building useful things and figuring out why they work.</p>
          </div>

          <div className="work-list">
            {WORK.map((item) => (
              <a className="work-row" href={item.href} target="_blank" rel="noreferrer" key={item.name}>
                <span className="work-name">{item.name}</span>
                <span className="work-role">{item.role}</span>
                <span className="work-detail">{item.detail}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="intro-section intro-about" aria-labelledby="about-title">
          <h2 id="about-title">A little more about me</h2>
          <div className="intro-about-copy">
            <p>
              Fern started because of my brother. I saw how far behind communication tools
              were for kids with disabilities, so I made one. That project taught me the
              kind of work I want to keep doing: technical enough to be interesting and
              human enough to matter.
            </p>
            <p>
              I’ve also built startups, worked on reinforcement learning for robots, and
              somehow reached Grandmaster in League of Legends. The last one may have been
              the least practical research project.
            </p>
          </div>
          <div className="intro-about-links">
            <a href="/resume.pdf">Resume</a>
            <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/VedSoni-dev" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </section>
      </main>

      <footer className="intro-footer">
        <p className="intro-signoff">Thanks for stopping by.<br /><span>Vedant</span></p>
        <p className="intro-postscript">
          P.S. If AI has ever made you feel behind, you are exactly who I’m writing for.
        </p>
        <p className="intro-copyright">© {new Date().getFullYear()} Vedant Soni</p>
      </footer>
    </div>
  )
}
