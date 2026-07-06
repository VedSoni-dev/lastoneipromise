import { useEffect } from 'react'
import { SEO, PERSON } from '../seo'

function SEOHead({
  title = SEO.title,
  description = SEO.description,
  keywords = SEO.keywords,
  image = SEO.image,
  url = SEO.url,
  type = SEO.type,
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

    updateMetaTag('title', title)
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', PERSON.name)
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMetaTag('googlebot', 'index, follow')

    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '630', true)
    updateMetaTag('og:image:alt', `${PERSON.name} — Founder of Wick`, true)
    updateMetaTag('og:site_name', PERSON.name, true)
    updateMetaTag('og:locale', 'en_US', true)
    updateMetaTag('profile:first_name', PERSON.givenName, true)
    updateMetaTag('profile:last_name', PERSON.familyName, true)
    updateMetaTag('profile:username', 'VedantRobot', true)

    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:url', url)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    updateMetaTag('twitter:image:alt', `${PERSON.name} — Founder of Wick`)
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
