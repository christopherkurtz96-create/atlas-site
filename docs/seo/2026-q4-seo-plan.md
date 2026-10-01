# ATLAS Demolition & Site Work — Q4 2026 SEO Plan

**Period:** 28 Sep – 31 Dec 2026
**Owner:** Chris (GBP, reviews, photos, field). Claude (site, content, technical, reporting).
**Standard:** Direction Brief (Sep 2026) as revised; audit at `docs/audit/2026-09-repositioning-audit.md`.
**Read this with:** `.claude/skills/atlas-seo/SKILL.md` (standing strategy, rewritten 24 Sep).

---

## 1. Post-migration audit (24 Sep, afternoon)

Live crawl of all 46 sitemap URLs plus redirect, host and error checks. Search Console URL inspection on the key pages.

| Check | Result |
|---|---|
| HTTP status | 46/46 return 200. Average 342 ms, average document 39 KB. |
| Canonicals | 46/46 self-referencing on the apex host. |
| H1 | Exactly one on every page. |
| JSON-LD | 137 blocks, all parse. Business, BreadcrumbList, FAQPage and Service on every service page. |
| Redirects | Every retired URL 301s to its mapped target. `.html` → clean URL works. www → apex works. http → https works. |
| 404 | Nonexistent URLs return a real 404 (the soft-404 rewrite is gone). |
| Sitemap | 46 URLs, resubmitted 07:30, accepted, 0 errors. "Indexed" count lags days. |
| Google index | Home, /demolition/, both money pages and the mobile home cost post: **"Submitted and indexed"**, crawled 24 Sep 11:49–14:32, Google canonical = apex. |
| Old URLs | `/services/demolition.html` still shows its 7 Sep crawl; will flip to the redirect target on the next crawl. `www.deployatlas.com/` now reads "Page with redirect" pointing at the apex. Correct. |
| IndexNow | Key file live; 46 URLs accepted (HTTP 202). Feeds Bing, DuckDuckGo, Yandex, and the AI search engines that use Bing's index. |
| llms.txt | Published at `/llms.txt`. |
| Titles / metas | 22 over-length titles and metas rewritten today. All titles now ≤60, all metas ≤160. |
| Images | Every image has alt text. Five new job photos ≤220 KB. |
| Core Web Vitals | Not measured today: PageSpeed API quota exhausted. In-browser: TTFB 35 ms, DOMContentLoaded 50 ms, CLS 0. Run PSI on Mon 28 Sep and record. |

**Migration verdict: clean.** Nothing outstanding from the restructure itself.

**Carry-forward items from the audit**

- Photo slots: finished concrete pours and a finished lot are still needed for the concrete pages.
- Location pages carry no job proof yet.
- 20 older posts still use the old inline CSS variable names (aliased, renders fine); a body refresh pass is on the content schedule.
- WebP + `srcset` pass on the 12 legacy images over 400 KB.

---

## 2. Baseline (Search Console, 24 Jun – 21 Sep)

| Metric | Baseline | 31 Dec target |
|---|---|---|
| Organic clicks per 90 days | ~100 | 300 |
| Non-brand impressions per 90 days | ~4,000 | 12,000 |
| "demolition contractor Columbia MO" web result | not on page 1 (service page at 29) | page 1 |
| Mobile home removal cost post | position 12, 2,088 impr | position ≤5 |
| Concrete queries, total impressions | 13 | 1,500 |
| Parking lot / driveway queries | 0 | first page-1 rankings |
| Google reviews | 11 (5.0) | 25, at least 5 mentioning concrete or a parking lot |
| GBP photos added per month | ad hoc | 10+ |
| Consultation form submissions | new form, no baseline | tracked from day one |
| Phone clicks from site | not tracked | tracked from day one |

Land clearing impressions (2,310) will fall to near zero. That is intended.

---

## 3. The three lanes

### Lane A — Local pack (Google Business Profile)

The map pack produces the calls today. Protect it, then push it into the concrete category.

**Profile fixes, week 1**

