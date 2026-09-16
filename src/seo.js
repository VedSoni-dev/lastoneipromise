export const SITE_URL = 'https://vedantsoni.com'
export const SITE_NAME = 'Vedant Soni'
export const PERSON_ID = `${SITE_URL}/#vedant`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const OG_IMAGE = `${SITE_URL}/og.png`

export const PERSON = {
  givenName: 'Vedant',
  familyName: 'Soni',
  name: 'Vedant Soni',
  alternateName: ['Vedant Soni', 'Ved Soni'],
  email: 'ved.06.soni@gmail.com',
  jobTitle: 'Founder and AI Engineer',
  description:
    'Vedant Soni builds intuitive consumer software and works on AI at Texas A&M. Creator of the Texas A&M Harness and founder of Fern and Eden.',
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
  title: 'Vedant Soni — Builder',
  description:
    'Vedant Soni builds intuitive consumer software and works on AI at Texas A&M. Creator of the Texas A&M Harness and founder of Fern and Eden.',
  keywords:
    'Vedant Soni, Vedant Soni AI, Vedant Soni Texas A&M, Fern, Eden Robotics, AI founder, robotics researcher',
  url: SITE_URL,
  image: OG_IMAGE,
  type: 'profile',
}

export const COOL_STUFF_SEO = {
  ...SEO,
  title: "Cool stuff I've made — Vedant Soni",
  description: 'Projects by Vedant Soni, including Fern, Merchant Agent, Teachy, OmniWork, and Eden. Explore apps, AI agents, learning tools, and robotics.',
  url: `${SITE_URL}/cool-stuff`,
  type: 'website',
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
    alumniOf: PERSON.alumniOf,
    knowsAbout: PERSON.knowsAbout,
    sameAs: PERSON.sameAs,
    founder: [
      {
        '@type': 'Organization',
        name: 'Fern',
        url: 'https://trytalkr.com',
        description: 'AI communication tools for children with disabilities.',
      },
      {
        '@type': 'Organization',
        name: 'Eden Robotics',
        url: 'https://eden-robotics.github.io/Eden/',
        description: 'University-backed undergraduate lab founded by Vedant Soni, exploring emotions and decision-making in robots.',
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
