export const SITE_URL = 'https://vedantsoni.com'
export const SITE_NAME = 'Vedant Soni'
export const PERSON_ID = `${SITE_URL}/#vedant`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const ORG_WICK_ID = `${SITE_URL}/#wick`

export const OG_IMAGE = `${SITE_URL}/og.png`

export const PERSON = {
  givenName: 'Vedant',
  familyName: 'Soni',
  name: 'Vedant Soni',
  alternateName: ['Vedant Soni', 'Ved Soni'],
  email: 'ved.06.soni@gmail.com',
  jobTitle: 'Founder',
  description:
    'Vedant Soni is a 20-year-old founder building Wick, an AI that turns legacy companies AI native. He previously built Fern, Cognition (35,000+ users, backed by Google DeepMind), and Eden Robotics at Texas A&M.',
  image: OG_IMAGE,
  url: SITE_URL,
  sameAs: [
    'https://www.linkedin.com/in/vedantsonimech',
    'https://x.com/VedantRobot',
    'https://github.com/VedSoni-dev',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Texas A&M University',
    url: 'https://www.tamu.edu/',
  },
  knowsAbout: [
    'Artificial intelligence',
    'Enterprise software',
    'Robotics',
    'Workflow automation',
    'Machine learning',
    'Humanoid robots',
  ],
}

export const SEO = {
  title: 'Vedant Soni — Founder of Wick | AI Builder & Roboticist',
  description:
    'Vedant Soni is building Wick, an AI that maps how companies run and rebuilds workflows so AI can operate them end to end. Previously built Fern, Cognition (35,000+ users, Google DeepMind), and Eden Robotics at Texas A&M.',
  keywords:
    'Vedant Soni, Vedant Soni Wick, Vedant Soni AI, Vedant Soni Texas A&M, Wick AI, Fern, Cognition, Eden Robotics, AI founder, robotics researcher',
  url: SITE_URL,
  image: OG_IMAGE,
  type: 'profile',
}

export function buildStructuredData() {
  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    alternateName: PERSON.alternateName,
    url: PERSON.url,
    image: {
      '@type': 'ImageObject',
      url: PERSON.image,
      width: 1200,
      height: 630,
    },
    email: `mailto:${PERSON.email}`,
    jobTitle: PERSON.jobTitle,
    description: PERSON.description,
    worksFor: {
      '@type': 'Organization',
      '@id': ORG_WICK_ID,
      name: 'Wick',
      description: 'AI that maps how legacy companies run and rebuilds workflows so AI can operate them end to end.',
      founder: { '@id': PERSON_ID },
    },
    alumniOf: PERSON.alumniOf,
    knowsAbout: PERSON.knowsAbout,
    sameAs: PERSON.sameAs,
    founder: [
      {
        '@type': 'Organization',
        name: 'Wick',
        '@id': ORG_WICK_ID,
      },
      {
        '@type': 'Organization',
        name: 'Fern',
        url: 'https://trytalkr.com',
        description: 'AI communication tools for children with disabilities.',
      },
      {
        '@type': 'Organization',
        name: 'Cognition',
        url: 'https://cognitionus.com',
        description: 'AI learning platform with 35,000+ users, backed by Google DeepMind.',
      },
      {
        '@type': 'Organization',
        name: 'Eden Robotics',
        url: 'https://eden-robotics.github.io/Eden/',
        description: 'Texas A&M research lab putting emotions and memory inside humanoid robots.',
      },
    ],
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: SEO.description,
        publisher: { '@id': PERSON_ID },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: `${PERSON.name} — Official Site`,
        description: SEO.description,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: OG_IMAGE,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SEO.title,
        description: SEO.description,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PERSON_ID },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: OG_IMAGE,
        },
        inLanguage: 'en-US',
      },
    ],
  }
}
