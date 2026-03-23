import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Typewriter from './Typewriter'
import './ProjectShowcase.css'

const PROJECTS = [
  {
    name: 'Cognition',
    link: 'https://cognitionus.com',
    image: '/cognition-preview.png',
    description: 'adaptive AI learning. 35,000+ users.',
  },
  {
    name: 'Fern',
    link: 'https://fern-chi.vercel.app/',
    image: '/fern-preview.png',
    description: 'AI for nonverbal kids. 10,000+ users.',
  },
  {
    name: 'Eden Robotics',
    link: 'https://eden-robotics.github.io/Eden/',
    image: '/eden-preview.png',
    description: 'humanoid robots that learn.',
  },
]

export default function ProjectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = PROJECTS[activeIndex]

  return (
    <div className="project-showcase">
      <p className="showcase-label">check out</p>
      <div className="showcase-typewriter">
        <Typewriter
          text={PROJECTS.map(p => p.name)}
          speed={70}
          waitTime={2000}
          deleteSpeed={40}
          cursorChar="_"
          className="showcase-name"
          onTextChange={(index) => setActiveIndex(index)}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.a
          key={active.name}
          href={active.link}
          target="_blank"
          rel="noopener noreferrer"
          className="showcase-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="showcase-image-wrapper">
            <img
              src={active.image}
              alt={active.name}
              className="showcase-image"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <p className="showcase-description">{active.description}</p>
        </motion.a>
      </AnimatePresence>
    </div>
  )
}
