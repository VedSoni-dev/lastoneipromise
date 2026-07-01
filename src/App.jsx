import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Routes, Route, Outlet, Link } from 'react-router-dom'
import ScrollGrainient from './components/ScrollGrainient'
import Grainient from './components/Grainient'
import Blackjack from './components/Blackjack'
import SEOHead from './components/SEOHead'
import ProjectShowcase from './components/ProjectShowcase'
import EmailCapture from './components/EmailCapture'
import Resume from './pages/Resume'
import ConsultPage from './pages/Consult'
import { ArticlesIndex, ArticlePage } from './pages/Articles'
import './App.css'

// --- Data ---
const SOCIAL_LINKS = [
  { name: 'linkedin', url: 'https://www.linkedin.com/in/vedantsonimech' },
  { name: 'x', url: 'https://x.com/VedantRobot' },
  { name: 'github', url: 'https://github.com/VedSoni-dev' },
  { name: 'email', url: 'mailto:ved.soni@tamu.edu' }
]

const VENTURES = [
  { name: 'Fern', role: 'founder', description: 'AI tools for children with disabilities. 10,000+ users. nonprofit. rebooted may 2026. back full-time.', link: 'https://fern-chi.vercel.app/', date: 'Apr 2025 - Present' },
  { name: 'Cognition', role: 'cofounder & cto', description: 'AI learning platform validated by YC partners. signed 8 clients including a YC company. backed by NVIDIA & Google DeepMind.', link: 'https://cognitionus.com', date: 'Sep 2025 - May 2026' },
  { name: 'Pillar AI', role: 'founder', description: 'local AI automations for real estate. 15+ clients.', link: null, date: 'Jul 2025 - Jan 2026' },
  { name: 'RecReach', role: 'cofounder', description: 'pickup sports coordination platform. backed by Google for Startups.', link: 'https://recreach.com', date: 'Mar 2025 - Mar 2026' }
]

const RESEARCH = [
  { name: 'Eden Robotics', role: 'founder & lead', description: 'humanoid robots with cognitive architectures. 15-person team. RL policies in Isaac Sim.', link: 'https://eden-robotics.github.io/Eden/', date: 'May 2025 - Present' },
  { name: 'ART Lab, Texas A&M', role: 'ML & robotics researcher', description: 'deep RL for autonomous agricultural robot swarms. decentralized GNNs for cooperative behaviors.', link: 'https://art.engr.tamu.edu/', date: 'Apr 2025 - Present' },
  { name: 'DIGIT Lab, Texas A&M', role: 'AI researcher', description: 'multi-agent systems for structured data extraction. built the largest open-source database for plastic compatibilizers.', link: 'https://digitlab23.github.io/', date: 'Feb 2025 - Aug 2025' }
]

const BLOG_POSTS = [
  { date: 'may 2026', title: 'cognition got a YC interview. we didn\'t get in (yet).', body: 'but our first iteration got validated by YC partners. signed 8 clients in a week — one YC company. met 10 YC founders. been in SF for 2 days. cognition will be a staple in AI native teams by the end of this summer.' },
  { date: 'may 2026', title: 'fern reboot', body: 'rebooted fern from scratch. the original codebase was held together by duct tape and prayer. new architecture, same mission — AI tools for kids who can\'t speak. 10k users didn\'t come easy and they deserve better infrastructure.' },
  { date: 'mar 2026', title: 'the robot arm finally stopped punching the table', body: 'after 3 weeks of tuning PID controllers and questioning my life choices, eden\'s arm can now pick up a cup without launching it across the lab. small wins.' },
]

const BLOG_POSTS_ALL = [
  ...BLOG_POSTS,
  { date: 'feb 2026', title: 'why i mass-dropped every AI wrapper startup pitch', body: 'got 14 linkedin messages this month asking me to join "the uber of AI." if your startup is a wrapper around an API call, it\'s not a startup. it\'s a weekend project with a landing page.' },
  { date: 'jan 2026', title: 'fern hit 10k users and i almost missed it', body: 'was debugging a memory leak at 2am when the analytics email came in. 10,000 people using something i built to help people communicate. cried a little. kept debugging.' },
  { date: 'dec 2025', title: 'used cognition for my midterm and got a 98', body: 'within 2 days of learning half the sem\'s work. if i can\'t trust my own product then what am i even doing.' },
  { date: 'nov 2025', title: 'the nvidia call that changed everything', body: 'got a cold email i almost marked as spam. turned out to be a deepmind researcher who\'d been using cognition. two weeks later we had backing. always read your emails.' },
  { date: 'oct 2025', title: 'i wrote 10,000 lines of code this week and mass deleted 8,000', body: 'the best code is the code you don\'t ship. refactored the entire cognition backend and it\'s 3x faster with half the complexity. less is more.' }
]

