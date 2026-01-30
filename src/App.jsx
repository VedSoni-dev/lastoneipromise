import { useState, useEffect } from 'react'
import Particles from './components/Particles'
import ShinyText from './components/ShinyText'
import Blackjack from './components/Blackjack'
import MediaGallery from './components/MediaGallery'
import SEOHead from './components/SEOHead'
import Resume from './pages/Resume'

import './App.css'

function App() {
  // Initialize currentPage based on pathname if present
  const getInitialPage = () => {
    const pathname = window.location.pathname
    return pathname === '/resume' ? 'resume' : 'home'
  }

  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [darkMode, setDarkMode] = useState(false)
  const [showBlackjack, setShowBlackjack] = useState(false)

  // Handle path-based routing for resume page
  useEffect(() => {
    const handlePathChange = () => {
      const pathname = window.location.pathname
      if (pathname === '/resume') {
        setCurrentPage('resume')
      } else {
        setCurrentPage('home')
      }
    }

    // Check initial path on mount
    handlePathChange()

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handlePathChange)

    // Intercept link clicks for SPA navigation
    const handleLinkClick = (e) => {
      const link = e.target.closest('a')
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const url = new URL(link.href)
        if (url.pathname === '/resume' || url.pathname === '/') {
          e.preventDefault()
          window.history.pushState({}, '', url.pathname)
          handlePathChange()
        }
      }
    }

    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('popstate', handlePathChange)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  useEffect(() => {
    // Skip blackjack if resume path is present or currentPage is resume
    const pathname = window.location.pathname
    if (pathname === '/resume' || currentPage === 'resume') {
      setShowBlackjack(false)
      return
    }

    const hasWon = localStorage.getItem('blackjackWon')
    if (!hasWon) {
      setShowBlackjack(true)
    }
  }, [currentPage])

  const handleBlackjackWin = () => {
    setShowBlackjack(false)
  }

  const hasWonBlackjack = () => {
    return localStorage.getItem('blackjackWon') === 'true'
  }



  const resetProgress = () => {
    if (window.confirm('Reset all progress? This will clear blackjack wins.')) {
      localStorage.removeItem('blackjackWon')
      // Reset app state
      setShowBlackjack(false)
      setCurrentPage('home')
      // Reload to restart from beginning
      window.location.reload()
    }
  }

  const email = 'ved.06.soni@gmail.com'

  const socialLinks = [
    { name: 'linkedin', url: 'https://www.linkedin.com/in/vedantsonimech' },
    { name: 'x', url: 'https://x.com/VedantRobot' },
    { name: 'github', url: 'https://github.com/VedSoni-dev' },
    { name: 'email', url: `mailto:${email}` }
  ]

  // Check for resume page first (before game overlays)
  if (currentPage === 'resume') {
    return (
      <>
        <SEOHead
          title="Resume - Vedant Soni | AI Developer & Entrepreneur"
          description="Resume of Vedant Soni - Co-Founder at Cognition, AI researcher, and entrepreneur. Experience in machine learning, robotics, and full-stack development."
          url="https://vedantsoni.com/resume"
        />
        <div className={`app-container scrollable ${darkMode ? 'dark' : ''}`}>
          <Particles />

          <div className={`app scrollable ${darkMode ? 'dark' : ''}`}>
            <button
              className="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀' : '☾'}
            </button>



            <div className="social-links">
              {socialLinks.map((social, index) => (
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
              <Resume />
            </main>
          </div>

          <footer className="footer">
            <p className="footer-text">© {new Date().getFullYear()}</p>
          </footer>
        </div>
      </>
    )
  }

  if (showBlackjack) {
    return <Blackjack onWin={handleBlackjackWin} />
  }



  const currentCoolThings = [
    {
      name: 'Cognition',
      link: 'https://cognitionus.com',
      previewImage: '/cognition-preview.png',
      previewText: 'An adaptive AI learning platform with over 35,000 users. Backed by NVIDIA and Google DeepMind.'
    },
    {
      name: 'Eden Robotics',
      link: 'https://eden-robotics.github.io/Eden/',
      previewImage: '/eden-preview.png',
      previewText: 'Humanoid robotics research at Texas A&M, focusing on AI-driven control systems.'
    },
    {
      name: 'RecReach',
      link: 'https://recreach.com',
      previewImage: '/recreach-preview.png',
      previewText: 'A sports-tech platform connecting athletes for community-driven games and team building.'
    }
  ]

  const aboutText = `AI Developer and Researcher dedicated to engineering intelligent systems at scale. Currently focused on adaptive learning architectures and autonomous humanoid robotics.`

  const boldStatements = [
    'Co-Founded Cognition - Backed by NVIDIA & Google DeepMind',
    'Leading AI Research & Robotics Development',
    'Founder of Fern (Non-profit) - 10,000+ Active Users'
  ]

  const blogPosts = [
    { date: 'recently', title: 'used cognition for my midterm and got a 98', body: 'within 2 days of learning half the sem\'s work' }
  ]

  const projects = [
    {
      name: 'Hive',
      description: 'A locally-deployed personal AI architect for automated workflow management and intent-based filtering of digital communications.',
      link: '#',
      date: 'Jun 2025 - Present',
      media: []
    },
    {
      name: 'TalkR',
      description: 'An AI-driven Augmentative and Alternative Communication (AAC) platform designed for accessibility. Integrates visual sentence construction and contextual AI speech synthesis.',
      link: 'https://v0-child-friendly-sentence-builder.vercel.app/',
      date: 'Mar 2025 - Present',
      media: []
    },
    {
      name: 'SNAIC',
      description: 'A portable AI-powered object recognition system built on edge computing hardware. Optimized for real-time inference and mobile operation.',
      link: '#',
      date: 'Sep 2024 - Present',
      media: []
    }
  ]

  const achievements = [
    {
      title: 'McFerrin Startup Fast Pass Winner',
      description: '1st place at TAMU\'s biggest entrepreneurship hackathon',
      date: '2025',
      category: 'Entrepreneurship'
    },
    {
      title: 'Ideas Challenge Finalist',
      description: 'Top 1% of 4,500+ applicants in TAMU\'s premier entrepreneurship competition',
      date: '2025',
      category: 'Entrepreneurship'
    }
  ]

  const education = {
    name: 'Texas A&M University',
    degree: 'Bachelor of Science, Computer Science',
    description: 'Focusing on AI Research and Enterprise Software Development.'
  }

  const volunteering = [
    {
      name: 'Texas A&M University Robotics Team',
      role: 'Project Lead & Workshop Director',
      date: 'May 2025 - Present',
      description: 'Directing AI-driven humanoid robotics research and organizing technical workshops for the student community.'
    },
    {
      name: 'tidalTAMU',
      role: 'Machine Learning Engineer',
      date: 'Aug 2024 - Nov 2024',
      description: 'Implemented reinforcement learning algorithms for autonomous vehicle navigation.'
    },
    {
      name: 'TAMU ThinkTank',
      role: 'Research Project Lead',
      date: 'Aug 2024 - May 2025',
      description: 'Led Team Orion to write a 100 page paper for future Mars exploration'
    },
    {
      name: 'Aggie Coding Club',
      role: 'Hardware Engineer',
      date: 'Aug 2024 - Dec 2024',
      description: ''
    }
  ]

  const experiences = [
    {
      name: 'Cognition',
      role: 'Co-Founder',
      description: 'Scaling a venture-backed (NVIDIA, Google DeepMind) AI platform. Engineering adaptive learning systems.',
      link: 'https://cognitionus.com',
      date: 'Jul 2025 - Present'
    },
    {
      name: 'RecReach',
      role: 'Co-Founder',
      description: 'A sports-tech startup facilitating athletic networking and game coordination.',
      link: '#',
      date: '2025 - Present'
    },
    {
      name: 'Pillar AI',
      role: 'Founder',
      description: 'Developed AI-driven automation workflows for real estate enterprises, optimizing lead management and operational efficiency.',
      link: '#',
      date: 'Jul 2025 - Present'
    },
    {
      name: 'Texas A&M University - ART Lab',
      role: 'AI Robotics Researcher',
      description: 'Researching AI-driven hivemind architectures for robotic swarms.',
      link: 'https://art.engr.tamu.edu/',
      date: 'Apr 2025 - Present'
    },
    {
      name: 'Texas A&M University - DIGIT Lab',
      role: 'AI Researcher',
      description: 'Developing multi-agent systems and fine-tuning large language models for structured data extraction.',
      link: 'https://digitlab23.github.io/',
      date: 'Feb 2025 - Aug 2025'
    },
    {
      name: 'Fern',
      role: 'Founder',
      description: 'Developing AI-enhanced tools for individuals with disabilities. Reached 10,000+ users across regional networks.',
      link: 'https://fern-chi.vercel.app/',
      date: 'Apr 2025 - Present'
    },
    {
      name: 'DeepSky',
      role: 'AI Ambassador',
      description: 'Strategic advisor for business automation and intelligent agent deployment.',
      link: '#',
      date: 'Sep 2025 - Present'
    },
    {
      name: 'Autodesk',
      role: 'Ambassador',
      description: 'Representing Autodesk technologies within the academic and startup ecosystem.',
      link: '#',
      date: 'Jul 2025 - Present'
    },
    {
      name: 'Code Ninjas',
      role: 'Computer Science Intern',
      description: 'Architected and developed educational curriculum infrastructure for technical learning programs.',
      link: '#',
      date: 'Jul 2023 - Aug 2024'
    }
  ]

  if (currentPage === '404') {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <Particles />

        <div className={`app ${darkMode ? 'dark' : ''}`}>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>



          <div className="social-links">
            {socialLinks.map((social, index) => (
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

          <main className="main-content">
            <section className="hero">
              <h1 className="hero-title">404</h1>
              <p className="hero-subtitle">page not found</p>

              <div className="about-link-wrapper">
                <button
                  className="other-stuff-link"
                  onClick={() => setCurrentPage('home')}
                >
                  ← back home
                </button>
              </div>
            </section>
          </main>
        </div>

        <footer className="footer">
          <p className="footer-text">© {new Date().getFullYear()}</p>
        </footer>
      </div>
    )
  }

  if (currentPage === 'blog') {
    return (
      <div className={`app-container scrollable ${darkMode ? 'dark' : ''}`}>
        <Particles />

        <div className={`app scrollable ${darkMode ? 'dark' : ''}`}>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>



          <div className="social-links">
            {socialLinks.map((social, index) => (
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
            <section className="hero" aria-labelledby="blog-title">
              <button
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← Return
              </button>

              <h1 className="hero-title" id="blog-title">Blog</h1>
              <p className="hero-subtitle">Perspectives on AI, Engineering, and Startups.</p>

              <article className="blog-section" aria-label="Blog posts">
                {blogPosts.map((post, index) => (
                  <article key={index} className="blog-item">
                    <time className="blog-date" dateTime={post.date}>{post.date}</time>
                    <h2 className="blog-title-link">{post.title}</h2>
                    <p className="blog-excerpt">{post.body}</p>
                  </article>
                ))}
              </article>
            </section>
          </main>
        </div>

        <footer className="footer">
          <p className="footer-text">© {new Date().getFullYear()}</p>
        </footer>
      </div>
    )
  }

  if (currentPage === 'about') {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <Particles />

        <div className={`app ${darkMode ? 'dark' : ''}`}>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>



          <div className="social-links">
            {socialLinks.map((social, index) => (
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

          <main className="main-content" role="main">
            <section className="hero" aria-labelledby="about-title">
              <button
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← Return
              </button>

              <h1 className="hero-title" id="about-title">About</h1>
              <p className="hero-subtitle">Engineering the intersection of Artificial Intelligence and Robotics.</p>

              <div className="about-content">
                <p className="about-text">
                  {aboutText}
                </p>

                <section className="bold-statements" aria-label="Achievements">
                  {boldStatements.map((statement, index) => (
                    <div key={index} className="bold-statement">
                      {statement}
                    </div>
                  ))}
                </section>

                <section className="about-education" aria-label="Education">
                  <h2 className="education-name">{education.name}</h2>
                  <p className="education-degree">{education.degree}</p>
                  <p className="education-description">{education.description}</p>
                </section>
              </div>
            </section>
          </main>
        </div>

        <footer className="footer">
          <p className="footer-text">© {new Date().getFullYear()}</p>
        </footer>
      </div>
    )
  }

  if (currentPage === 'stuff') {
    return (
      <div className={`app-container scrollable ${darkMode ? 'dark' : ''}`}>
        <Particles />

        <div className={`app scrollable ${darkMode ? 'dark' : ''}`}>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>



          <div className="social-links">
            {socialLinks.map((social, index) => (
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
            <section className="hero" aria-labelledby="stuff-title">
              <button
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← Return
              </button>

              <h1 className="hero-title" id="stuff-title">Portfolio</h1>
              <p className="hero-subtitle">Selected Projects & Professional Experiences</p>
              <p className="hero-attitude">Focusing on Impact & Innovation</p>

              <div className="stuff-section">
                <section className="stuff-category" aria-labelledby="experiences-heading">
                  <h2 className="stuff-category-title" id="experiences-heading">Professional Experience</h2>
                  <div className="experiences-list" role="list">
                    {experiences.map((exp, index) => (
                      <article key={index} className="experience-item" role="listitem">
                        <a
                          href={exp.link}
                          className="experience-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${exp.name} - ${exp.role}`}
                        >
                          <div className="experience-header">
                            <span className="experience-name">{exp.name}</span>
                            <span className="experience-role">{exp.role}</span>
                          </div>
                          {exp.date && (
                            <time className="experience-date" dateTime={exp.date}>{exp.date}</time>
                          )}
                          {exp.description && (
                            <p className="experience-description">{exp.description}</p>
                          )}
                        </a>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stuff-category" aria-labelledby="volunteering-heading">
                  <h2 className="stuff-category-title" id="volunteering-heading">Volunteering & Leadership</h2>
                  <div className="experiences-list" role="list">
                    {volunteering.map((vol, index) => (
                      <article key={index} className="experience-item" role="listitem">
                        <div className="experience-link">
                          <div className="experience-header">
                            <span className="experience-name">{vol.name}</span>
                            <span className="experience-role">{vol.role}</span>
                          </div>
                          {vol.date && (
                            <time className="experience-date" dateTime={vol.date}>{vol.date}</time>
                          )}
                          {vol.description && (
                            <p className="experience-description">{vol.description}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stuff-category" aria-labelledby="achievements-heading">
                  <h2 className="stuff-category-title" id="achievements-heading">Achievements</h2>
                  <div className="experiences-list" role="list">
                    {achievements.map((achievement, index) => (
                      <article key={index} className="experience-item" role="listitem">
                        <div className="experience-link">
                          <div className="experience-header">
                            <span className="experience-name">{achievement.title}</span>
                            {achievement.category && (
                              <span className="experience-role">{achievement.category}</span>
                            )}
                          </div>
                          {achievement.date && (
                            <time className="experience-date" dateTime={achievement.date}>{achievement.date}</time>
                          )}
                          {achievement.description && (
                            <p className="experience-description">{achievement.description}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>

        <footer className="footer">
          <p className="footer-text">© {new Date().getFullYear()}</p>
          <button
            className="reset-button"
            onClick={resetProgress}
            title="Reset all game progress"
          >
            reset progress
          </button>
        </footer>
      </div>
    )
  }

  return (
    <>
      <SEOHead />
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <Particles />

        <div className={`app ${darkMode ? 'dark' : ''}`}>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>



          <div className="social-links">
            {socialLinks.map((social, index) => (
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

          <main className="main-content" role="main">
            <section className="hero" aria-labelledby="hero-title">
              <h1 className="hero-title" id="hero-title">Vedant Soni</h1>
              <p className="hero-subtitle">Building Future-Forward AI & Robotics Systems.</p>

              <nav className="cool-things" aria-label="Featured projects">
                {currentCoolThings.map((thing, index) => (
                  <div key={index} className="cool-thing-wrapper">
                    <a
                      href={thing.link}
                      className="cool-thing-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${thing.name}`}
                    >
                      {thing.name}
                    </a>
                    <div className="cool-thing-preview">
                      <img
                        src={thing.previewImage}
                        alt={thing.name}
                        className="cool-thing-preview-image"
                      />
                      <p className="cool-thing-preview-text">{thing.previewText}</p>
                    </div>
                  </div>
                ))}
              </nav>

              <nav className="main-navigation" aria-label="Main navigation">
                <div className="other-stuff-link-wrapper">
                  <button
                    className="other-stuff-link"
                    onClick={() => setCurrentPage('stuff')}
                    aria-label="View projects and experiences"
                  >
                    Projects & Experience
                  </button>
                </div>

                <div className="about-link-wrapper">
                  <button
                    className="other-stuff-link"
                    onClick={() => setCurrentPage('about')}
                    aria-label="Learn more about me"
                  >
                    About
                  </button>
                </div>

                <div className="about-link-wrapper">
                  <button
                    className="other-stuff-link"
                    onClick={() => setCurrentPage('blog')}
                    aria-label="Read blog posts"
                  >
                    Blog
                  </button>
                </div>

                <div className="about-link-wrapper">
                  <button
                    className="other-stuff-link"
                    onClick={() => setShowBlackjack(true)}
                    aria-label="Play blackjack game"
                  >
                    Interactive Demo (Blackjack)
                  </button>
                </div>
              </nav>
            </section>
          </main>
        </div>

        <footer className="footer" role="contentinfo">
          <p className="footer-text">© {new Date().getFullYear()} Vedant Soni. All rights reserved.</p>
          <button
            className="reset-button"
            onClick={resetProgress}
            title="Reset all game progress"
            aria-label="Reset all game progress"
          >
            reset progress
          </button>
        </footer>
      </div>
    </>
  )
}

export default App

