---
name: atlas-blog-pipeline
description: "End-to-end Atlas blog post creation pipeline. Takes a topic and target audience, then automatically runs keyword research, writes the full blog post, optimizes it for local SEO, and pushes it live to the website. Triggers on: blog post, write a post, this week's blog, new blog post, create blog post, publish blog post, blog pipeline, weekly blog. Any time the user provides a blog topic for Atlas, run this skill."
---

# Atlas Blog Pipeline

## Purpose

This is an end-to-end blog post creation pipeline for Atlas Excavation & Demolition. When the user provides a blog topic and target audience, this skill automatically executes four phases in sequence without stopping for approval between steps.

## Required Input

The user provides:
- **Topic**: The blog post subject (e.g., "Interior Demolition for Contractors in Mid-Missouri")
- **Primary keyword**: Target keyword phrase (e.g., "interior demolition Mid-Missouri")
- **Word count range**: Target length (e.g., 900-1100)
- **Target audience**: Who this post is for (e.g., "Subcontractor Inquiry" / "Homeowner" / "GC" / "Property Manager")

If the user doesn't provide all four, infer what you can from context and ask only for what's missing.

## Execution Pipeline

Run these four phases in order. Do NOT stop between phases to ask for approval. Execute the full pipeline automatically.

---

### PHASE 1: Keyword Research

**Load and follow**: `atlas-keyword-researcher` skill

Using WebSearch, research the topic following the keyword researcher skill's full process:

1. Research 5-7 keyword variations with local modifiers (Columbia MO, Mid-Missouri, Boone County, Missouri)
2. Analyze SERP results for local pack triggers, competition level, and content gaps
3. Select primary keyword based on local intent, achievability, and business relevance
4. Identify 5-7 secondary keywords including location variants and question formats
5. Classify search intent (Local Transactional / Local Informational / Commercial Investigation / Problem-Aware)
6. Note competitor gaps from local excavation/demolition market
7. Plan internal linking strategy to existing service and location pages

**Output**: Store keyword research findings internally. Do not output a separate report. Move directly to Phase 2.

---

### PHASE 2: Write the Blog Post

**Load and follow**: `atlas-seo` skill for content strategy guidelines

Write the full blog post as an HTML file matching the exact template used by existing Atlas blog posts. Reference any existing post in `/blog/` for the HTML structure including:

- Full `<head>` with meta tags, OG tags, Twitter cards, canonical URL
- Article schema, Breadcrumb schema, FAQ schema (JSON-LD)
- Blog-specific CSS styles (`.blog-content`, `.cost-table`, `.highlight-box`, `.info-box`, `.blog-cta`)
- Standard header with nav, mobile nav, and header CTA
- Page header with breadcrumb, H1, and subtitle
- Blog content section with:
  - Blog meta (date + read time)
  - Featured image with descriptive alt text including location
  - Table of contents box
  - Body content with H2/H3 sections
  - Highlight box CTA mid-content
  - Blog CTA box before FAQ
  - FAQ section (3-4 questions)
  - Final CTA with contact info
- CTA section
- Standard footer
- Google Analytics tag (G-11MK2WQ0NC)

**Content requirements from keyword research**:
- Primary keyword in: title, H1, meta description, first 100 words, at least one H2, conclusion
- Columbia mentioned 5-8 times naturally
- Missouri/Mid-Missouri mentioned 3-5 times
- Boone County mentioned 1-2 times
- Phone number (573) 234-6641 appears 2-3 times with tel: links
- 5-7 internal links to service pages and location pages
- 1-2 external links to authoritative sources (Missouri DNR, EPA, city government, etc.)
- FAQ schema with 3-4 questions

**File naming**: `/blog/[keyword-slugified].html`

**Atlas business context**:
- Business name: Atlas Excavation & Demolition
- Location: Columbia, MO
- Phone: (573) 234-6641
- Email: hello@deployatlas.com
- Website: deployatlas.com
- Service radius: 45-50 miles from Columbia

