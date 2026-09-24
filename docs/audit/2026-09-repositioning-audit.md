# ATLAS Demolition & Site Work — Site and SEO Audit

**Standard:** Atlas Direction Brief, September 2026, as refined by Chris on 24 Sep 2026 (see "Decisions that changed the brief").
**Site:** deployatlas.com (static HTML, GitHub → Netlify).
**Data:** Search Console, 24 Jun – 21 Sep 2026 (90 days). Repo inventory as of commit `e17a686`.
**Status:** Approved by Chris 24 Sep 2026. Tier 0, Tier 1 and the Tier 2 restructure shipped the same night; see the execution log at the end.

---

## 0. Decisions that changed the brief

These came out of the Q&A on 24 Sep and override the brief where they conflict.

| Topic | Brief said | Decision |
|---|---|---|
| Concrete | Nested under demolition, sold as the back half of a teardown | **Second front door.** Parking lots, driveways, slabs, tear-out and replace. Not contingent on Atlas doing the demo. $10K floor, $25–50K target. |
| Asphalt replacement | Not offered until a sub is secured | **Offered.** Owner-confirmed. |
| Excavation | Part of "site work" bucket | **Tail only.** Backfill, grading, pad prep, gravel sold attached to a demo or concrete job. No standalone grading page, no standalone excavation service. |
| Size filter | Decline small site work | **Implicit.** No published minimum. Intake form and keyword choice do the filtering. Demolition takes any size. |
| Instant bid | Rework the calculator | **Replace with a scoped intake form** on Netlify. No public unit prices. Lead routing reworked later. |
| Cost content | No unit prices without confirmation | **Publish market-based rough ranges**, correct after publish. |
| Locations | Six named towns, lowest priority | **Build five** (Columbia, Jefferson City, Fulton, Moberly, Fayette). Keep Boonville and Ashland light. Fold Centralia, Hallsville, Harrisburg, Rocheport into the service-areas page. |
| URLs | New IA paths | **Migrate.** New URL tree, extensionless, 301s from every old path. |
| Blog cadence | Weekly | **Two per week** (one demolition, one concrete) for Q4, then one per week plus refreshes. |
| Licensing claim | Verify before repeating | **"Licensed and insured" stays.** Owner-confirmed. |
| Reviews | — | Quote by first name. 11 five-star, none mention concrete yet. |
| Footer legal line | — | "ATLAS Demolition & Site Work" only. |
| Google Ads | Realign now | **Separate session** after the site ships. |

---

## 1. What shipped tonight (Tier 0)

| Change | PR | Verified live |
|---|---|---|
| Name flipped to ATLAS Demolition & Site Work in every title, meta, OG, schema, header, footer, copyright (68 files) | #8 | Yes |
| "Demolition & Land Clearing" → "Demolition & Site Work" in titles, H1s, home hero (stopgap) | #8 | Yes |
| Land Clearing removed from desktop nav, mobile nav, footer on every page (136 lines) and the home service card | #8 | Yes |
| New favicon set (ico 16/32/48, 96px PNG, 180px Apple touch, 512 master) linked root-absolute on 53 pages | #9 | Yes |
| Notion blog checklist byline updated | — | Yes |
| Decisions logged to the shared memory vault inbox | — | Yes |

**Incident.** PR #8 also added an apex→www redirect. Netlify's primary domain is the apex, so it already redirects www→apex, and the two rules looped. The site served 301 loops for roughly two minutes (01:41–01:43 CDT) until the rule was reverted on main. Lesson recorded in memory. Resolution chosen: Netlify keeps the apex as primary, and the site's canonicals, sitemap and schema were switched to `https://deployatlas.com` so served host, canonical and redirect target agree (see T1).

---

## 2. What Search Console says (90 days)

| Metric | Value |
|---|---|
| Total clicks | ~100 |
| Total impressions | ~4,000 |
| Land clearing queries | 2,310 impressions, avg position 1.9, **4 clicks** |
| Demolition queries | 1,092 impressions, avg position 21.6, 1 click |
| Concrete queries | 13 impressions, 4 queries |
| Home page (www) | 3,346 impressions at position 2.5 |
| Home page (apex) | 914 impressions at position 11.3 |
| Demolition service page | 541 impressions at position 29.5 |
| Mobile home removal cost post | 2,088 impressions at position 12.1 |
| Sitemap | 50 submitted, **0 reported indexed** |

**What this means.**

