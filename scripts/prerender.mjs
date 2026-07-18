import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_ROUTES, getPageData, render } from '../dist-ssr/entry-server.js'

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

function setMeta(html, selector, value) {
  const escaped = escapeHtml(value)
  const pattern = new RegExp(`<meta (${selector}) content="[^"]*"\\s*/?>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, `<meta $1 content="${escaped}" />`)
  return html.replace('</head>', `  <meta ${selector} content="${escaped}" />\n  </head>`)
}

function makeDocument(route) {
  const page = getPageData(route)
  const canonical = 'https://vedantsoni.com/'
  let html = template.replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`)

  html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(page.title)}</title>`)
  html = setMeta(html, 'name="title"', page.title)
  html = setMeta(html, 'name="description"', page.description)
  html = setMeta(html, 'name="keywords"', page.keywords)
  html = setMeta(html, 'property="og:type"', page.type)
  html = setMeta(html, 'property="og:url"', canonical)
  html = setMeta(html, 'property="og:title"', page.title)
  html = setMeta(html, 'property="og:description"', page.description)
  html = setMeta(html, 'property="og:image"', page.image)
  html = setMeta(html, 'name="twitter:url"', canonical)
  html = setMeta(html, 'name="twitter:title"', page.title)
  html = setMeta(html, 'name="twitter:description"', page.description)
  html = setMeta(html, 'name="twitter:image"', page.image)
  html = setMeta(html, 'property="profile:first_name"', 'Vedant')
  html = setMeta(html, 'property="profile:last_name"', 'Soni')
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

await writeFile(
  path.join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://vedantsoni.com/</loc>
    <lastmod>2026-07-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://vedantsoni.com/og.png</image:loc>
      <image:title>Vedant Soni</image:title>
      <image:caption>Vedant Soni — Founder of Teachy</image:caption>
    </image:image>
  </url>
</urlset>
`,
)

await rm(path.join(rootDir, 'dist-ssr'), { recursive: true, force: true })
console.log(`Pre-rendered ${PUBLIC_ROUTES.length} public route.`)