- Update the business description to the new positioning (draft in section 7).
- Services list: add Parking lot removal, Parking lot replacement, Driveway replacement, Concrete removal, Retaining wall removal, Backfill and grading, Building pad prep. Remove anything phrased as land clearing, lot clearing or landscape site prep.
- Confirm the profile website URL saved as the UTM version (pending review this morning).
- Add the /consultation/ link as the booking link's backup (done) and keep Jobber as the button.
- Set service area to the eleven named towns, not "Columbia and nearby areas."
- Add the Instagram and Facebook links in the social profiles section (already on the site).

**Weekly, Chris (30 min)**

- 2–3 photos from real jobs, phone-taken, uploaded from the GBP app. Caption with town + service ("Parking lot removal, Fulton"). Photos with visible concrete or lots are the priority for Q4.
- 1 GBP post. Formula: what the job was, scope and timeline in numbers, result, CTA "Request a free consultation." Alternate demolition and concrete.

**Reviews, every job**

- Ask at completion, in person, then text the link the same day.
- The ask: "If you'd leave a review, say what we did, like 'tore out our driveway and poured a new one.' Google reads the words."
- Reply to every review within 24 hours. Use the town and the service in the reply.
- Target: 14 new reviews by 31 Dec.

**Ask Maps.** Google retired Q&A; the AI answer layer now pulls from the profile, reviews and the site's FAQ blocks. Every service page has 7–9 FAQs with schema. Keep them accurate.

### Lane B — Organic (site and content)

**Publishing.** 24 posts, two a week, from the Notion schedule already loaded. Monday demolition, Thursday concrete. Every post links to its money page and one sibling. The two refresh rows (concrete removal cost, mobile home cost) shipped early on 24 Sep.

**Money page depth.** The parking lot and concrete removal pages are 1,300–1,400 words with FAQs. Add a "recent work" block to each as soon as a finished lot or pour photo exists. Real photos on money pages are the single biggest missing piece.

**Internal linking.** After each post publishes, run `tools/site-build/site_pass.py --no-delete` to bring it onto the shared header and link rules. Monthly: confirm every new post is linked from at least one service page (add a "Related" bullet on the hub).

**Location proof.** As jobs complete in Jefferson City, Fulton, Moberly, Fayette, add a two-sentence job note and a photo to that town's page. No claims until they're real.

**Title and meta hygiene.** Done today. Monthly crawl catches regressions.

**Competitor watch (Jefferson City).** Wreck & Roll, Grizzly Demolition, Twehous. Check the map pack for "demolition Jefferson City" monthly. The Jefferson City page and two JC-specific posts (permits, commercial lots) are the wedge.

### Lane C — AI search (ChatGPT, Perplexity, Gemini, Ask Maps, AI Overviews)

AI engines answer from three sources: entities they can verify across the web, structured facts on the site, and text that reads like an answer. Q4 work:

1. **Entity consistency.** One name string everywhere: "ATLAS Demolition & Site Work." Citation cleanup (Lane D) is what makes the entity resolvable.
2. **Structured facts.** HomeAndConstructionBusiness schema with `sameAs`, `areaServed`, `hasOfferCatalog` is live on every page. FAQPage on every service page. `llms.txt` live. Keep the pricing ranges on the pages; AI answers to "how much does X cost" quote pages that state numbers.
3. **Bing.** ChatGPT search and Copilot draw on Bing. The site is verified in Bing Webmaster (`msvalidate` tag present). **Action:** open Bing Webmaster Tools, confirm the property, submit `https://deployatlas.com/sitemap.xml`. IndexNow is already pinging.
4. **Answer-shaped content.** Each cost post opens with a direct answer sentence containing the number. Each FAQ answer stands alone. Already the house style; keep it.
5. **Third-party mentions.** AI engines weight sources they trust: the Chamber directory, local news, BBB, Yelp. Lane D feeds this.
6. **Monthly check.** Ask ChatGPT, Perplexity and Gemini "demolition contractor Columbia MO," "parking lot removal Columbia MO," "how much to remove a mobile home in Missouri." Record whether ATLAS is named and which page is cited. First check: 1 Oct (baseline). Then monthly.

### Lane D — Citations and links (the trust layer)

**Citation cleanup, October.** The old name "Atlas Excavation & Demolition" is likely still on third-party listings. Audit and correct, in this order: Google (done), Facebook page name, Instagram bio, Yelp, Bing Places, Apple Business Connect, BBB, Angi, Nextdoor, Yellow Pages, Columbia Chamber directory. Exact string, phone (573) 234-6641, website `https://deployatlas.com`.