**Service pages** (for internal linking):
- `/services/excavation.html`
- `/services/demolition.html`
- `/services/site-preparation.html`
- `/services/land-clearing.html`
- `/services/grading-drainage.html`
- `/services/foundation-excavation.html`
- `/services/concrete-removal.html`
- `/services/mobile-home-removal.html`

**Location pages** (for internal linking):
- `/locations/columbia-mo.html`
- `/locations/ashland-mo.html`
- `/locations/fulton-mo.html`
- `/locations/boonville-mo.html`
- `/locations/centralia-mo.html`
- `/locations/hallsville-mo.html`
- `/locations/harrisburg-mo.html`
- `/locations/rocheport-mo.html`

**Brand voice**: Competent and direct. Field-grounded. Straight answer without padding. Like a crew foreman explaining something to a project manager. No hype, no fluff, no corporate speak.

**Output**: Save the HTML file to `/blog/`. Move directly to Phase 3.

---

### PHASE 3: Post Optimization

**Load and follow**: `atlas-seo-post-optimizer` skill

Run the full optimization checklist against the post you just wrote:

1. **Keyword density check**: Primary keyword 0.5-2.5%. If outside range, fix it.
2. **Location mentions**: Columbia 5-8x, Missouri 3-5x, Mid-Missouri/Boone County 1-2x. If short, add natural mentions.
3. **Phone number**: (573) 234-6641 appears 2-3x with tel: links. Fix if missing.
4. **Internal links**: 5-7 total to service and location pages. Add if short.
5. **External links**: 1-2 to authoritative sources. Add if missing.
6. **Heading hierarchy**: One H1, H2s every 250-350 words, no skipped levels. Fix if needed.
7. **Meta title**: 50-60 chars with keyword and location. Fix if needed.
8. **Meta description**: 150-160 chars with keyword, location, and CTA. Fix if needed.
9. **URL slug**: Includes keyword and location, hyphenated, lowercase. Fix if needed.
10. **Image alt text**: Descriptive with location keyword. Fix if needed.
11. **NAP consistency**: Business name, phone, location match GBP exactly.
12. **FAQ schema**: 3-4 questions present in both HTML and JSON-LD.

**Apply all fixes directly to the file.** Do not output a report. Fix issues in place and move to Phase 4.

---

### PHASE 4: Image, Sitemap, and Deploy

1. **Find an image**: Check `/Volumes/T9_External/ATLAS Media/` for a relevant photo. Look in subfolders that match the topic. If the T9 drive is not mounted or no relevant image exists, use the best match from the existing `/images/` folder and note that a real photo should be swapped in later.

2. **Copy/optimize image**: Copy the selected image to `/images/[slug].jpg` in the Atlas site folder.

3. **Update sitemap**: Add the new blog post URL to `sitemap.xml` with today's date.

4. **Git commit and push**:
   - Stage the new blog post HTML, image, and sitemap
   - Commit with a clear message describing the new post
   - Push to `origin main`
   - Netlify auto-deploys from the push

5. **Report to user**: After push, provide a brief summary:
   - Post title and URL
   - Primary keyword targeted
   - Word count
   - Key SEO stats (keyword density, location mentions, internal links)
   - Image used (and whether it needs replacement)
   - Confirm deployment status

---

## Important Rules

- **Do NOT stop between phases.** Run the full pipeline from keyword research through deployment in one continuous flow.
- **Do NOT output intermediate reports.** The keyword research and optimization phases should work silently. Only report the final summary after deployment.
- **Do NOT ask for permission to push.** The user has explicitly authorized automatic deployment for this workflow.
- **Match the exact HTML template** of existing blog posts. Read one from `/blog/` if needed to verify structure.
- **Use real Atlas jobsite photos** from the T9 drive when available. The generic stock-looking images are a last resort.
- **Today's date** goes in the article published date, OG tags, and blog meta display.

## Example Usage

User: "Here's this week's blog post: Interior Demolition for Contractors in Mid-Missouri, keyword: interior demolition Mid-Missouri, 900-1100 words, target: Subcontractor Inquiry"

Agent: *Runs keyword research silently* → *Writes full HTML blog post* → *Optimizes SEO in place* → *Finds image from T9* → *Updates sitemap* → *Commits and pushes* → Reports summary to user.
