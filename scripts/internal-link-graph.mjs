#!/usr/bin/env node
// Internal link graph for the static deployatlas.com site.
// Adapted from Illyism/seo-skills internal-linking (MIT) for plain HTML files.
// Usage (repo root): node scripts/internal-link-graph.mjs > seo/internal-link-graph.json
// Contextual links = links inside the page body. Header, nav, footer and the
// sticky action bar are stripped first and counted as sitewide only.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const SITE = 'https://deployatlas.com'
const SKIP_DIRS = new Set(['node_modules', 'tools', 'docs', 'netlify', 'tests', 'images', 'css', 'js', 'scripts', 'seo'])
const SKIP_FILES = new Set(['404.html', 'thank-you.html', 'privacy.html', 'terms.html', 'sitemap.html'])
const MONEY = /^\/(demolition|concrete|site-work|estimate)(\/|$)/

const walk = (dir, out = []) => {
  for (const n of readdirSync(dir)) {
    if (n.startsWith('.') || SKIP_DIRS.has(n)) continue
    const p = join(dir, n)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (n.endsWith('.html') && !(dir === '.' && SKIP_FILES.has(n))) out.push(p)
  }
  return out
}

const norm = (u) => {
  let p = u.replace(SITE, '').split('#')[0].split('?')[0]
  if (!p.startsWith('/')) return null
  p = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
  return p.length > 1 ? p.replace(/\/+$/, '') : '/'
}
const routeOf = (file) => norm('/' + file.split(sep).join('/').replace(/^\.\//, ''))

const strip = (html, tag) => html.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), '')
const hrefs = (html) => {
  const out = new Set()
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const r = norm(m[1])
    if (r) out.add(r)
  }
  return out
}

const pages = new Map(), inbound = new Map(), sitewide = new Set()
for (const file of walk('.')) {
  const html = readFileSync(file, 'utf8')
  const route = routeOf(file)
  let body = html
  for (const t of ['header', 'nav', 'footer', 'script', 'style']) body = strip(body, t)
  const all = hrefs(html), contextual = hrefs(body)
  for (const l of all) if (!contextual.has(l)) sitewide.add(l)
  pages.set(route, file)
  for (const l of contextual) if (l !== route) (inbound.get(l) ?? inbound.set(l, new Set()).get(l)).add(route)
}

const rows = [...pages].map(([route, file]) => ({
  route, file,
  contextualInbound: inbound.get(route)?.size ?? 0,
  linkedFrom: [...(inbound.get(route) ?? [])].sort(),
  inNavOrFooter: sitewide.has(route),
  money: MONEY.test(route),
})).sort((a, b) => a.contextualInbound - b.contextualInbound || a.route.localeCompare(b.route))

const broken = [...inbound.keys()].filter((l) => !pages.has(l) && !/^\/(api|images|css|js|privacy|terms|sitemap|thank-you)/.test(l)).sort()

console.log(JSON.stringify({
  orphanMoneyPages: rows.filter((r) => r.money && r.contextualInbound < 3).map((r) => r.route),
  linksToMissingPages: broken.map((l) => ({ target: l, from: [...inbound.get(l)].sort() })),
  pages: rows,
}, null, 2))
