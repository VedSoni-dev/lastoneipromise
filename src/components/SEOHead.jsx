import { useEffect } from 'react'

const OG_IMAGE = 'https://vedantsoni.com/og.png'

function SEOHead({
  title = 'Vedant Soni',
  description = 'Vedant Soni is building Wick, an AI that maps how companies run and rebuilds workflows so AI can operate them end to end. Previously built Fern, Cognition, and Eden.',
  keywords = 'Vedant Soni, Wick, AI, enterprise software, robotics, Texas A&M',
  image = OG_IMAGE,
  url = 'https://vedantsoni.com',
  type = 'website',
}) {
  useEffect(() => {
    document.title = title

    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', 'Vedant Soni')
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMetaTag('googlebot', 'index, follow')

    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '630', true)
    updateMetaTag('og:image:alt', title, true)
    updateMetaTag('og:site_name', 'Vedant Soni', true)
    updateMetaTag('og:locale', 'en_US', true)

    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:url', url)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    updateMetaTag('twitter:image:alt', title)
    updateMetaTag('twitter:creator', '@VedantRobot')
    updateMetaTag('twitter:site', '@VedantRobot')

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, keywords, image, url, type])

  return null
}

export default SEOHead
