import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARTICLES, PUBLIC_ROUTES, getPageData, render } from '../dist-ssr/entry-server.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", '&apos;')
}

function setMeta(html, selector, value) {
  const escaped = escapeHtml(value)
  const pattern = new RegExp(`<meta (${selector}) content="[^"]*"\\s*/?>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, `<meta $1 content="${escaped}" />`)
  return html.replace('</head>', `  <meta ${selector} content="${escaped}" />\n  </head>`)
}

function makeDocument(route) {
  const page = getPageData(route)
  const canonical = `https://vedantsoni.com${route === '/' ? '' : route}`
  let html = template.replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`)

  html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(page.title)}</title>`)
  html = setMeta(html, 'name="title"', page.title)
  html = setMeta(html, 'name="description"', page.description)
  html = setMeta(html, 'name="keywords"', page.keywords)
  html = setMeta(html, 'property="og:type"', page.type)
  html = setMeta(html, 'property="og:url"', canonical)
  html = setMeta(html, 'property="og:title"', page.title)
  html = setMeta(html, 'property="og:description"', page.description)
  html = setMeta(html, 'name="twitter:url"', canonical)
  html = setMeta(html, 'name="twitter:title"', page.title)
  html = setMeta(html, 'name="twitter:description"', page.description)
  if (page.image) {
    html = setMeta(html, 'property="og:image"', page.image)
    html = setMeta(html, 'name="twitter:image"', page.image)
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`)

  const schema = JSON.stringify(page.schema).replaceAll('<', '\\u003c')
  html = html.replace('</head>', `  <script id="page-structured-data" type="application/ld+json">${schema}</script>\n  </head>`)
  return html
}

for (const route of PUBLIC_ROUTES) {
  const directory = route === '/' ? distDir : path.join(distDir, ...route.split('/').filter(Boolean))
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'index.html'), makeDocument(route))
}

const sitemapEntries = PUBLIC_ROUTES.map((route) => {
  const url = `https://vedantsoni.com${route === '/' ? '/' : route}`
  const priority = route === '/' ? '1.0' : route === '/blog' ? '0.9' : '0.8'
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-07-01</lastmod>\n    <changefreq>${route === '/blog' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}).join('\n')

await writeFile(
  path.join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
)

const rssItems = ARTICLES.map((article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>https://vedantsoni.com/articles/${article.slug}</link>
      <guid isPermaLink="true">https://vedantsoni.com/articles/${article.slug}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>Wed, 01 Jul 2026 12:00:00 GMT</pubDate>
    </item>`).join('\n')

await writeFile(
  path.join(distDir, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Guides for Normal People by Vedant Soni</title>
    <link>https://vedantsoni.com/blog</link>
    <description>Plain-English guides about what AI is, how to use it, and where it actually helps.</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>\n`,
)

await rm(path.join(rootDir, 'dist-ssr'), { recursive: true, force: true })
console.log(`Pre-rendered ${PUBLIC_ROUTES.length} public routes.`)
