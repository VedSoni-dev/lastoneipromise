import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'

export const PUBLIC_ROUTES = ['/']

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}

const OG_IMAGE = 'https://vedantsoni.com/og.png'

export function getPageData(url) {
  if (url === '/') {
    return {
      title: 'Vedant Soni',
      description: 'Vedant Soni is building Wick, an AI that maps how companies run and rebuilds workflows so AI can operate them end to end. Previously built Fern, Cognition (35,000+ users, Google DeepMind), and Eden.',
      keywords: 'Vedant Soni, Wick, AI, enterprise software, robotics, Texas A&M',
      type: 'profile',
      image: OG_IMAGE,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            '@id': 'https://vedantsoni.com/#vedant',
            name: 'Vedant Soni',
            url: 'https://vedantsoni.com',
            email: 'mailto:ved.soni@tamu.edu',
            jobTitle: 'Founder, Wick',
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: 'Texas A&M University',
            },
            sameAs: [
              'https://www.linkedin.com/in/vedantsonimech',
              'https://x.com/VedantRobot',
              'https://github.com/VedSoni-dev',
            ],
            knowsAbout: ['Artificial intelligence', 'Enterprise software', 'Robotics', 'Workflow automation'],
          },
        },
      ],
    }
  }

  return null
}
