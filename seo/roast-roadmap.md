# SEO Roast Roadmap: deployatlas.com (2026-11-21)

Verdict: Nothing is blocking the crawlers. The leaks were a dead /blog link behind every post, an estimate page that reads as blank to AI crawlers, and three town pages almost nothing linked to.

Checked and passing: robots.txt (default-allow), sitemap.xml (61 URLs, every one maps to a file with a matching canonical), real 404s, www/http/.html redirects, one H1 per page, unique titles all 60 characters or under, GPTBot / OAI-SearchBot / PerplexityBot / ClaudeBot / Bingbot all get 200, llms.txt present and consistent with the pages, no orphan money pages.

Not checked (no data access in this run): Search Console positions, backlinks and referring domains, Google Business Profile, reviews, citations.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | REVENUE | /blog returns 404. All 36 posts name it in breadcrumb schema and 6 link to it visibly. | Every post points Google and readers at a dead page. | Stopgap 301 in PR #16, replaced by a real /blog/ index (row 7). | agent | shipped |
| 2 | REVENUE | /estimate is an empty shell without JavaScript: no H1, no text. | The one lead form says nothing to AI crawlers, which don't run JS. | Fallback block with H1, pricing model, phone and service links. Not shown to normal visitors. | agent | shipped (PR #16) |
| 3 | REVENUE | Fayette and Moberly pages had 2 body links each, Jefferson City 7. | Town pages can't rank for "[service] [town]" with nothing pointing at them. | Linked existing town mentions in 16 posts. Now 9, 10 and 14. | agent | shipped (PR #16) |
| 4 | REVENUE | Foundation-removal and pool-removal posts had 1 inbound link each. | Cost posts that can't be found don't rank. | Now 5 and 2. | agent | shipped (PR #16) |
| 5 | REVENUE | /demolition/ title and H1 are "Mid-Missouri's Only Demolition Specialist". The query word "contractor" and the city are not in the H1, and the Q4 plan called for "Demolition Contractor Columbia MO". | The hub was at position 15.8 for its head term in September. | Left alone: the line was set on purpose (commit 38b3647). Option that keeps it: title "Demolition Contractor Columbia MO \| Only Demo Specialist" (56 chars), H1 unchanged. | Chris | decision |
| 6 | REVENUE | tools/site-build/pages/demolition-hub.json still holds the old title and H1. | The next rebuild from the spec silently reverts the hub headline. | Update the JSON to match whatever #5 lands on. | agent | after #5 |
| 7 | REVENUE | No real /blog/ index page. | 36 posts have no hub to pass links through; the redirect in #1 is a patch. | Built /blog/ from template.py (36 posts, 3 groups), breadcrumbs on every post point to it, footer link sitewide, redirect dropped. Rebuild with tools/site-build/build_blog_index.py. | agent | shipped |
| 8 | REVENUE | /services is linked only from the HTML sitemap and the 404 page. No nav, footer or body links. | An orphan page splitting relevance with the two hubs. | Link it from the footer or 301 it to the home page. | Chris | decision |
| 9 | COMPOUNDING | Location pages carry no job proof (already in the Q4 plan). | Town pages stay thin next to competitors with photos. | Two-sentence job note and photo per town as jobs finish. Fulton first. | Chris | open |
| 10 | COMPOUNDING | Backlinks, GBP, reviews and citations were not measured here. | For a service-area business this is the larger lever. | Run the quarterly local SEO pass with Search Console and GBP data. | Chris | open |

## Fluff (ignore until rows above ship)
- Meta descriptions over 160 characters on /demolition/ (180), /demolition/asbestos-abatement/ (175), /concrete/concrete-removal/ (167).
- /terms meta description is 98 characters.
