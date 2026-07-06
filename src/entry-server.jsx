import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { SEO, buildStructuredData } from './seo.js'

export const PUBLIC_ROUTES = ['/']

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
      ...SEO,
      schema: buildStructuredData(),
    }
  }

  return null
}
