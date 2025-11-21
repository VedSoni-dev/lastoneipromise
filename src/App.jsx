import { useEffect, useState } from 'react'
import CardSwap, { Card } from './components/CardSwap'
import NavigationArrows from './components/NavigationArrows'
import Particles from './components/Particles'
import Experience from './pages/Experience'
import About from './pages/About'
import Blog from './pages/Blog'
import './App.css'

const projects = [
  {
    title: 'Project 1',
    description: 'A brief description of your first project.',
    image: '/placeholder-image.jpg' // Replace with your image path
  },
  {
    title: 'Project 2',
    description: 'Details about your second project.',
    image: '/placeholder-image.jpg' // Replace with your image path
  },
  {
    title: 'Project 3',
    description: 'Information about your third project.',
    image: '/placeholder-image.jpg' // Replace with your image path
  },
  {
    title: 'Project 4',
    description: 'Your fourth project showcase.',
    image: '/placeholder-image.jpg' // Replace with your image path
  }
]

function App() {
  const [currentPage, setCurrentPage] = useState(0) // 0: home, 1: experience (down), 2: about (right), 3: blog (up)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    console.log('App rendered')
  }, [])

  const handleNavigate = (page) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentPage(page)
    setTimeout(() => setIsTransitioning(false), 800)
  }

  return (
    <div className="app-container">
      <Particles />
      <NavigationArrows currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className={`page home-page ${currentPage === 0 ? 'active' : 'inactive'}`}>
        <div className="app" style={{ minHeight: '100vh', background: 'white', color: 'black' }}>
          <main className="main-content">
            <section className="hero">
              <h1 className="hero-title" style={{ color: 'black' }}>Your headline goes here.</h1>
              <p className="hero-subtitle" style={{ color: '#666' }}>Add your description or tagline here.</p>
            </section>
            
            <div className="card-swap-wrapper">
              {typeof window !== 'undefined' && (
                <CardSwap
                  width={800}
                  height={600}
                  cardDistance={80}
                  verticalDistance={90}
                  delay={5000}
                  pauseOnHover={true}
                  skewAmount={0}
                >
                  {projects.map((project, index) => (
                    <Card key={index}>
                      {project.image && (
                        <img src={project.image} alt={project.title} />
                      )}
                      <div className="card-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                      </div>
                    </Card>
                  ))}
                </CardSwap>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <div className={`page experience-page-wrapper ${currentPage === 1 ? 'active' : 'inactive'}`}>
        <Experience />
      </div>
      
      <div className={`page about-page-wrapper ${currentPage === 2 ? 'active' : 'inactive'}`}>
        <About />
      </div>
      
      <div className={`page blog-page-wrapper ${currentPage === 3 ? 'active' : 'inactive'}`}>
        <Blog />
      </div>
    </div>
  )
}

export default App

