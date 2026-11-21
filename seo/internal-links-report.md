# Internal links report
Run: 2026-11-21 | Posts edited: 19 | Links added: 27

Counts are contextual body links. Header, nav, footer and the action bar are excluded.
Rebuild with `node scripts/internal-link-graph.mjs > seo/internal-link-graph.json`.

| Target | Before | After |
| --- | --- | --- |
| /locations/fayette-mo | 2 | 9 |
| /locations/moberly-mo | 2 | 10 |
| /locations/jefferson-city-mo | 7 | 14 |
| /blog/foundation-removal-columbia-mo | 1 | 5 |
| /blog/pool-removal-columbia-mo | 1 | 2 |

Orphan money pages (fewer than 3 body links): none before, none after.

Remaining:
- /blog has no page. 6 posts link to it; netlify.toml now 301s it to /sitemap.
- /services is linked only from the HTML sitemap and the 404 page.
- /about has 1 body link.
- Pool removal has only 2. No other post discusses pools, so it needs a mention in a future post.

Town anchors are the town name inside an existing service-area sentence, matching how the other towns were already linked.