**Links, 2–4 per month.** Columbia Chamber membership listing. Equipment and material suppliers (dealer "our customers" pages). The concrete sub's site linking to the parking lot page. Jobber's customer showcase if they have one. One local news or sponsorship mention per quarter.

---

## 4. Sprints

### October — Foundations and concrete launch
- Week 1: GBP description, services, service area. Bing Webmaster sitemap. AI baseline check. Phone-click and form conversion events verified in GA4.
- Weeks 1–4: 8 posts on schedule. Citation audit and fixes (top 6). First concrete-job photos onto the money pages.
- Week 4: October report: clicks, impressions, positions for the 12 tracked queries, reviews, form submissions, phone clicks.

### November — Proof and reach
- 8 posts on schedule, including the two JC-focused pieces.
- Location pages get their first job notes and photos.
- Remaining citations. Two backlinks.
- WebP + srcset pass on legacy images. PSI re-check.
- Month-end report.

### December — Consolidate
- 8 posts on schedule (winter demolition, restoration, regional).
- Refresh pass on the five oldest demolition posts: 2026 numbers, links to hubs, new photos.
- Reviews push before year-end.
- Quarter report against section 2 targets. Write Q1 2027 schedule into Notion.

---

## 5. Weekly operating rhythm

| Who | When | What |
|---|---|---|
| Chris | Mon + Thu afternoons | Read the SMS from the blog task; skim the post on the phone. |
| Chris | Any job completion | Review ask + text. Two photos to GBP. |
| Chris | Friday, 20 min | One GBP post. Reply to any reviews. |
| Claude | Mon + Thu | Post publishes via the task. Run site_pass. |
| Claude | 1st of month | Crawl, GSC pull, AI check, report to Chris. |

---

## 6. Tracked queries (12)

demolition contractor Columbia MO · demolition Columbia MO · house demolition Columbia MO · mobile home removal cost · mobile home demolition cost · concrete removal Columbia MO · concrete removal cost per square foot · parking lot removal Columbia MO · parking lot replacement cost · concrete driveway replacement Columbia MO · demolition Jefferson City MO · site preparation Columbia MO

---

## 7. GBP description (750 characters, paste-ready)

ATLAS Demolition & Site Work is a locally owned demolition and concrete contractor in Columbia, Missouri. We tear down houses, mobile homes, garages, barns and commercial buildings, haul the debris to a recycler, and put the site back: basements filled, lots graded, concrete and parking lots poured or paved new. Parking lot and driveway removal and replacement are welcome on their own, no teardown required. Fixed price for labor and equipment, disposal billed at actual tonnage, free on-site consultation. Licensed and insured. Serving Columbia, Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland and the rest of Mid-Missouri within about 45 minutes.

---

## 8. Done today, 24 Sep (so nothing here repeats it)

Site restructure live. NAP string unified as ATLAS. Canonicals on the apex. 22 titles and metas trimmed. Sitemap resubmitted. IndexNow enabled and pinged. llms.txt published. GBP website link (UTM) and consultation link added. Q4 Notion schedule loaded and the task runs Mon + Thu. Phone-click and form-submit events added to GA4.

---

## 10. Routines (the machine)

Three scheduled tasks in Claude Code run this plan. They run while the Claude app is open on the Mac; if it's closed at the scheduled time, they run at next launch. Each one texts Chris when it finishes.

| Routine | When | What it does | Source of truth |
|---|---|---|---|
| `atlas-weekly-blog` | Mon + Thu, 1:00 PM | Takes the next row from the Notion schedule, researches, writes a 1,500–2,000 word post, validates, publishes to the site, marks the row DONE, texts the link. | Notion "Quarterly Atlas Blog Post" table |
| `atlas-monthly-seo-review` | 1st of the month, 1:00 PM | Crawls the live site (`tools/seo/site_check.py`), pulls 28 days of Search Console vs the prior 28, checks the blog queue and tops it up with 8 rows if fewer than 6 remain, appends a "Monthly update" with 3–5 ranked suggestions and 1–3 items for Chris to this file, commits, republishes the plan page, texts a five-line summary. | This file, section 6 tracked queries |
| `atlas-quarterly-seo-plan` | 22nd of Mar, Jun, Sep, Dec, 1:00 PM | Full audit (crawl, 90-day Search Console, indexing, PageSpeed), scorecard against section 2, writes next quarter's plan file, loads 24 new rows into Notion, carries unchecked "For Chris" items forward, publishes the new plan page, texts the top three asks. | This file as template; `.claude/skills/atlas-seo/SKILL.md` |