1. **Organic search is not where the leads come from.** ~100 clicks a quarter. The #1 map pack ranking is doing the work, and it runs on the profile, reviews and proximity, not on these pages. The restructure cannot hurt what produces calls today.
2. **Retiring land clearing costs almost nothing.** Position 1 across 40 land-clearing queries produced 4 clicks. Those are impressions without intent to click (map results, low-volume towns). The trade is cheap.
3. **Demolition organic has to be built, not protected.** "demolition contractor" shows 262 impressions at position 1.1 with zero clicks, which is a local-pack impression, not a web result. The web page that should own demolition sits at position 29.
4. **The single biggest organic opportunity is the mobile home removal cost cluster.** ~350 impressions across 15 cost-phrased queries at positions 20–35, plus the post itself at position 12 for 2,088 impressions. Moving that post to page 1 would multiply the site's total clicks.
5. **Concrete starts from zero.** Four queries, thirteen impressions. Every concrete ranking will be new.

---

## 3. Current-state inventory

Word counts exclude header, nav and footer. Title length target ≤60, meta ≤160. "Cost" queries are what the page currently ranks for, if anything.

### Core pages

| URL | Title len | Meta len | Words | Currently ranks for | Verdict |
|---|---|---|---|---|---|
| / | 68 | 178 | 596 | land clearing (pos 1–2), brand | **Rewrite.** Two-door hero, demolition first. Cut title to ≤60. |
| /services.html | 77 | 162 | 250 | — | **Rewrite** as the services overview linking both hubs + site work. Fix 3 broken links. |
| /services/demolition.html | 65 | 187 | 638 | home demolition near me (29) | **Move + rewrite** → `/demolition/` hub. |
| /services/concrete-removal.html | 58 | 166 | 263 | — | **Move + rewrite** → `/concrete/concrete-removal/`. Money page, currently 263 words. |
| /services/mobile-home-removal.html | 61 | 143 | 290 | removal services (64) | **Move + rewrite** → `/demolition/mobile-home-removal/`. Absorb the cost cluster. |
| /services/excavation.html | 65 | 178 | 428 | — | **Redirect** → `/site-work/`. |
| /services/foundation-excavation.html | 63 | 185 | 253 | — | **Redirect** → `/site-work/`. |
| /services/grading-drainage.html | 60 | 165 | 251 | — | **Redirect** → `/site-work/`. |
| /services/site-preparation.html | 58 | 148 | 267 | — | **Redirect** → `/site-work/` (content merged). |
| /services/land-clearing.html | 55 | 162 | 294 | land clearing (1) | **Redirect** → `/site-work/`. Retired scope. |
| /instant-bid.html | 70 | 141 | 384 | — | **Replace** with scoped intake form at `/consultation/`. Add to sitemap. |
| /service-areas.html | 59 | 164 | 183 | — | **Rewrite.** Absorb four small-town pages as sections. |
| /about.html | 54 | 167 | 451 | atlas columbia (60) | **Rewrite.** Still says "excavation company" in keywords/alt. |
| /contact.html | 56 | 155 | 222 | — | **Keep.** NAP check, email decision. |
| /privacy, /terms, /thank-you, /404, /sitemap.html | — | — | — | **Keep.** Name already fixed. |

### Location pages

| URL | Words | Ranks for | Verdict |
|---|---|---|---|
| /locations/columbia-mo.html | 259 | — | **Rewrite, build to depth.** |
| /locations/fulton-mo.html | 176 | atlas fulton mo (5) | **Rewrite, build to depth.** |
| /locations/boonville-mo.html | 172 | — | **Keep, light refresh.** |
| /locations/ashland-mo.html | 179 | — | **Keep, light refresh.** |
| /locations/centralia-mo.html | 145 | atlas excavation (77) | **Redirect** → `/service-areas/#centralia`. |
| /locations/hallsville-mo.html | 141 | — | **Redirect** → `/service-areas/#hallsville`. |
| /locations/harrisburg-mo.html | 138 | — | **Redirect** → `/service-areas/#harrisburg`. |
| /locations/rocheport-mo.html | 147 | land clearing rocheport (1) | **Redirect** → `/service-areas/#rocheport`. |
| (new) /locations/jefferson-city-mo/ | — | — | **Build.** Competitors: Wreck & Roll, Grizzly, Twehous. |
| (new) /locations/moberly-mo/ | — | — | **Build.** |
| (new) /locations/fayette-mo/ | — | — | **Build.** Howard County, no local demo competitor. |

All eight existing location pages are 138–259 words of near-identical copy. Four have no LocalBusiness schema. This is the thin-duplicate pattern the brief warns against.

### Blog (26 posts)

