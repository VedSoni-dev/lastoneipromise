import React from 'react';
import './ProjectsGrid.css';

/**
 * Simple grid component that displays an array of project objects.
 * Expected shape of each item:
 *   { name, description, link, date?, media? }
 */
export default function ProjectsGrid({ items }) {
  return (
    <section className="projects-grid-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {items.map((proj, idx) => (
          <article key={idx} className="project-card">
            {proj.link ? (
              <a href={proj.link} className="project-link" target="_blank" rel="noopener noreferrer">
                <h3 className="project-title">{proj.name}</h3>
              </a>
            ) : (
              <h3 className="project-title">{proj.name}</h3>
            )}
            {proj.description && <p className="project-description">{proj.description}</p>}
            {proj.date && <time className="project-date" dateTime={proj.date}>{proj.date}</time>}
          </article>
        ))}
      </div>
    </section>
  );
}
