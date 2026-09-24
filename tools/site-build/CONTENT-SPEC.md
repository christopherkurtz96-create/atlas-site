# Atlas page content spec (for page-writing agents)

You are writing ONE OR MORE service pages for Atlas Demolition & Site Work, Columbia, Missouri. Output for each page is a JSON file at the path given in your task, with these keys (all strings unless noted):

- path: canonical path, e.g. "/demolition/structural/"
- title: ≤60 chars, ends "| Atlas" or "| Atlas Demolition & Site Work" only if it fits. Primary keyword first.
- meta: 140–158 chars, includes primary keyword + "Columbia" or "Mid-Missouri" + phone (573) 234-6641 if it fits.
- keywords: comma list, 6–10 terms.
- h1: primary keyword in natural language.
- subtitle: one sentence under the H1, ≤140 chars.
- crumbs: list of [href, label] pairs from ["/","Home"] to the page itself.
- body: HTML string. Inner content of the article column ONLY. No <html>/<head>/header/footer/nav. No FAQ section (FAQs go in `faqs`). Allowed: <h2>, <h3>, <p>, <ul>/<li>, <table>, <img>, <a>, <strong>, <div class="callout"> for a highlighted box. 1,100–1,600 words for service pages, 800–1,100 for hub pages. Use <a href="/..."> root-absolute extensionless links.
- faqs: list of [question, answerHTML] pairs, 6–9 items, answers 60–120 words each, plain <p>-free HTML (inline tags only).
- service: {"name": "...", "type": "..."}
- og_image: path of the page's lead photo.
- cta_h2, cta_p: optional overrides for the bottom CTA.

## Non-negotiables
- Business name: Atlas Demolition & Site Work. Owner-operator: Chris Kurtz sells, bids and runs the work himself. Say "we" not "Atlas" repeatedly.
- Phone (573) 234-6641 appears as clickable text once in the body: <a href="tel:5732346641">(573) 234-6641</a>.
- "Licensed and insured" is allowed (general liability, umbrella, workers' comp). No other credential/certification claims.
- Voice: direct, contractor-level, numbers-forward. Like a crew foreman explaining the job to a project manager. No hype adjectives, no "industry-leading", no "we pride ourselves", no exclamation marks. Short paragraphs. Lead with specifics: tonnage, days, square footage, thickness.
- Never mention land clearing, forestry mulching, brush hogging, tree service, stump grinding, concrete leveling, mudjacking, foundation repair, septic, trenching as services. (You may say "we don't do concrete leveling or patch repair" on concrete pages.)
- Equipment you can name: 2019 Cat 308 excavator (hydraulic breaker, grapple, thumb), skid steers, 13–15 ton excavators rented for heavy work. Concrete pours are done by our concrete crew (subcontracted, under our contract and warranty). Asphalt replacement is offered.
- Pricing model on every service page: fixed price for mobilization, equipment and crew; disposal billed as pass-through at actual loads and tonnage ($40–$90 per ton in Mid-Missouri). Publish the rough ranges given in your task as "typical ranges", always say a site visit gives a firm number.
- Required sections on every service page, in this order: intro (60–90 words, what we do and the "tear it out, haul it off, put it back" idea where it fits) → What's included → What's not included → How pricing works (with a small table of typical ranges) → Process (site visit → written proposal → disconnects/permits → execution → site left graded) → a photo → "Related" links (2–4 links to sibling pages and relevant blog posts) → done. Then faqs separately.
- Every page links to /instant-bid/ once in the body ("get a written bid").
- Service area phrasing: "Columbia, Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland and the rest of Mid-Missouri within about 45 minutes of Columbia."
- Permits: City of Columbia Building and Site Development issues demolition permits inside city limits; Boone County Resource Management outside. Missouri DNR requires an asbestos inspection before demolition of most structures (NESHAP; 10-working-day notification for regulated jobs). Utility disconnects (electric, gas, water/sewer cap) are coordinated before a teardown. We coordinate abatement and disconnects; we don't perform abatement.
- Available photos (root-absolute paths, use with descriptive alt text):
  /images/house-demolition-teardown-excavator.jpg — Cat 308 tearing the roof off a house in Columbia
  /images/concrete-wall-removal-excavator.jpg — excavator breaking out a concrete retaining wall (portrait)
  /images/concrete-lot-prep-excavator.jpg — excavator on a graded gravel lot with crew (portrait)
  /images/site-work-grading-excavator.jpg — excavator rough-grading a cleared hillside
  /images/demolition-service.jpg, /images/mobile-home.jpg, /images/interior-demolition.jpg, /images/concrete-removal.jpg, /images/commercial-demo.jpg, /images/house-demolition.jpg, /images/foundation.jpg, /images/excavation-service.jpg (older real photos already on the site)
  Use <img src="..." alt="..." loading="lazy" style="border-radius:12px;margin:24px 0;width:100%">.
- Existing blog posts you may link (root-absolute, extensionless): /blog/house-demolition-cost-columbia-mo, /blog/demolition-cost-columbia-missouri, /blog/demolition-permit-columbia-mo, /blog/demolition-debris-disposal-columbia-mo, /blog/how-long-does-demolition-take-columbia-mo, /blog/does-insurance-cover-demolition-columbia-mo, /blog/garage-demolition-cost-columbia-mo, /blog/barn-demolition-mid-missouri, /blog/shed-deck-removal-columbia-mo, /blog/pool-removal-columbia-mo, /blog/partial-demolition-columbia-mo, /blog/fire-damage-demolition-columbia-mo, /blog/demolish-or-renovate-house-columbia-mo, /blog/hire-demolition-contractor-columbia-mo, /blog/commercial-demolition-contractor-columbia-mo, /blog/commercial-strip-out-demolition-columbia-mo, /blog/interior-demolition-mid-missouri, /blog/mobile-home-removal-cost-mid-missouri, /blog/mobile-home-removal-boone-county-mo, /blog/concrete-removal-columbia-mo, /blog/concrete-removal-cost-columbia-mo, /blog/lot-grading-after-demolition-columbia-mo.
- Site pages: /demolition/, /demolition/structural/, /demolition/mobile-home-removal/, /demolition/interior-selective/, /concrete/, /concrete/concrete-removal/, /concrete/parking-lot-removal/, /concrete/driveway-replacement/, /site-work/, /instant-bid/, /service-areas, /about, /contact.
- JSON must be valid. Escape quotes inside HTML strings. Do not include comments.
