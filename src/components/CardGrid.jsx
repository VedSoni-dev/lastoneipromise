import React from 'react';
import './CardGrid.css';

/**
 * Simple grid of white boxes displaying items (projects, experiences, etc.).
 * Each item should contain at least a `name` and optional `role`, `date`, `description`, `link`.
 */
export default function CardGrid({ items, title }) {
  return (
    <section className="card-grid-section">
      {title && <h2 className="card-grid-title">{title}</h2>}
      <div className="card-grid">
        {items.map((it, idx) => (
          <article key={idx} className="card">
            {it.link ? (
              <a href={it.link} className="card-name" target="_blank" rel="noopener noreferrer">
                {it.name}
              </a>
            ) : (
              <span className="card-name">{it.name}</span>
            )}
            {it.role && <div className="card-role">{it.role}</div>}
            {it.date && <time className="card-date" dateTime={it.date}>{it.date}</time>}
            {it.description && <p className="card-description">{it.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
