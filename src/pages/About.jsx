import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="about-content">
        <h1 className="about-title">About Me</h1>
        <div className="about-section">
          <div className="about-text">
            <p>
              Add your bio and personal information here. Tell visitors about yourself, 
              your background, interests, and what drives you. This is your chance to 
              connect with your audience on a personal level.
            </p>
            <p>
              Share your story, your journey, and what makes you unique. What are your 
              passions? What motivates you? What are you working towards?
            </p>
          </div>
          
          <div className="about-skills">
            <h2>Skills</h2>
            <div className="skills-grid">
              <div className="skill-item">React</div>
              <div className="skill-item">JavaScript</div>
              <div className="skill-item">TypeScript</div>
              <div className="skill-item">Node.js</div>
              <div className="skill-item">Python</div>
              <div className="skill-item">CSS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About