| Post | Words | Ranks for | Verdict |
|---|---|---|---|
| mobile-home-removal-cost-mid-missouri | 1,166 | 2,088 impr @ 12; cost cluster @ 20–35 | **Expand to 2,000+.** Highest-value refresh on the site. |
| concrete-removal-cost-columbia-mo | 1,309 | 39 impr @ 5 | **Expand to 2,000+.** Becomes the concrete cost pillar. |
| house-demolition-cost-columbia-mo | 1,877 | 613 impr @ 6.5 | Keep. Trim 213-char meta. |
| demolition-permit-columbia-mo | 1,975 | 578 impr @ 7.4 | Keep. |
| demolition-cost-columbia-missouri | 2,946 | — | Keep. Link from every cost page. |
| garage-demolition-cost-columbia-mo | 1,446 | — | Keep, light expand. |
| mobile-home-removal-boone-county-mo | 1,044 | — | Keep as case study; link to cost post. |
| concrete-removal-columbia-mo | 2,361 | — | Keep. Link to new money page. |
| lot-grading-after-demolition-columbia-mo | 2,905 | 6 impr @ 2.5 | Keep. Link to /site-work. |
| barn, commercial-demolition-contractor, commercial-strip-out, demolish-or-renovate, debris-disposal, insurance, fire-damage, hire-contractor, how-long, interior, partial, pool-removal, shed-deck | 1,496–3,248 | scattered | **Keep.** Internal links repointed to new hub URLs. |
| brush-hogging-columbia-mo | 2,575 | — | **Redirect** → `/site-work/`. |
| forestry-mulching-columbia-mo | 2,404 | 50 impr @ 5.8 | **Redirect** → `/site-work/`. |
| fence-line-clearing-mid-missouri | 2,172 | 583 impr @ 7.2, 9 clicks | **Redirect** → `/site-work/`. Largest single retired asset. |
| land-clearing-cost-columbia-mo | 2,482 | — | **Redirect** → `/site-work/`. |

---

## 4. Surfaces still carrying old positioning

Name strings are gone. What remains is positioning, not naming.

| Surface | File(s) | What's wrong | Fix in |
|---|---|---|---|
| Land clearing service page | `services/land-clearing.html` | Live, in sitemap, retired scope | Tier 2 redirect |
| Four land clearing posts | `blog/{brush-hogging,forestry-mulching,fence-line-clearing,land-clearing-cost}*.html` | Live, in sitemap | Tier 2 redirect |
| In-body land clearing links | 16 links across blog posts and service pages | Point at retired page | Tier 2, repointed with the link pass |
| Instant-bid calculator | `instant-bid.html` line 214 onward | "Land Clearing" tab with acreage pricing cards | Tier 2 page replacement |
| Home sub-services grid | `index.html` ~line 225 | Excavation, grading, foundation cards as peer services | Tier 2 home rewrite |
| Location page bodies | all 8 | "land clearing" in meta descriptions and body copy | Tier 2/3 |
| About page | `about.html` | keywords meta "excavation company", team photo alt | Tier 2 |
| Facebook sameAs | `index.html` schema | `facebook.com/atlasexcavation` | Verify the handle, update |
| Email | 36 files, 125 refs | `chris@deployatlas.com`; brief canonical is `chris@deployatlas.com` | Chris decides |
| Local skill files | `.claude/commands/*.md`, `.claude/skills/*` | Taxonomy still lists Land Clearing as a service category; link map points at `/services/land-clearing.html` | Tier 1 |
| Weekly blog task prompt | `~/.claude/scheduled-tasks/atlas-weekly-blog/SKILL.md` | Fine on name; needs the new hub URLs and a 2/week cadence | Tier 1 |
| Cloud skill `anthropic-skills:atlas-seo-content` | not on disk | Its scope text still covers land clearing and excludes site work | Chris re-installs or we swap the task to the local pipeline skill |

---

## 5. Gap analysis against the target architecture

Target IA, revised for the concrete front door. Extensionless URLs, directory-index files.