const BOLD_STATEMENTS = [
  'building fern — AI tools for kids with disabilities. 10,000+ users.',
  'previously cofounder & cto at cognition — validated by Y Combinator',
  'building humanoid robots at texas a&m',
  'former grandmaster in league of legends'
]

const FUN_FACTS = [
  'i love AI and making robots',
  'former GM in league of legends',
  'SAT: 1570',
  'Y Combinator Startup School',
  '2,300+ linkedin followers',
]

const EDUCATION = {
  name: 'Texas A&M University',
  degree: 'b.s. computer science',
  description: 'AI research & enterprise software. 3.7 GPA. McFerrin Startup Fast Pass Winner. Ideas Challenge Finalist (top 1% of 4,500+ applicants).'
}

// --- Blackjack Context ---
const BlackjackContext = createContext()

// --- Shared Layout for sub-pages (blog full, resume) ---
function SubPageLayout() {
  return (
    <div className="app-container scrollable">
      <div className="static-grainient-bg">
        <Grainient
          color1="#845EC2"
          color2="#4ECDC4"
          color3="#FF6B6B"
          timeSpeed={0.1}
          warpStrength={1}
          warpFrequency={3}
          warpSpeed={1}
          warpAmplitude={70}
          blendSoftness={0.1}
          rotationAmount={300}
          noiseScale={2}
          grainAmount={0.08}
          grainScale={2}
          grainAnimated
          contrast={1.2}
          gamma={1.0}
          saturation={1.0}
          zoom={0.9}
        />
      </div>

      <div className="social-links">
        {SOCIAL_LINKS.map((social, index) => (
          <a
            key={index}
            href={social.url}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.name}
          </a>
        ))}
      </div>

      <main className="main-content scrollable" role="main">
        <Outlet />
      </main>

      <footer className="footer" role="contentinfo">
        <p className="footer-text">&copy; {new Date().getFullYear()} Vedant Soni</p>
      </footer>
    </div>
  )
}

