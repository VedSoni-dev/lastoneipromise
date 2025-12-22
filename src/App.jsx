import { useState, useEffect } from 'react'
import Particles from './components/Particles'
import ShinyText from './components/ShinyText'
import Blackjack from './components/Blackjack'
import Poker from './components/Poker'
import SocialLink from './components/SocialLink'
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
  const [showHive, setShowHive] = useState(false)
  const [showPoker, setShowPoker] = useState(false)
  const [hiveMessage, setHiveMessage] = useState('')

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

  const hasWonPoker = () => {
    return localStorage.getItem('hiveWon') === 'true'
  }

  const handlePokerWin = () => {
    setShowPoker(false)
    setShowHive(true)
  }

  const handleSendHiveMessage = () => {
    if (!hiveMessage.trim()) return
    
    // Here you would integrate with your actual messaging service
    // For now, just log it or you can add an API call
    console.log('Message to send:', hiveMessage)
    
    // You could use a service like Twilio, email API, or webhook here
    // Example: fetch('/api/send-message', { method: 'POST', body: JSON.stringify({ message: hiveMessage }) })
    
    alert('message sent through hive. i\'ll get back to you.')
    setHiveMessage('')
    setShowHive(false)
  }

  const resetProgress = () => {
    if (window.confirm('reset all progress? this will clear blackjack and poker wins.')) {
      localStorage.removeItem('blackjackWon')
      localStorage.removeItem('hiveWon')
      // Reset app state
      setShowBlackjack(false)
      setShowHive(false)
      setShowPoker(false)
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                social={social}
                onHiveClick={() => setShowHive(true)}
                onBlackjackClick={() => setShowBlackjack(true)}
              />
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

  if (showPoker) {
    return <Poker onWin={handlePokerWin} />
  }

  if (showHive) {
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <main className="main-content">
            <section className="hero">
              <button 
                className="back-link"
                onClick={() => setShowHive(false)}
              >
                ← back
              </button>
              
              <h1 className="hero-title">hive</h1>
              <p className="hero-subtitle">my personal ai. like jarvis but cooler.</p>
              
              <div className="hive-content">
                <p className="hive-description">
                  hive handles all my daily stuff for me. emails, messages, calendar invites, 
                  everything goes through hive first. completely local. my ai assistant.
                </p>
                
                <p className="hive-description">
                  if you've ever sent me an email, message, calendar invite, or anything else, 
                  it went through hive first. hive filters, organizes, and prioritizes everything 
                  before it reaches me. think of it as my personal gatekeeper.
                </p>
                
                {hasWonPoker() ? (
                  <div className="hive-message-section">
                    <p className="hive-message-label">you won poker. send me a message:</p>
                    <textarea
                      className="hive-textarea"
                      value={hiveMessage}
                      onChange={(e) => setHiveMessage(e.target.value)}
                      placeholder="type your message here..."
                      rows={6}
                    />
                    <button
                      className="hive-send-button"
                      onClick={handleSendHiveMessage}
                      disabled={!hiveMessage.trim()}
                    >
                      send through hive
                    </button>
                  </div>
                ) : (
                  <div className="hive-locked">
                    <p>beat 3 opponents in poker to unlock messaging through hive.</p>
                    <button
                      className="hive-play-button"
                      onClick={() => setShowPoker(true)}
                    >
                      play poker
                    </button>
                  </div>
                )}
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

  const currentCoolThings = [
    { name: 'cool thing num 1', link: 'https://cognitionus.com' },
    { name: 'cool thing num 2', link: 'https://github.com/EDEN-robotics' },
    { name: 'cool thing num 3', link: 'https://recreach.com' }
  ]

  const aboutText = `just a guy who builds things. sometimes they work, sometimes they don't.`

  const boldStatements = [
    '35k+ users before i could legally drink',
    'backed by nvidia & google deepmind',
    'skipping class to build the future',
    '10k+ users on a nonprofit i built in my free time'
  ]

  const blogPosts = [
    { date: 'recently', title: 'used cognition for my midterm and got a 98', body: 'within 2 days of learning half the sem\'s work' }
  ]

const projects = [
  {
      name: 'recreach', 
      description: 'pickup sports startup',
      link: '#',
      date: '',
      media: [] // Add images/videos here: [{ type: 'image', url: '/path/to/image.jpg', alt: 'description' }, { type: 'video', url: '/path/to/video.mp4', thumbnail: '/path/to/thumbnail.jpg' }]
    },
    { 
      name: 'Hive', 
      description: 'My personal AI. If you\'ve ever sent me an email, message, calendar invite, or anything else, it went through Hive first. Completely local.',
      link: '#',
      date: 'Jun 2025 - Present',
      media: [] // Add images/videos here
    },
    { 
      name: 'TalkR', 
      description: 'Talkr is a completely free, AI-driven Augmentative and Alternative Communication (AAC) app designed to empower nonverbal individuals with intuitive, accessible communication. Built with inclusivity at its core, Talkr integrates visual sentence building, AI-enhanced text-to-speech, and real-time image and location recognition to create personalized, contextual conversations.',
      link: 'https://v0-child-friendly-sentence-builder.vercel.app/',
      date: 'Mar 2025 - Present',
      media: [] // Add images/videos here
    },
    { 
      name: 'SNAIC', 
      description: 'SNAIC uses the Raspberry Pi 5 with camera attachments, battery packs, heat sinks, and a touchscreen to develop an AI-powered object recognition system. The device scans real-world items using advanced AI algorithms and provides immediate online links related to the scanned objects. Optimized for portability and performance, it integrates cooling solutions for sustained operation during intensive tasks.',
      link: '#',
      date: 'Sep 2024 - Present',
      media: [] // Add images/videos here
    },
    { 
      name: 'Roni\'s Business Analyzer', 
      description: 'My team and I created website during a 24-hour hackathon that can analyze the recent order history of a local location of the chain Roni\'s Mac Bar. The website has the ability to take in a CV file of the order history and display it in a way that it can be easily searched through; additionally, the website provides insights into what was popular that month, and provides order predictions for the coming months.',
      link: '#',
      date: '',
      media: [] // Add images/videos here
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
    },
    {
      title: '35k+ Users',
      description: 'Before I could legally drink',
      date: '2024-2025',
      category: 'Product'
    },
    {
      title: 'Backed by NVIDIA & Google DeepMind',
      description: 'Cognition received backing from leading AI companies',
      date: '2025',
      category: 'Business'
    },
    {
      title: '10k+ Users on Nonprofit',
      description: 'Fern reached 10,000+ users across Texas',
      date: '2025',
      category: 'Social Impact'
    }
  ]

  const education = {
    name: 'Texas A&M University',
    degree: 'Bachelor of Science, Computer Science',
    description: 'skipping for cognition'
  }

  const volunteering = [
    { 
      name: 'Texas A&M University Robotics Team', 
      role: 'Project Lead & Workshop Director',
      date: 'May 2025 - Present',
      description: 'building ai humanoid robots. organizing workshops. made the website in a day because i was bored.'
    },
    {
      name: 'tidalTAMU',
      role: 'Machine Learning Engineer',
      date: 'Aug 2024 - Nov 2024',
      description: 'taught cars how to drive using RL'
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
      name: 'Stealth Startup', 
      role: 'Co-Founder',
      description: '35k+ users. backed by nvidia, google deepmind, carnegie mellon. building the future of learning.',
      link: '#',
      date: 'Jul 2025 - Present'
    },
    { 
      name: 'Pillar AI', 
      role: 'Founder',
      description: 'built in my free time. ai automations for real estate. 15+ clients. just vibes.',
      link: '#',
      date: 'Jul 2025 - Present'
    },
    { 
      name: 'Texas A&M University - ART Lab', 
      role: 'AI Robotics Researcher',
      description: 'AI Hivemind for Robotic Swarms',
      link: '#',
      date: 'Apr 2025 - Present'
    },
    { 
      name: 'Texas A&M University - DIGIT Lab', 
      role: 'AI Lab Researcher',
      description: 'Multi Agent Systems & Fine Tuning for Data Extraction',
      link: '#',
      date: 'Feb 2025 - Aug 2025'
    },
    { 
      name: 'Fern', 
      role: 'Founder',
      description: 'ai tools for children with disabilities. nonprofit. 10k+ users. built it because i could.',
      link: '#',
      date: 'Apr 2025 - Present'
    },
    { 
      name: 'DeepSky', 
      role: 'AI Ambassador',
      description: 'Your general business superagent. Sign up today.',
      link: '#',
      date: 'Sep 2025 - Present'
    },
    { 
      name: 'Autodesk', 
      role: 'Ambassador',
      description: '',
      link: '#',
      date: 'Jul 2025 - Present'
    },
    { 
      name: 'Code Ninjas', 
      role: 'Computer Science Intern',
      description: 'developed curriculum infastructure',
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                social={social}
                onHiveClick={() => setShowHive(true)}
                onBlackjackClick={() => setShowBlackjack(true)}
              />
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                social={social}
                onHiveClick={() => setShowHive(true)}
                onBlackjackClick={() => setShowBlackjack(true)}
              />
            ))}
          </div>
          
          <main className="main-content scrollable" role="main">
            <section className="hero" aria-labelledby="blog-title">
              <button 
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← back
              </button>
              
              <h1 className="hero-title" id="blog-title">blog</h1>
              <p className="hero-subtitle">i post stuff here</p>
              
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                social={social}
                onHiveClick={() => setShowHive(true)}
                onBlackjackClick={() => setShowBlackjack(true)}
              />
            ))}
          </div>
          
          <main className="main-content" role="main">
            <section className="hero" aria-labelledby="about-title">
              <button 
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← back
              </button>
              
              <h1 className="hero-title" id="about-title">about</h1>
              <p className="hero-subtitle">just a guy who builds things. sometimes they work, sometimes they don't.</p>
              
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
          
          {darkMode && (
            <div className="dark-mode-message">
              🔦 its dark, how tf u gna see stuff
            </div>
          )}
          
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                social={social}
                onHiveClick={() => setShowHive(true)}
                onBlackjackClick={() => setShowBlackjack(true)}
              />
            ))}
          </div>
          
          <main className="main-content scrollable" role="main">
            <section className="hero" aria-labelledby="stuff-title">
              <button 
                className="back-link"
                onClick={() => setCurrentPage('home')}
                aria-label="Return to home page"
              >
                ← back
              </button>
              
              <h1 className="hero-title" id="stuff-title">other cool stuff</h1>
              <p className="hero-subtitle">projects & experiences</p>
              <p className="hero-attitude">the stuff that actually matters</p>
              
              <div className="stuff-section">
                <section className="stuff-category" aria-labelledby="experiences-heading">
                  <h2 className="stuff-category-title" id="experiences-heading">experiences</h2>
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

                <section className="stuff-category" aria-labelledby="achievements-heading">
                  <h2 className="stuff-category-title" id="achievements-heading">achievements</h2>
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

                <section className="stuff-category" aria-labelledby="projects-heading">
                  <h2 className="stuff-category-title" id="projects-heading">projects</h2>
                  <div className="experiences-list" role="list">
                    {projects.map((project, index) => (
                      <article key={index} className="experience-item" role="listitem">
                        <div>
                          <a 
                            href={project.link}
                            className="experience-link"
                            target={project.link !== '#' ? "_blank" : undefined}
                            rel={project.link !== '#' ? "noopener noreferrer" : undefined}
                            aria-label={`View project ${project.name}`}
                          >
                            <div className="experience-header">
                              <span className="experience-name">{project.name}</span>
                            </div>
                            {project.date && (
                              <time className="experience-date" dateTime={project.date}>{project.date}</time>
                            )}
                            {project.description && (
                              <p className="experience-description">{project.description}</p>
                            )}
                          </a>
                          {project.media && project.media.length > 0 && (
                            <MediaGallery media={project.media} />
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stuff-category" aria-labelledby="volunteering-heading">
                  <h2 className="stuff-category-title" id="volunteering-heading">volunteering</h2>
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
        
        {darkMode && (
          <div className="dark-mode-message">
            🔦 its dark, how tf u gna see shit
          </div>
        )}
        
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
            <h1 className="hero-title" id="hero-title">Vedant</h1>
            <p className="hero-subtitle">i make cool stuff.</p>
            
            <nav className="cool-things" aria-label="Featured projects">
              {currentCoolThings.map((thing, index) => (
                <a 
                  key={index}
                  href={thing.link}
                  className="cool-thing-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${thing.name}`}
                >
                  {thing.name}
                </a>
              ))}
            </nav>

            <nav className="main-navigation" aria-label="Main navigation">
              <div className="other-stuff-link-wrapper">
                <button 
                  className="other-stuff-link"
                  onClick={() => setCurrentPage('stuff')}
                  aria-label="View projects and experiences"
                >
                  other cool stuff ive done
                </button>
              </div>

              <div className="about-link-wrapper">
                <button 
                  className="other-stuff-link"
                  onClick={() => setCurrentPage('about')}
                  aria-label="Learn more about me"
                >
                  about
                </button>
              </div>

              <div className="about-link-wrapper">
                <button 
                  className="other-stuff-link"
                  onClick={() => setCurrentPage('blog')}
                  aria-label="Read blog posts"
                >
                  blog
                </button>
              </div>

              <div className="about-link-wrapper">
                <button 
                  className="other-stuff-link"
                  onClick={() => setShowHive(true)}
                  aria-label="Access Hive AI assistant"
                >
                  hive
                </button>
              </div>

              <div className="about-link-wrapper">
                <button 
                  className="other-stuff-link"
                  onClick={() => setShowBlackjack(true)}
                  aria-label="Play blackjack game"
                >
                  keep playing blackjack
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