```
/                          home: two doors, demolition first
/demolition/               HUB  (from services/demolition.html)
  /structural/             NEW  houses, garages, barns, sheds, outbuildings, basement backfill
  /mobile-home-removal/    MOVE (from services/mobile-home-removal.html)
  /interior-selective/     NEW  strip-outs, selective demo, occupied buildings
  /concrete-demolition/    NEW  slabs, footings, foundations (demo-side entry; links to /concrete/)
/concrete/                 HUB  NEW  "Concrete & Paving"
  /concrete-removal/       MOVE (from services/concrete-removal.html)   MONEY
  /parking-lot-removal/    NEW  incl. asphalt removal + replacement     MONEY
  /driveway-replacement/   NEW  tear out + pour back
/site-work/                NEW  single page: backfill, grading, pad prep, gravel, drainage-as-regrade
/consultation/              REPLACE  scoped intake form (paid-search landing)
/services/                 REWRITE  overview linking the three above
/service-areas/            REWRITE  + four folded towns as anchored sections
/locations/{columbia,jefferson-city,fulton,moberly,fayette}-mo/   BUILD
/locations/{boonville,ashland}-mo/                                REFRESH
/blog/...                  unchanged URLs, links repointed
```

| Target page | Exists today? | Gap |
|---|---|---|
| /demolition/ hub | Partial (638-word service page at pos 29) | Needs hub structure, process, pricing model, permits/disconnects, FAQ, links to four children |
| /demolition/structural/ | No | Content is scattered across blog posts (house, garage, barn, shed). Needs a service page. |
| /demolition/interior-selective/ | No (two blog posts cover it) | Service page needed for "interior demolition Columbia MO" |
| /concrete/ hub | No | Entire front door missing |
| /concrete/concrete-removal/ | 263-word page | Needs 1,200+ words, pricing basis, recycling, replacement option, FAQ |
| /concrete/parking-lot-removal/ | No | Money page missing entirely. Zero content on the site for commercial lots. |
| /concrete/driveway-replacement/ | No | The most common owner-direct concrete job has no page |
| /site-work/ | No (four fragments: excavation, foundation, grading, site-prep) | Merge into one page framed as "after the teardown" |
| /consultation/ | Calculator with land clearing tab | Replace |
| Location pages | 8 thin | 5 build, 2 refresh, 4 fold, 3 new |
| FAQPage on every service page | Yes on existing service pages | Carry forward; write the brief's nine questions into the hubs |
| BreadcrumbList | Yes | Carry forward with new paths |

---

## 6. Technical SEO findings, severity-ranked

