import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { ARTICLES } from './pages/Articles.jsx'

export { ARTICLES }

export const PUBLIC_ROUTES = [
  '/',
  '/blog',
  ...ARTICLES.map((article) => `/articles/${article.slug}`),
]

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}

export function getPageData(url) {
  if (url === '/') {
    return {
      title: 'Vedant Soni',
      description: 'Vedant Soni is building Wick, an AI that turns legacy companies AI native and self-driving. Previously built Fern. Researches robotics at Texas A&M.',
      keywords: 'Vedant Soni, Wick, AI, robotics, Texas A&M',
      type: 'profile',
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
            jobTitle: 'AI Builder and Researcher',
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: 'Texas A&M University',
            },
            sameAs: [
              'https://www.linkedin.com/in/vedantsonimech',
              'https://x.com/VedantRobot',
              'https://github.com/VedSoni-dev',
            ],
            knowsAbout: ['Artificial intelligence', 'Machine learning', 'Robotics', 'AI education'],
          },
        },
      ],
    }
  }

  if (url === '/blog') {
    return {
      title: 'AI Guides for Normal People | Vedant Soni',
      description: 'Plain-English guides about what AI is, how to use it, and where it actually helps. Written by Vedant Soni.',
      keywords: 'AI guides for beginners, what is AI, how to use ChatGPT, AI explained simply, practical AI tips',
      type: 'website',
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'AI Guides for Normal People',
          url: 'https://vedantsoni.com/blog',
          author: { '@id': 'https://vedantsoni.com/#vedant' },
          hasPart: ARTICLES.map((article) => ({
            '@type': 'Article',
            headline: article.title,
            url: `https://vedantsoni.com/articles/${article.slug}`,
          })),
        },
      ],
    }
  }

  const slug = url.split('/').filter(Boolean).at(-1)
  const article = ARTICLES.find((item) => item.slug === slug)

  if (!article) return null

  return {
    title: `${article.title} | Vedant Soni`,
    description: article.description,
    keywords: `${article.title}, AI for beginners, AI explained simply, Vedant Soni`,
    type: 'article',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        datePublished: '2026-07-01',
        dateModified: '2026-07-01',
        mainEntityOfPage: `https://vedantsoni.com/articles/${article.slug}`,
        author: {
          '@type': 'Person',
          '@id': 'https://vedantsoni.com/#vedant',
          name: 'Vedant Soni',
          url: 'https://vedantsoni.com',
        },
        citation: article.sources.map(([, sourceUrl]) => sourceUrl),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vedantsoni.com' },
          { '@type': 'ListItem', position: 2, name: 'AI guides', item: 'https://vedantsoni.com/blog' },
          { '@type': 'ListItem', position: 3, name: article.title, item: `https://vedantsoni.com/articles/${article.slug}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      },
    ],
  }
}