// --- Experience List ---
function ExperienceList({ items, linked = true }) {
  return (
    <div className="experiences-list" role="list">
      {items.map((item, index) => (
        <article key={index} className="experience-item" role="listitem">
          {linked && item.link ? (
            <a href={item.link} className="experience-link" target="_blank" rel="noopener noreferrer" aria-label={`View ${item.name || item.title}`}>
              <ExperienceContent item={item} />
            </a>
          ) : (
            <div className="experience-link">
              <ExperienceContent item={item} />
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

function ExperienceContent({ item }) {
  return (
    <>
      <div className="experience-header">
        <span className="experience-name">{item.name || item.title}</span>
        <span className="experience-role">{item.role || item.category}</span>
      </div>
      {item.date && <time className="experience-date" dateTime={item.date}>{item.date}</time>}
      {item.description && <p className="experience-description">{item.description}</p>}
    </>
  )
}

// --- Scroll Section wrapper ---
function ScrollSection({ children, className = '', id }) {
  return (
    <section className={`scroll-section ${className}`} id={id}>
      {children}
    </section>
  )
}

// --- Scroll Engagement Hook ---
function useScrollEngagement(scrollRef) {
  const [engagement, setEngagement] = useState(() => ({
    sectionsViewed: [],
    maxScrollDepth: 0,
    startTime: Date.now(),
  }))

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return

    const sectionIds = ['hero', 'work', 'blog', 'about']
    const seen = new Set(['hero']) // hero is always seen on load

    const handleScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight
      const depth = maxScroll > 0 ? Math.round((el.scrollTop / maxScroll) * 100) : 0

      // Check which sections are in view
      sectionIds.forEach(id => {
        const section = document.getElementById(id)
        if (!section) return
        const rect = section.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) {
          seen.add(id)
        }
      })

      setEngagement(prev => ({
        ...prev,
        sectionsViewed: [...seen],
        maxScrollDepth: Math.max(prev.maxScrollDepth, depth),
      }))
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollRef])

  return engagement
}

// --- Home Page (scroll-based) ---
function HomePage() {
  const { showBlackjack } = useContext(BlackjackContext)
  const scrollRef = useRef(null)
  const engagement = useScrollEngagement(scrollRef)
  const [subscribed, setSubscribed] = useState(false)

  return (
    <>
      <SEOHead />
      <div className="home-scroll-container" ref={scrollRef}>
        <ScrollGrainient scrollRef={scrollRef} />
        <div className="social-links">
          {SOCIAL_LINKS.map((social, index) => (
            <a
              key={index}
              href={social.url}
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.name}
            </a>
          ))}
        </div>

        {/* Hero */}
        <ScrollSection className="hero-section" id="hero">
          <div className="hero-split">
            <div className="hero-left">
              <h1 className="hero-title">Vedant Soni</h1>
              <p className="hero-subtitle">i build things that learn.</p>
              <div className="scroll-hint">scroll</div>
            </div>
            <div className="hero-right">
              <ProjectShowcase />
            </div>
          </div>
        </ScrollSection>

        {/* Work */}
        <ScrollSection className="work-section" id="work">
          <h2 className="section-label">ventures</h2>
          <ExperienceList items={VENTURES} />

          <h2 className="section-label" style={{ marginTop: '3rem' }}>research</h2>
          <ExperienceList items={RESEARCH} />
        </ScrollSection>

        {/* Blog */}
        <ScrollSection className="blog-section-home" id="blog">
          <h2 className="section-label">lately</h2>
          <div className="blog-posts-home">
            {BLOG_POSTS.map((post, index) => (
              <article key={index} className="blog-item">
                <time className="blog-date" dateTime={post.date}>{post.date}</time>
                <h3 className="blog-title-link">{post.title}</h3>
                <p className="blog-excerpt">{post.body}</p>
              </article>
            ))}
          </div>
          <Link to="/blog" className="see-more-link">all posts</Link>
        </ScrollSection>

        {/* About */}
        <ScrollSection className="about-section" id="about">
          <h2 className="section-label">about</h2>

          <p className="about-intro">
            i love AI and making robots. back full-time on fern — building AI tools
            for kids who can't speak. when i'm not shipping code, i'm probably
            theory-crafting league strats or reading research papers at 2am.
          </p>

          <div className="bold-statements">
            {BOLD_STATEMENTS.map((statement, index) => (
              <div key={index} className="bold-statement">{statement}</div>
            ))}
          </div>

          <div className="fun-facts">
            {FUN_FACTS.map((fact, index) => (
              <span key={index} className="fun-fact-tag">{fact}</span>
            ))}
          </div>

          <div className="about-education">
            <h3 className="education-name">{EDUCATION.name}</h3>
            <p className="education-degree">{EDUCATION.degree}</p>
            <p className="education-description">{EDUCATION.description}</p>
          </div>

          <div className="home-nav-links">
            <Link to="/resume" className="nav-link">resume</Link>
            <button className="nav-link" onClick={showBlackjack}>blackjack</button>
          </div>

          <EmailCapture engagement={engagement} onSubscribed={() => setSubscribed(true)} />

          <footer className="home-footer" role="contentinfo">
            <p className="footer-text">&copy; {new Date().getFullYear()} Vedant Soni</p>
          </footer>
        </ScrollSection>
      </div>
    </>
  )
}

// --- Blog Page (full archive) ---
function BlogPage() {
  return (
    <section className="hero" aria-labelledby="blog-title">
      <Link to="/" className="back-link" aria-label="Return to home page">
        &larr; return
      </Link>

      <h1 className="hero-title" id="blog-title">blog</h1>
      <p className="hero-subtitle">what i'm thinking about.</p>

      <article className="blog-section" aria-label="Blog posts">
        {BLOG_POSTS_ALL.map((post, index) => (
          <article key={index} className="blog-item">
            <time className="blog-date" dateTime={post.date}>{post.date}</time>
            <h2 className="blog-title-link">{post.title}</h2>
            <p className="blog-excerpt">{post.body}</p>
          </article>
        ))}
      </article>
    </section>
  )
}

// --- Resume Page ---
function ResumePage() {
  return (
    <>
      <SEOHead
        title="Resume - Vedant Soni | AI Developer & Entrepreneur"
        description="Resume of Vedant Soni - Co-Founder at Cognition, AI researcher, and entrepreneur."
        url="https://vedantsoni.com/resume"
      />
      <Resume />
    </>
  )
}

// --- 404 Page ---
function NotFoundPage() {
  return (
    <section className="hero">
      <h1 className="hero-title">404</h1>
      <p className="hero-subtitle">page not found</p>
      <div className="about-link-wrapper">
        <Link to="/" className="other-stuff-link">&larr; back home</Link>
      </div>
    </section>
  )
}

// --- App ---
function App() {
  const [blackjackVisible, setBlackjackVisible] = useState(false)

  if (blackjackVisible) {
    return <Blackjack onWin={() => setBlackjackVisible(false)} />
  }

  return (
    <BlackjackContext.Provider value={{ showBlackjack: () => setBlackjackVisible(true) }}>
      <Routes>
        <Route path="/" element={<ConsultPage />} />
        <Route path="/blog" element={<ArticlesIndex />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />

        {/* Sub-pages with static gradient */}
        <Route element={<SubPageLayout />}>
          <Route path="/portfolio" element={<HomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BlackjackContext.Provider>
  )
}

export default App
