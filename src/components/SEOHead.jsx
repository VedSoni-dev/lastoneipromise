import { useEffect } from 'react'

function SEOHead({ 
  title = "Vedant Soni - Portfolio | AI Developer & Entrepreneur",
  description = "Portfolio of Vedant Soni - AI developer, entrepreneur, and researcher. Building the future with AI-powered projects including Cognition, TalkR, Hive, and robotics. 35k+ users, backed by NVIDIA & Google DeepMind.",
  keywords = "Vedant Soni, portfolio, developer, AI developer, machine learning, entrepreneur, Texas A&M, computer science, React developer, full stack developer, AI researcher, robotics, TalkR, Hive, Cognition, Recreach, reinforcement learning",
  image = "https://vedantsoni.com/og-image.jpg",
  url = "https://vedantsoni.com",
  type = "website"
}) {
  useEffect(() => {
    // Update title
    document.title = title

    // Update or create meta tags
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

    // Primary meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', 'Vedant Soni')
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMetaTag('googlebot', 'index, follow')
    updateMetaTag('language', 'English')
    updateMetaTag('revisit-after', '7 days')

    // Open Graph tags
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '630', true)
    updateMetaTag('og:image:alt', title, true)
    updateMetaTag('og:site_name', 'Vedant Soni Portfolio', true)
    updateMetaTag('og:locale', 'en_US', true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:url', url)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    updateMetaTag('twitter:image:alt', title)
    updateMetaTag('twitter:creator', '@VedantRobot')
    updateMetaTag('twitter:site', '@VedantRobot')

    // Update canonical link
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

