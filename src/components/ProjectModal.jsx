import './ProjectModal.css'

function ProjectModal({ project, isOpen, onClose }) {
  if (!isOpen || !project) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{project.title}</h2>
        <p className="modal-description">{project.description}</p>
        {project.details && (
          <div className="modal-details">
            <h3>Details</h3>
            <p>{project.details}</p>
          </div>
        )}
        {project.technologies && (
          <div className="modal-tech">
            <h3>Technologies</h3>
            <div className="tech-tags">
              {project.technologies.map((tech, index) => (
                <span key={index} className="tech-tag">{tech}</span>
              ))}
            </div>
          </div>
        )}
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="modal-link">
            View Project →
          </a>
        )}
      </div>
    </div>
  )
}

export default ProjectModal

