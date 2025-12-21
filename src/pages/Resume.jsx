import { useState } from 'react'
import './Resume.css'

function Resume() {
  const [showModal, setShowModal] = useState(false)
  const resumePdfPath = '/resume.pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resumePdfPath
    link.download = 'Vedant_Soni_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGoHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    setShowModal(false)
  }

  return (
    <div className="resume-page">
      <div className="resume-content">
        <button 
          className="resume-explore-link"
          onClick={() => setShowModal(true)}
        >
          you're already on my website, why not check the rest out
        </button>

        {showModal && (
          <div className="resume-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="resume-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="resume-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
              <p className="resume-modal-text">
                before u go, you wont find this resume page again. make sure to download the resume before you leave.
              </p>
              <div className="resume-modal-buttons">
                <button 
                  className="resume-modal-download"
                  onClick={handleDownload}
                >
                  📥 Download Resume
                </button>
                <button 
                  className="resume-modal-go-home"
                  onClick={handleGoHome}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="resume-header">
          <h1 className="resume-title">Vedant Soni</h1>
          <div className="resume-contact">
            <p>(346) 627-5696 | ved.06.soni@gmail.com | <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noopener noreferrer">linkedin.com/in/vedantsonimech</a> | <a href="https://github.com/VedSoni-dev" target="_blank" rel="noopener noreferrer">github.com/VedSoni-dev</a> | <a href="https://vedantsoni.com/" target="_blank" rel="noopener noreferrer">vedantsoni.com</a></p>
          </div>
          <a 
            href={resumePdfPath} 
            download="Vedant_Soni_Resume.pdf"
            className="resume-download-button"
          >
            📥 Download PDF
          </a>
        </div>

        <div className="resume-body">
          <section className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Texas A&M University</span>
                <span className="resume-item-date">Aug. 2024 – June 2028</span>
              </div>
              <p className="resume-item-description">
                Bachelor of Science in Computer Science, Minor: Engineering Entrepreneurship & AI in Business<br />
                College Station, TX<br />
                • Major GPA: 3.7/4.0<br />
                • McFerrin Startup Fast Pass Winner (1st place at TAMU's biggest entrepreneurship hackathon)<br />
                • Ideas Challenge Finalist (Top 1% of 4,500+ applicants, TAMU's premier entrepreneurship competition)
              </p>
            </div>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-title">Experience</h2>
            
            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Cognition</span>
                <span className="resume-item-date">August 2025 – Present</span>
              </div>
              <p className="resume-item-company">Co-Founder & COO | San Francisco, CA</p>
              <p className="resume-item-description">
                • Co-founded Cognition, an AI learning companion that adapts to how you learn best, backed by NVIDIA, Google DeepMind, and CMU LearnLab; managing unit economics, operational scalability, and strategic partnerships.<br />
                • Built proprietary hardware and software algorithms that enable real-time personalized learning interventions, leveraging multi-modal perception and reinforcement learning to boost retention by 40%<br />
                • Leading product development, growth strategy, and cross-functional operations to deliver a privacy-first platform that makes it possible to learn anything more effectively
              </p>
            </div>

            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">RecReach</span>
                <span className="resume-item-date">March 2025 – Present</span>
              </div>
              <p className="resume-item-company">Co-Founder | College Station, TX</p>
              <p className="resume-item-description">
                • Co-founded a AI platform revolutionizing pickup sports coordination and local community engagement, supported by Google for Startups Program, Texas A&M Meloy Incubator, and the McFerrin Center for Entrepreneurship.<br />
                • Engineered the mobile app in React Native with a Firebase backend, integrating AI-driven matchmaking and game-setting features alongside a community-based in-game economy to incentivize participation and retention.
              </p>
            </div>

            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Adaptive Robotics and Technology (ART) Lab, Texas A&M University</span>
                <span className="resume-item-date">April 2025 – Present</span>
              </div>
              <p className="resume-item-company">ML & Robotics Research Assistant | College Station, TX</p>
              <p className="resume-item-description">
                • Developed deep reinforcement learning models (PPO) in NVIDIA Isaac Gym for autonomous agricultural robot swarms, achieving 35% improvement in task completion success rate over baseline methods for precision agriculture applications<br />
                • Designed biologically inspired multi-agent control policies using decentralized GNNs, enabling cooperative swarm behaviors with 25% better formation stability in unstructured outdoor environments
              </p>
            </div>

            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Design Innovation & Generative Intelligence (DIGIT) Lab, Texas A&M University</span>
                <span className="resume-item-date">Feb 2025 – August 2025</span>
              </div>
              <p className="resume-item-company">AI & Robotics Research Assistant | College Station, TX</p>
              <p className="resume-item-description">
                • Engineered an advanced multi-agent, multi-modal system using fine-tuned GPT-4o models, LangChain-based vector search, and a custom retrieval-augmented generation (RAG) pipeline with triplet extraction to autonomously mine and structure knowledge from 12+ materials science databases<br />
                • Leveraged ChromaDB for scalable semantic search and embedding management to construct the largest open-source database for plastic compatibilizers, with goals of academic publication and public online release
              </p>
            </div>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-title">Projects</h2>
            
            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Fern - Accessible AI Communication Platform | AAC, Speech Synthesis, LLMs</span>
                <span className="resume-item-date">March 2025</span>
              </div>
              <p className="resume-item-description">
                • Founded and built Fern, a nonprofit building an AI AAC system providing real-time communication support for nonverbal children with autism; scaled to 10,000+ users across Texas.<br />
                • Engineered sub-50ms latency speech pipeline by integrating Gemini LLM with ElevenLabs APIs into a scalable backend, improving communication efficiency by 60%; supported by AWS Activate.
              </p>
            </div>

            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Hive - Personal Agentic AI System | Multi-Agent Systems, LLM Integration, IoT</span>
                <span className="resume-item-date">June 2025</span>
              </div>
              <p className="resume-item-description">
                • Built a personal AI assistant with personality-driven orchestration across Gmail, Calendar, and productivity tools. Powered by dual-LLM core (Llama 3 8B, Mistral 7B) and a custom workflow engine.<br />
                • Developed full-stack platform with voice-enabled control of 50+ IoT devices, enabling autonomous multi-agent execution. Additionally, developed custom coding CLI from scratch.
              </p>
            </div>

            <div className="resume-item">
              <div className="resume-item-header">
                <span className="resume-item-title">Eden - TURTLE Robotics | Reinforcement Learning, Isaac Sim, Cognitive Architectures</span>
                <span className="resume-item-date">January 2025</span>
              </div>
              <p className="resume-item-description">
                • Lead a 15-member team developing humanoid robots (Adam & Eve) with cognitive architectures for naturalistic interaction.<br />
                • Designed and trained RL policies (PPO, SAC) in Isaac Gym/Sim, boosting motor precision by 40% and adaptation by 50%, while integrating attention + working-memory models for individualized social behavior.
              </p>
            </div>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-title">Technical Skills</h2>
            <p className="resume-item-description">
              <strong>Programming Languages:</strong> Python, C++, JavaScript, TypeScript, Java, Rust, MATLAB<br />
              <strong>Machine Learning & AI:</strong> PyTorch, TensorFlow, Advanced RL (PPO, SAC, TD3), Computer Vision (OpenCV, YOLOv8), Transformer Architectures, LLMs (Hugging Face, LangChain, RAG), Model Optimization (LoRA/QLoRA)<br />
              <strong>Cloud & DevOps:</strong> AWS (EC2, SageMaker, Lambda), GCP, Docker/Kubernetes, MLflow, Weights & Biases
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Resume

