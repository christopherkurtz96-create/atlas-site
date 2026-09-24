---
name: atlas-seo
description: ATLAS Demolition & Site Work SEO skill. Local + organic + AI search strategy specific to Atlas in Columbia MO, ~45 min radius. GBP optimization, review strategy, keyword targeting, blog clusters, service/location pages, citations, backlinks. Use for any Atlas SEO work: blog posts, GBP posts, keyword research, content strategy, ranking analysis.
---

# ATLAS Demolition & Site Work SEO Skill

Rewritten 24 Sep 2026 for the demolition-plus-concrete repositioning. The quarter plan lives at `docs/seo/2026-q4-seo-plan.md`; the audit at `docs/audit/2026-09-repositioning-audit.md`. This file is the standing strategy.

## Business context

- **Name, exact, everywhere:** ATLAS Demolition & Site Work (uppercase ATLAS). Plain "Atlas" is fine in prose.
- **Phone:** (573) 234-6641. **Email:** chris@deployatlas.com. **Site:** https://deployatlas.com (apex, no www, extensionless URLs).
- **Base:** Columbia, MO 65201, service-area business (no storefront address shown). **Area:** ~45 minutes: Columbia, Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland, Centralia, Hallsville, Harrisburg, Rocheport. Counties: Boone, Callaway, Cole, Audrain, Howard, Cooper, Randolph, Moniteau.
- **Positioning:** the demolition company that finishes the job. Tear it out, haul it off, put the site back.
- **Two front doors, one tail.** Demolition (headline, any size). Site Work = concrete and paving (second door, $10K+, parking lots, driveways, slabs, tear-out and replace, no teardown required). Backfill, grading and pad prep are the tail, sold with a demo or concrete job only.
- **Never write as a service:** land clearing, forestry mulching, brush hogging, tree or stump work, standalone excavation or trenching, septic, foundation repair, concrete leveling, mudjacking, patch repair, general repairs.
- **Claims allowed:** licensed and insured (GL, umbrella, workers' comp). Nothing else.
- **Framing:** locally owned, same people on the bid and on the site. Not "Chris does everything."
- **Terminology:** the consultation is the process (free on-site consultation), the bid is the deliverable (fixed price in writing). Never "estimate" or "quote" in UI copy. "Estimate" is allowed only as a search keyword in blog titles and metas. No turnaround-time promises.
- **GBP:** primary category Demolition Contractor; also Concrete Contractor, Excavating Contractor, Debris Removal Service. Managed under christopher.kurtz.96@gmail.com. Book Online button is Jobber's request form (kept on purpose).

## URL tree

`/demolition/` (+ `/structural/`, `/mobile-home-removal/`, `/interior-selective/`) · `/concrete/` (+ `/concrete-removal/`, `/parking-lot-removal/`, `/driveway-replacement/`) · `/site-work/` · `/consultation/` · `/services` · `/service-areas` · `/about` · `/contact` · `/locations/<town>-mo` · `/blog/<slug>` (file stays `blog/<slug>.html`). Old `/services/*.html` and land clearing URLs are 301'd; never link to them.

## Keyword strategy

**Tier 1, money pages**
- demolition contractor Columbia MO · demolition services Columbia MO · house demolition Columbia MO
- mobile home removal cost · mobile home demolition cost (the largest existing cluster)
- concrete removal Columbia MO · concrete removal cost per square foot
- parking lot removal Columbia MO · parking lot replacement cost · asphalt removal
- concrete driveway replacement Columbia MO
- interior demolition Columbia MO · commercial strip out
- site preparation Columbia MO (tail; do not build standalone grading content)

**Tier 2, locations:** demolition contractor + concrete in Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland. Pages exist; add job proof before adding more towns.

**Tier 3, questions (blog):** how much does it cost to demolish a house in Missouri · cost to remove a concrete driveway · cost to tear down a garage · mobile home removal cost · parking lot removal cost · do I need a permit to demolish · what happens to demolition debris · asphalt vs concrete parking lot · how long does demolition take.

## Blog clusters

- **Demolition cost and process** (hub `/demolition/`): cost guides, permits, disconnects, asbestos inspections, what to expect, choosing a contractor, winter work, case studies.
- **Concrete and parking lots** (hub `/concrete/`): removal cost, replacement cost, asphalt vs concrete, phasing, base failure, recycling, church/school/commercial lots, driveway base.
- **Site restoration** (`/site-work/`): backfill, grading, pad prep, what's left after a teardown. Framed as the finish, never as a standalone service.

Cadence: two posts a week (Mon demolition, Thu concrete) from the Notion "Quarterly Atlas Blog Post" page, via the `atlas-weekly-blog` task. 1,500–2,000 words. Primary link to the money page in the row's Notes, one sibling link, FAQ with FAQPage schema, byline "By Chris Kurtz, Owner — ATLAS Demolition & Site Work," CTA "Request a Free Consultation" → `/consultation/`. After a post publishes run `python3 tools/site-build/site_pass.py --no-delete`.

## GBP operating rules

- Weekly: 2–3 real job photos (town + service in caption), 1 post (job, numbers, result, CTA). Concrete and lot photos first in Q4.
- Reviews: ask at completion, text the link same day, ask the customer to describe the work. Reply to every review within 24 hours using town + service. No staff quotas, no naming employees (Google policy, Apr 2026).
- Google Q&A is retired. Ask Maps answers come from the profile, reviews and the site's FAQ blocks. Keep FAQs accurate.
- Website link carries UTM (`utm_source=google&utm_medium=organic&utm_campaign=gbp`).

## AI search

Entity consistency (one name string, citations cleaned), structured facts (HomeAndConstructionBusiness + sameAs + offer catalog + FAQPage on every service page, `/llms.txt`), Bing (verified, IndexNow enabled; submit sitemap in Bing Webmaster), answer-shaped copy (direct answer with the number in the first sentence), third-party mentions (Chamber, BBB, Yelp, local news). Monthly check on ChatGPT, Perplexity and Gemini for the tracked queries.

## Citations

Exact NAP on: Google, Facebook, Instagram, Yelp, Bing Places, Apple Business Connect, BBB, Angi, Nextdoor, Yellow Pages, Columbia Chamber. Old name "Atlas Excavation & Demolition" must be replaced wherever it appears.

## Links

2–4 a month: Chamber listing, supplier and dealer pages, the concrete sub's site, GC partners, one local news or sponsorship mention per quarter.

## Technical

Static HTML on Netlify, apex canonical, extensionless URLs, shared header/footer from `tools/site-build/template.py`, redirect table and sitemap regenerated by `site_pass.py`. `/js` and `/css` are cached immutable for a year: bump the `?v=` query in the template when either changes. Monthly: crawl (status, canonical, H1, title ≤60, meta ≤160, JSON-LD parse), Search Console pull, PageSpeed on home and a money page.

## Measurement

Twelve tracked queries and the quarter targets are in the plan. Report on the 1st of each month: clicks, impressions, positions, reviews, GBP photos, consultation submissions, phone clicks (GA4 `phone_click` event), AI mentions.