**Blog schedule for this quarter:** 24 rows already loaded in Notion, 28 Sep → 17 Dec, Monday demolition and Thursday concrete. The routines pull from it; nobody has to hand them a topic. The monthly review keeps the queue at least six deep, and the quarterly run reloads it for the next quarter.

**One-time setup for Chris.** Open each of the two new routines in the Scheduled section of the app and click "Run now" once, while you're at the keyboard. That pre-approves the tools they use (Search Console, Notion, git). Without that first supervised run, an unattended run can stall on a permission prompt, which is exactly what took the blog task down in July.

**What the routines can't see.** Reviews, GBP photo counts and the AI-search check (asking ChatGPT, Perplexity and Gemini the tracked queries) are done by hand in a session with Claude on the 1st. Chris's part of the monthly number is the review count.

---

## 9. For Chris to do

Work down the list as time allows. Nothing here has a deadline except the weekly rhythm at the bottom. Check them off in this file or just tell Claude.

**Done**

- [x] Google Business Profile: name, description, services, website UTM link (24 Sep)
- [x] Bing Webmaster: sitemap resubmitted (24 Sep)
- [x] BBB free business profile (24 Sep)

**Quick checks**

- [ ] Submit the consultation form once from your phone and confirm where the lead lands (Jobber, sheet, email). Tell Claude the result.
- [ ] Facebook page name and Instagram bio say "ATLAS Demolition & Site Work" and link to https://deployatlas.com.

**Photos and proof (unblocks the money pages and location pages)**

- [ ] A finished concrete pour photo and a finished parking lot photo, from the concrete sub if needed. Send to Claude.
- [ ] A rough list of past jobs by town: Columbia, Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland. One line each is enough.