| # | Severity | Finding | Evidence | Fix | Owner |
|---|---|---|---|---|---|
| T1 | **Critical** | Canonical host mismatch. Netlify serves the apex as primary and 301s www→apex. Every canonical tag, sitemap URL and the brief say www. Google indexes both. | GSC: www home 3,346 impr @ 2.5; apex home 914 impr @ 11.3. `curl -I https://deployatlas.com/` → 301 to apex. | **Done.** Netlify primary stays the apex. All 440 www references (canonicals, OG, schema, sitemap) switched to the apex. www→apex 301 is Netlify's own. | Claude, shipped |
| T2 | **High** | Soft 404s. Any nonexistent URL returns the home page with HTTP 200 for English-language browsers. | `curl https://deployatlas.com/this-page-does-not-exist` → 200, 36,367 bytes (index.html). Cause: `from="/*" to="/index.html" status=200 conditions Language=en` in netlify.toml precedes the 404 rule. | Delete that rewrite block. Netlify serves extensionless paths from `.html` files natively; the rule is unnecessary. | Claude, Tier 1 |
| T3 | **High** | Sitemap reports 0 indexed of 50 submitted. | GSC sitemaps endpoint. | Likely a symptom of T1. Resubmit after T1 and after the URL migration. Also add `/instant-bid` (missing). | Claude, after T1 |
| T4 | **High** | Business schema is inconsistent. Home uses `GeneralContractor`; most pages `LocalBusiness`; four location pages have none; single `sameAs` (Facebook, old handle); no Instagram; no `Service` entries mirroring the profile. | Schema type scan (section 3 script). | One shared `HomeAndConstructionBusiness` block on every page: new name, phone, address, geo, `areaServed` (11 cities), `sameAs` (GBP, Facebook, Instagram), `hasOfferCatalog` mirroring the profile's live services. FAQPage on every service page. BreadcrumbList with new paths. | Claude, Tier 2 |
| T5 | Medium | Three broken internal links on the services overview. | `services.html` → `services/house-demolition.html`, `services/commercial-demolition.html`, `services/trenching.html` (none exist; they hit T2's soft 404). | Repoint or remove in the services rewrite. Quick fix now. | Claude, Tier 1 |
| T6 | Medium | Title tags over 60 characters on 25 pages; meta descriptions over 160 on 9. | Inventory: home 68/178, services 77, demolition 65/187, all locations 64–68, several posts 70–82; house-cost meta 213. | Rewrite with the keyword map in section 8. | Claude, Tier 2 |
| T7 | Medium | Location pages are thin and near-duplicate (138–259 words), the pattern the brief prohibits. | Inventory. | Section 3 plan: build 5, refresh 2, fold 4. | Claude, Tier 3 |
| T8 | Medium | Money page is a stub. `services/concrete-removal.html` has 263 words. No parking lot page exists. | Inventory. | Section 9 skeletons. | Claude, Tier 2 |
| T9 | Medium | Email inconsistency. 125 refs to `hello@`, 6 to `chris@`; schema uses `hello@`. | grep. | Chris picks one; single replace pass. | Chris → Claude |
| T10 | Medium | Instant-bid page missing from sitemap; its canonical is `/instant-bid` while every other page canonicalizes to `.html`. | sitemap diff. | Resolved by the extensionless migration. | Claude, Tier 2 |
| T11 | Low | Image weight. `images/` is 92 MB; `about-team.jpg` 3.6 MB, `interior-demolition.jpg` 2.1 MB, a dozen more at 400–700 KB. | `ls -S`. | Convert hero and service images to WebP at ≤200 KB with `srcset`. | Claude, Tier 2 |
| T12 | Low | Old Facebook handle in schema `sameAs` (`/atlasexcavation`). | index.html. | Confirm current handle, update. | Chris confirms → Claude |
| T13 | Low | Search Console site-verification and property should be checked for the www prefix property in addition to the domain property once T1 lands. | — | — | Claude |
| T14 | Info | Core Web Vitals not measured tonight. Static HTML, no framework, ~36 KB documents: risk is image weight (T11), not scripts. | — | Run PageSpeed after Tier 2 ships. | Claude |
| T15 | Info | All images carry alt text. FAQPage and BreadcrumbList already present on service pages and every post. HTTPS and canonicals present on every page. Robots allows all. | scans | Nothing to do. | — |

Off-site items from the brief, not auditable from the repo: UTM parameters on the GBP website link; GBP booking button destination (route to `/consultation/`); citation NAP updates; DBA filing confirmation.

---

## 7. Implementation plan

### Tier 1 — this week (after approval)

Small, safe, unblocks everything else.

1. ~~Netlify primary domain~~ Resolved by canonicalizing to the apex (T1). Email = chris@ (T9). Facebook/Instagram handles supplied (T12).
2. Remove the soft-404 rewrite from netlify.toml (T2). Fix the three broken links on services.html (T5). Add `/instant-bid` to the sitemap.
3. Write the Q4 schedule into the Notion "Quarterly Atlas Blog Post" page (24 rows, two per week, Sep 28 → Dec 14) so Monday's run has a post. Titles in section 10.
4. Update the weekly blog task prompt: two runs per week (Mon + Thu), new hub URLs as link targets, cadence and byline. Update the local skill files' service taxonomy (drop Land Clearing, add Concrete).
5. Ship the concrete removal and parking lot removal money pages first, at the new URLs, before the rest of the tree. They can go live standalone and start aging.

### Tier 2 — this month

The restructure, shipped as three PRs so each is reviewable.

**PR A — Demolition tree.** `/demolition/` hub + structural + interior-selective + concrete-demolition; move mobile-home-removal; 301s from the two old service URLs; breadcrumbs, FAQPage, shared business schema (T4). Home page rewritten: two-door hero, service blocks ordered demolition → concrete → site work, real photos, one CTA.

**PR B — Concrete tree and site work.** `/concrete/` hub + driveway-replacement (money pages from Tier 1 already live); `/site-work/` with content merged from the four excavation fragments; 301s for excavation, foundation-excavation, grading-drainage, site-preparation, land-clearing and the four land clearing posts; the in-body link pass across all 26 posts; services overview rewritten; about rewritten.

**PR C — Instant bid and hygiene.** Intake form replaces the calculator (square footage, structure type, photo upload, address, timeline; Netlify form; thank-you page); extensionless canonicals and `.html`→clean 301s across the site; sitemap regenerated and resubmitted to Google and Bing; WebP image pass (T11); title and meta rewrite pass (T6).

Content in parallel: expand the mobile home cost post and the concrete removal cost post to 2,000+ words each (the two highest-leverage refreshes on the site); first eight Q4 blog posts publish on schedule.

### Tier 3 — this quarter

1. Location pages: build Columbia, Jefferson City, Fulton, Moberly, Fayette to depth (jobs, photos, permit office, county specifics); refresh Boonville and Ashland; fold the four small towns into service-areas with 301s.
2. Cost content cluster: house teardown, garage, mobile home, concrete driveway, parking lot, concrete replacement — each a post linked to its money page, ranges from section 9, corrected as real bids come in.
3. Review program: ask at completion, ask customers to **describe the work** ("removed our parking lot and poured a new one"), reply to every review. Target four a month. First concrete-mention review is a milestone.
4. Photo cadence: two GBP photo posts a week from the T9 drive; every new page ships with a real job photo or a marked slot.
5. Measure: Search Console weekly for the first month after each migration PR; PageSpeed after PR C; re-run the section 2 numbers at quarter end.

---

## 8. Keyword map by page

| Page | Primary | Supporting |
|---|---|---|
| / | demolition contractor Columbia MO | demolition and concrete, Mid-Missouri |
| /demolition/ | demolition services Columbia MO | demolition company, demolition contractor near me, demolition cost Missouri |
| /demolition/structural/ | house demolition Columbia MO | garage demolition, barn teardown, shed removal, basement fill-in |
| /demolition/mobile-home-removal/ | mobile home removal cost | mobile home demolition, trailer removal cost, how much to demolish a mobile home |
| /demolition/interior-selective/ | interior demolition Columbia MO | selective demolition, commercial strip-out, tenant improvement demo |
| /demolition/concrete-demolition/ | concrete demolition Columbia MO | slab removal, foundation removal, footing removal |
| /concrete/ | concrete contractor Columbia MO | concrete and paving, commercial concrete |
| /concrete/concrete-removal/ | concrete removal Columbia MO | concrete tear out, slab removal, concrete removal cost per square foot |
| /concrete/parking-lot-removal/ | parking lot removal Columbia MO | parking lot demolition, asphalt removal, lot tear out and replacement, commercial concrete removal |
| /concrete/driveway-replacement/ | concrete driveway replacement Columbia MO | driveway removal, cost to replace a concrete driveway, driveway tear out |
| /site-work/ | site preparation Columbia MO | backfill and grading, building pad prep, basement fill in, grade and seed |
| /consultation/ | demolition estimate Columbia MO | concrete removal quote, get a demolition bid |
| Cost posts | how much does it cost to demolish a house in Missouri | cost to remove a concrete driveway, cost to tear down a garage, mobile home removal cost, parking lot removal cost |

---

## 9. Redirect map

Extensionless targets. All 301. Old blog URLs are unchanged except the four retired posts.

| From | To |
|---|---|
| /services/demolition.html | /demolition/ |
| /services/mobile-home-removal.html | /demolition/mobile-home-removal/ |
| /services/concrete-removal.html | /concrete/concrete-removal/ |
| /services/excavation.html | /site-work/ |
| /services/foundation-excavation.html | /site-work/ |
| /services/grading-drainage.html | /site-work/ |
| /services/site-preparation.html | /site-work/ |
| /services/land-clearing.html | /site-work/ |
| /services.html | /services/ |
| /blog/brush-hogging-columbia-mo.html | /site-work/ |
| /blog/forestry-mulching-columbia-mo.html | /site-work/ |
| /blog/fence-line-clearing-mid-missouri.html | /site-work/ |
| /blog/land-clearing-cost-columbia-mo.html | /site-work/ |
| /locations/centralia-mo.html | /service-areas/#centralia |
| /locations/hallsville-mo.html | /service-areas/#hallsville |
| /locations/harrisburg-mo.html | /service-areas/#harrisburg |
| /locations/rocheport-mo.html | /service-areas/#rocheport |
| /locations/{columbia,fulton,boonville,ashland}-mo.html | /locations/{same}-mo/ |
| /instant-bid.html | /consultation/ |
| /about.html, /contact.html, /service-areas.html | /about/, /contact/, /service-areas/ |
| /blog/*.html (22 kept posts) | /blog/* (extensionless) |

---

## 10. Money page skeletons

Brand voice: direct, contractor-level, numbers-forward. Ranges are market-based estimates for Mid-Missouri, published for correction. Disposal is always pass-through.

### 10.1 /concrete/concrete-removal/

**Title:** Concrete Removal in Columbia, MO | ATLAS Demolition & Site Work
**Meta:** Slab, driveway, sidewalk and foundation removal in Columbia and Mid-Missouri. Broken out, hauled off, ground left ready. Pour-back available. Call (573) 234-6641.
**H1:** Concrete Removal in Columbia, MO

**Intro (60–80 words).** We break out and haul off concrete: slabs, driveways, sidewalks, patios, footings, retaining walls, foundations. A Cat 308 with a hydraulic breaker and a grapple does the work; the loads go to a recycler, not a landfill. If you want it poured back, we do that too. One contractor, one contract, from the first crack to the last broom finish.

**What's included**
- Saw-cutting where the removal meets concrete that stays
- Breaking, loading and hauling
- Rebar and mesh separated and hauled
- Recycling at a crushing facility, billed at actual tonnage
- Sub-grade left rough-graded and compacted, ready for pour or gravel

**What's not**
- Concrete leveling, mudjacking or patch repair. We don't do it.
- Slabs under $2,500 that don't sit near other work we're already doing

**How pricing works.** Fixed price for mobilization, equipment and crew. Disposal billed at actual loads and tonnage. Typical Mid-Missouri ranges:

| Job | Typical range |
|---|---|
| Driveway, 4-inch unreinforced, 600–800 sq ft | $2,500–$5,000 |
| Driveway or slab, 6-inch with rebar | $4–$8 per sq ft |
| Sidewalk or patio | $3–$6 per sq ft |
| Foundation walls and footings after a teardown | $4,000–$12,000 |
| Disposal | $40–$90 per ton, pass-through |

Thickness, rebar, access for the excavator and distance to the recycler move these numbers. A site visit gives you a firm number.

**Process.** Site visit → written proposal → utility locates → saw-cut and break → haul → grade → optional pour-back.

**Pour it back.** Driveway, patio, sidewalk or pad replaced by our concrete crew, quoted on the same proposal. (Link to /concrete/driveway-replacement/.)

**Photos.** Slot 1: excavator breaking slab (have). Slot 2: loaded truck (have). Slot 3: finished pour (needed).

**FAQ (FAQPage schema).**
- How much does it cost to remove a concrete driveway in Columbia?
- Do you haul it all away, and how is disposal billed?
- Do you recycle the concrete?
- Will you pour new concrete after removal?
- Can you remove concrete without damaging the slab next to it?
- How long does a driveway removal take?
- Do you handle utility locates?
- How far from Columbia do you travel?

**CTA.** Request a free consultation → /consultation/. Phone as clickable text.

### 10.2 /concrete/parking-lot-removal/

**Title:** Parking Lot Removal & Replacement in Columbia, MO | Atlas
**Meta:** Commercial parking lot demolition in Columbia and Mid-Missouri. Asphalt or concrete removed in phases, hauled off, new lot poured or paved. Call (573) 234-6641.
**H1:** Parking Lot Removal and Replacement in Columbia, MO

**Intro.** Old lots crack, heave and drain the wrong way. We take them out, asphalt or concrete, and put a new one back: base, grade, drainage, surface, striping. We phase the work so your tenants and customers keep a place to park. Owner-direct, one contract, one company standing behind the result.

**Who this is for.** Property owners and managers of retail, office, church, apartment and light-industrial lots from 5,000 to 60,000 square feet. Not spot patching.

**What's included**
- Saw-cut and phased removal of asphalt or concrete surface
- Curb, gutter, island and light-base removal as needed
- Base evaluation: reuse, re-grade or replace
- Hauling and recycling billed at actual tonnage
- Replacement: new gravel base, compaction, concrete or asphalt surface, curbs, striping, ADA compliance where required
- Drainage correction as part of the regrade

**What's not**
- Sealcoating, crack filling, patch repair
- Lots under roughly $10,000 of scope

**How pricing works.** Fixed labor and equipment for removal. Disposal pass-through. Replacement quoted per square foot on the same proposal.

| Job | Typical range |
|---|---|
| Asphalt lot removal | $1.50–$3.50 per sq ft |
| Concrete lot removal | $3–$6 per sq ft |
| New asphalt lot (base + 3-inch surface) | $4–$8 per sq ft |
| New concrete lot (base + 6-inch reinforced) | $8–$14 per sq ft |
| Example: 15,000 sq ft asphalt lot, removed and repaved | $60,000–$150,000 (tear-out $22K–$52K) |

Base condition is the swing factor. A lot with a sound base costs half what one with a failed base does.

**Process.** Walk-through → core sample if needed → phased plan drawn on the lot map → proposal → removal by phase → base work → surface → striping → close-out.

**Keeping the lot open.** Half-lot phasing, overnight work options, temporary striping.

**Photos.** Slot 1: excavator on asphalt (needed). Slot 2: loaded trucks (have). Slot 3: finished lot (needed from sub).

**FAQ.**
- How much does it cost to remove a parking lot?
- Asphalt or concrete: which should I replace with?
- Can you keep part of the lot open during the work?
- How long does a parking lot replacement take?
- Do you handle ADA and striping?
- Is my old asphalt recycled?
- Are you insured for commercial work?
- Do you work in Jefferson City, Fulton and Moberly?

**CTA.** Request a Free Consultation → /consultation/.

---

## 11. Q4 blog schedule (proposed, 24 posts)

Two per week, Monday demolition, Thursday concrete. Every post links to its money page.

| Wk | Demolition (Mon) | Concrete (Thu) |
|---|---|---|
| Sep 28 | Demolition in Columbia, MO: The Complete 2026 Guide (carried from Q3) | How Much Does Parking Lot Removal Cost in Missouri? |
| Oct 5 | Foundation Removal & Basement Fill-In After Demolition | Cost to Replace a Concrete Driveway in Columbia, MO |
| Oct 12 | Asbestos Inspections Before Demolition in Missouri | Asphalt vs. Concrete Parking Lots: Which to Choose in Mid-Missouri |
| Oct 19 | Grain Bin, Silo & Farm Building Demolition | Concrete Removal Cost Per Square Foot (refresh + expand existing post) |
| Oct 26 | How Utility Disconnects Work Before a Teardown | Signs Your Parking Lot Needs Replacement, Not Repair |
| Nov 2 | What to Expect on Demolition Day | How Concrete Removal Is Recycled in Boone County |
| Nov 9 | Mobile Home Removal Cost (refresh + expand existing post) | Removing and Replacing a Cracked Patio or Sidewalk |
| Nov 16 | Choosing a Demolition Contractor in Mid-Missouri | Phasing a Parking Lot Replacement Without Closing the Business |
| Nov 23 | Demolition Permits in Jefferson City and Cole County | Church and School Parking Lot Replacement: Planning and Budget |
| Nov 30 | Commercial Building Demolition Cost in Columbia | Concrete Driveway Replacement: What a Good Base Looks Like |
| Dec 7 | Winter Demolition in Missouri: What Changes | Retaining Wall Removal and Replacement |
| Dec 14 | Site Restoration After Demolition: Grade, Seed, Pad | Commercial Concrete Removal in Fulton and Callaway County |

---

## 12. Open items for Chris

1. Netlify primary domain → www (T1). Blocks the indexing fix.
2. Email: `hello@` or `chris@`?
3. Facebook and Instagram handles for schema.
4. The five job photos from tonight need to land on disk (AirDrop to the Mac, or drop in `~/Downloads/atlas-photos/`). Two concrete shots seen: excavator breaking a concrete wall by a treeline; excavator on a gravel lot. The Kubota mulching shot is retired scope and won't be used.
5. A rough list of completed jobs by town for the five location pages.
6. Approval of this plan, or edits.

---

## 13. Execution log (24 Sep 2026, 00:50–02:30 CDT)

| Time | What | PR / commit |
|---|---|---|
| 01:35 | Tier 0: name flip, land clearing out of nav, home card removed | #8 |
| 01:41 | Redirect loop from apex→www rule; reverted on main within ~2 min | e17a686 |
| 01:42 | New favicon set | #9 |
| 01:46 | Audit published, approved by Chris | 3b40fe9 |
| 02:00 | Tier 1: canonical host → apex (440 refs), email → chris@, sameAs, soft-404 rule removed, broken links fixed, five photos imported | in #10 |
| 02:05 | Q4 blog schedule (24 rows) written to Notion; task cron → Mon+Thu; seven skill files rescoped | — |
| 02:28 | Tier 2: full restructure live. 23 files added, 17 retired, 50 modified. 65 redirect rules, 46-URL sitemap | #10 |
| 02:29 | Hotfix: `/services/` trailing-slash rule looped; removed | 0788560 |
| 02:30 | Sitemap resubmitted to Search Console (accepted). Build tooling committed to `tools/site-build/` | 4a7b771 |

**Still open (Tier 3 and follow-ups)**
- Cost content cluster posts publish on the Q4 schedule from 28 Sep (two a week).
- 20 older blog posts still carry the 2025 title suffix and old inline CSS variable names; the CSS aliases fix the render, the titles get a refresh pass.
- Photo slots: finished concrete pours and a finished parking lot are still needed from the concrete sub.
- Location pages carry no specific job claims yet; add real jobs and photos per town as they come.
- GBP: add UTM parameters to the website link, point the booking button at /consultation/, update the profile's website URL to the apex if it says www.
- Google Ads realignment: separate session.
- Review program: ask customers to describe the work; first concrete-mention review is the milestone.
- Watch Search Console weekly through October for the URL migration; expect a dip on the land clearing terms (deliberate) and re-indexing of the new tree.