**Free listings to create or claim (exact name, phone, https://deployatlas.com)**

- [ ] Apple Business Connect: businessconnect.apple.com (Apple Maps and Siri)
- [ ] Bing Places: bingplaces.com (can import from the Google profile)
- [ ] Nextdoor business page
- [ ] Yelp: claim the listing, fix the name, add 5 photos. Decline the ad calls.
- [ ] LinkedIn company page
- [ ] Angi free listing only (not Angi Leads)
- [ ] Yellow Pages / yp.com listing check

**Paid, worth it**

- [ ] Columbia Chamber of Commerce membership and directory listing (best local link available)
- [ ] BBB accreditation: hold until reviews pass 25 or a commercial buyer asks for it

**Legal and admin**

- [ ] Missouri fictitious name (DBA) filing for "ATLAS Demolition & Site Work" under Prex Land Services LLC
- [ ] Certificates of insurance on file from the concrete sub before the first subbed pour is sold
- [ ] Warranty language for subcontracted work added to the proposal template

**Old name cleanup (tell Claude which accounts you're signed into in Chrome and he'll do the edits)**

- [ ] Yelp
- [ ] Facebook page
- [ ] Instagram
- [ ] Nextdoor
- [ ] Any printed material, vehicle magnets, email signature

**Skip on purpose**

- HomeAdvisor, Angi Leads, Thumbtack. They sell small jobs to five contractors at once.

**Every week, 20 minutes**

- [ ] 2–3 job photos to the Google profile, caption with town and service
- [ ] 1 Google post
- [ ] Reply to every new review
- [ ] Ask for a review at every job completion; text the link the same day; ask them to describe the work

---

## Monthly update — 2026-09-24

Run early (24 Sep, not 1 Oct). Windows: 25 Aug – 21 Sep vs 28 Jul – 24 Aug. Most of both windows predate today's restructure, so this is the pre-migration baseline, not a verdict on it.

### Numbers (28 days vs prior 28)

| Metric | Current | Prior | Change |
|---|---|---|---|
| Clicks | 27 | 26 | +4% |
| Impressions | 3,130 | 2,638 | +19% |
| Avg position | 7.3 | 10.0 | +2.7 better |
| Non-brand impressions | 1,549 | 912 | +70% |
| Demolition-cluster impressions | 403 | 182 | +121% |
| Land-clearing-cluster impressions (retired) | 962 | 530 | +82% |
| Concrete-cluster impressions | 2 | 6 | flat, near zero |

| Tracked query | Position (impr) | Prior | Delta |
|---|---|---|---|
| demolition contractor Columbia MO | not seen | not seen | — |
| demolition Columbia MO | not seen | not seen | — |
| house demolition Columbia MO | not seen | not seen | — |
| mobile home removal cost | 20.7 (10) | 16.3 (11) | −4.4 |
| mobile home demolition cost | 24.9 (11) | 26.8 (13) | +1.9 |
| concrete removal Columbia MO | not seen | not seen | — |
| concrete removal cost per square foot | not seen | not seen | — |
| parking lot removal Columbia MO | not seen | not seen | — |
| parking lot replacement cost | not seen | not seen | — |
| concrete driveway replacement Columbia MO | not seen | not seen | — |
| demolition Jefferson City MO | not seen | not seen | — |
| site preparation Columbia MO | not seen | not seen | — |

Top non-brand query: "demolition contractor" (259 impr, position 1.0, 0 clicks; 1 impression last window). Top pages: home (www) 1,400 impr at 1.9; mobile home cost post 613 at 10.7; fence line clearing post 310 at 8.5 (retired lane, up 90%); demolition permit post 186 at 7.1 and the best clicker (6); house demolition cost post 178, slipped 5.4 → 8.6.

### Site check

46 pages, 0 issues, average 318 ms. Host, https, legacy /services/ and /instant-bid redirects, 404, robots.txt and llms.txt all correct. No fixes needed.

### Blog

Shipped 0 in the tracked table (Q3 rows were replaced today by the Q4 schedule), missed 0, queue depth 24 (28 Sep → 17 Dec), rows added 0.

### Suggestions (ranked by expected impact)

1. Link the demolition permit post from /demolition/ and /demolition/structural/ (it currently has no hub link). It's the site's top-clicking page and "city of columbia building permits" sits at position 10, so a hub link is the cheapest push to page 1.
2. Refresh the house demolition cost post with 2026 numbers and a direct-answer opening. It lost 3 positions (5.4 → 8.6) while the demolition cluster doubled, so the demand is there and the page is slipping.
3. Watch "demolition contractor": 259 impressions at position 1 with zero clicks. That pattern is a map-pack or knowledge-panel impression, so the lever is GBP (photos, reviews, a weekly post), not the site.
4. Make the 1 Oct parking lot removal cost post the concrete beachhead: link it from /concrete/, /concrete/parking-lot-removal/ and the home page on publish. Concrete impressions are at 2; nothing else on the site is pulling that cluster yet.
5. Let land clearing decay. Its impressions rose 82%, but the pages now 301 to /site-work/; don't refresh or re-link them, and expect the cluster to fall toward zero by November.

### For Chris this month

- Post one GBP update with a real demo or concrete photo, town + service in the caption, "Request a free consultation" CTA (15 min).
- Ask the last two finished customers for a review and text them the link, asking them to name the work ("tore out our driveway") (10 min).
- Submit the consultation form once from your phone and tell Claude where the lead landed (5 min).

---

## 11. Q3 close-out (quarterly routine, 24 Sep, evening)

First run of `atlas-quarterly-seo-plan`. This plan was written the same day and the Q4 Notion queue (28 Sep → 17 Dec) hasn't started, so the run audited and stopped there. It did not write a new plan file or replace the Notion rows. The next full run is 22 Dec, which writes the Q1 2027 plan.

| Check | Result |
|---|---|
| Site crawl (`site_check.py`) | 46 pages, 0 issues, avg 182 ms. All redirect, host and 404 checks pass. |
| Search Console, 24 Jun – 21 Sep vs 26 Mar – 23 Jun | Clicks 98 vs 56 (+75%). Impressions 8,846 vs 7,159 (+24%). Avg position 8.9 vs 7.9. |
| Query mix | Land clearing 2,319 impr (down from 3,075, intended). Demolition 1,226 (up from 720). Concrete 14 (was 77). Brand 166. |
| Tracked queries | Only the two mobile home cost terms show data (positions 21 and 28). The other ten have no impressions yet. That matches the section 2 baseline. |
| Sitemap | 46 submitted, 0 errors, "indexed" counter still 0 (lags). |
| URL inspection | Home, /demolition/, /concrete/parking-lot-removal/, /concrete/concrete-removal/: indexed, Google canonical = apex. **/consultation/: "URL is unknown to Google"** (new page; it's in the sitemap and set to index). |
| PageSpeed | PSI quota (429) again. Still unmeasured; run by hand on 28 Sep. |

**Carry into October:** request indexing for /consultation/ in Search Console if it's still unknown on 1 Oct. The mobile home cost cluster (≈250 impressions across 10 variants, positions 20–30) is the biggest near-term win, and the 9 Nov refresh row covers it. Consider pulling that refresh forward.

---

## Monthly update — 2026-10-01

Windows: 1–28 Sep vs 4–31 Aug. Only the last four days (25–28 Sep) are post-restructure, so this is still mostly a pre-migration read. November's update is the first clean one.

### Numbers (28 days vs prior 28)

| Metric | Current | Prior | Change |
|---|---|---|---|
| Clicks | 27 | 30 | −10% |
| Impressions | 3,473 | 2,609 | +33% |
| Avg position | 7.4 | 10.2 | +2.8 better |
| Non-brand impressions (visible queries) | 1,645 | 938 | +75% |
| Demolition-cluster impressions (incl. mobile home) | 585 | 288 | +103% |
| Mobile home impressions | 155 | 174 | −11% |
| Permit impressions | 42 | 27 | +56% |
| Concrete-cluster impressions | 18 | 6 | +200%, still tiny |
| Land-clearing-cluster impressions (retired) | 932 | 593 | +57% |

**Read the +33% with care.** Two days carry it: 7 Sep (779 impressions at position 1.7) and 21 Sep (331 at 3.4). Both are profile-style bursts on the www home URL: "demolition contractor" (260) and four land clearing queries (~177 each), all at position 1 with zero clicks. Strip those two days and the month runs 91 impressions a day against 93 prior. Flat. The demolition cluster is +13% without the burst, not +103%.

**The real signal is 25–28 Sep.** The four days after the restructure average 159 impressions a day, against roughly 80 before it. Clean URLs are already showing for nine blog posts, /demolition/ and three location pages. 28 Sep had 4 clicks, the best day of the window.

| Tracked query | Position (impr) | Prior | Delta |
|---|---|---|---|
| demolition contractor Columbia MO | not seen | not seen | — |
| demolition Columbia MO | not seen | not seen | — |
| house demolition Columbia MO | not seen | not seen | — |
| mobile home removal cost | 18.3 (11) | 16.0 (12) | −2.3 |
| mobile home demolition cost | 20.4 (12) | 26.4 (14) | +6.0 |
| concrete removal Columbia MO | not seen | not seen | — |
| concrete removal cost per square foot | not seen | not seen | — |
| parking lot removal Columbia MO | not seen | not seen | — |
| parking lot replacement cost | not seen | not seen | — |
| concrete driveway replacement Columbia MO | not seen | not seen | — |
| demolition Jefferson City MO | not seen | not seen | — |
| site preparation Columbia MO | not seen | not seen | — |

**Top 15 non-brand queries by impressions**

| Query | Impr | Position | Prior impr |
|---|---|---|---|
| demolition contractor | 260 | 1.2 | — |
| land clearing columbia | 178 | 1.0 | 25 |
| land clearing service | 178 | 1.0 | 25 |
| land clearing near me | 177 | 1.0 | 24 |
| land clearing rocheport | 176 | 1.0 | 15 |
| fence row clearing | 36 | 19.7 | 2 |
| land clearing | 36 | 2.4 | 384 |
| demolition estimate near me | 32 | 66.8 | 9 |
| columbia land clearing | 28 | 2.0 | 41 |
| fence line clearing | 23 | 20.7 | 2 |
| fence line clearing cost | 23 | 7.9 | 4 |
| city of columbia building permits | 17 | 10.5 | 6 |
| mobile home demolition and removal cost | 14 | 29.9 | 9 |
| cost to remove mobile home | 13 | 20.0 | 13 |
| mobile home demolition cost | 12 | 20.4 | 14 |

No non-brand query earned a visible click. The only query-level click was "atlas demolition." The other 26 clicks came from queries Google doesn't report.

**Top 10 pages by impressions**

| Page | Impr | Clicks | Position | Prior impr |
|---|---|---|---|---|
| www home | 1,299 | 4 | 1.9 | 851 |
| /blog/mobile-home-removal-cost-mid-missouri.html | 549 | 1 | 9.5 | 713 |
| /blog/fence-line-clearing-mid-missouri.html (retired, 301'd) | 343 | 3 | 8.8 | 149 |
| /blog/demolition-permit-columbia-mo.html | 240 | 5 | 7.9 | 217 |
| apex home | 218 | 5 | 10.9 | 253 |
| /blog/house-demolition-cost-columbia-mo.html | 209 | 1 | 7.9 | 177 |
| /services/demolition.html (301'd to /demolition/) | 105 | 0 | 27.1 | 145 |
| /locations/fulton-mo.html | 80 | 0 | 11.1 | 128 |
| /blog/house-demolition-cost-columbia-mo (clean URL) | 66 | 1 | 10.6 | new |
| /blog/mobile-home-removal-cost-mid-missouri (clean URL) | 56 | 0 | 8.9 | new |

Movers over 30%: house demolition cost post, both URLs combined, 275 impressions vs 183 (+50%) but position slipped 6.4 → 7.9. Fulton page position 27.2 → 11.1 on fewer impressions. Mobile home cost post, both URLs, 605 vs 715 (−15%) and clicks 5 → 1. Fence line clearing post +130%, a retired lane that now redirects. The head term "land clearing" fell 384 → 36.

### Site check

47 pages, 0 issues, average 346 ms. Host, https, legacy /services/ and /instant-bid redirects, 404, robots.txt and llms.txt all correct. No fixes needed. URL inspection: /consultation/ is now "Submitted and indexed" (crawled 25 Sep), which closes the Q3 carry item. The 28 Sep Columbia guide was indexed 29 Sep. /demolition/ and /concrete/parking-lot-removal/ are indexed with the apex canonical.

### Blog

Shipped 1 in the Q4 table (28 Sep, Columbia demolition guide; the 7 Sep lot grading post shipped from the old Q3 table). Missed 0. Queue depth 23: 22 future rows through 17 Dec plus today's parking lot removal cost row, which the 1 PM blog task picks up. Rows added 0.

### Suggestions (ranked by expected impact)

1. Put "contractor" in the /demolition/ hub title: "Demolition Contractor Columbia MO | ATLAS" in place of "Demolition Services Columbia MO | Atlas." The head tracked term has no impressions, the hub has 9 at position 15.8, and the title doesn't carry the word the query uses.
2. Link the house demolition cost post from the /demolition/ hub and open it with a one-sentence answer that states the range. It's the third-largest post (275 impressions), it's slipping (6.4 → 7.9), and the hub links the general cost post but not this one.
3. Confirm the Google profile has no land clearing service or category left. Four land clearing queries put 700+ impressions on the profile at position 1 this month, and that's a retired service drawing the wrong calls.
4. Add the first job note and photo to the Fulton page. It moved from position 27 to 11 with no job proof on it, and "atlas fulton mo" already shows 21 impressions at 4.9, so it's the closest location page to page 1.
5. Aim the 9 Nov mobile home cost refresh at the variants: "cost to remove a mobile home," "mobile home demolition cost," "trailer removal cost," with a single-wide and double-wide price table near the top. About ten variants sit at positions 18–30 and the post lost 15% of its impressions and most of its clicks this window.

Not done in this run: the AI-search check and the review count (both need a session with Chris), and PageSpeed (still unmeasured since the PSI quota errors).

### For Chris this month

- Open the Google Business Profile app, Edit services, and confirm nothing says land clearing, lot clearing or mulching. Remove anything that does (5 min).
- Text the review link to the last two finished customers and ask them to name the work, like "tore out our driveway" (10 min).
- Send Claude one Fulton job: one line on what it was and one photo (5 min).

Still open from September: submit the consultation form once from your phone and say where the lead landed.
