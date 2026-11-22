#!/usr/bin/env python3
"""Build /blog/ (blog/index.html): the index of every post, grouped by topic.
Reads each blog/*.html for its H1 and meta description, so it never drifts from the posts.
Run from the repo root after adding or retitling a post:
    python3 tools/site-build/build_blog_index.py
"""
import glob, html, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import template as T

GROUPS = [
    ("Concrete and paving", "concrete", re.compile(r"concrete|parking-lot|driveway|patio|asphalt")),
    ("Permits, process and planning", "planning", re.compile(r"asbestos|permit|utility|insurance|debris|how-long|what-to-expect|hire-|demolish-or-renovate|grading")),
    ("Demolition costs and job types", "demolition", re.compile(r".")),
]
ORDER = ["demolition", "planning", "concrete"]

def first(pat, text):
    m = re.search(pat, text, re.S)
    return html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else ""

posts = {key: [] for _, key, _ in GROUPS}
for f in sorted(glob.glob("blog/*.html")):
    if f.endswith("index.html"):
        continue
    t = open(f).read()
    slug = os.path.basename(f)[:-5]
    h1 = first(r"<h1[^>]*>(.*?)</h1>", t)
    desc = first(r'<meta name="description" content="([^"]*)"', t)
    key = next(k for _, k, rx in GROUPS if rx.search(slug))
    posts[key].append((h1, slug, desc))

names = {k: n for n, k, _ in GROUPS}
parts = ["<p>Straight answers on what demolition, concrete removal and replacement cost around Columbia, MO, what permits and inspections come first, and how the work goes. Written from our own jobs across Mid-Missouri.</p>"]
for key in ORDER:
    parts.append(f'<h2 id="{key}">{names[key]}</h2>\n<ul>')
    for h1, slug, desc in sorted(posts[key]):
        parts.append(f'<li><a href="/blog/{slug}">{html.escape(h1)}</a><br>{html.escape(desc)}</li>')
    parts.append("</ul>")

total = sum(len(v) for v in posts.values())
out = T.page(
    path="/blog/",
    title="Demolition & Concrete Guides | Columbia, MO | ATLAS",
    meta="Cost guides, permit rules and job walkthroughs for demolition, concrete removal and parking lot work in Columbia, MO and Mid-Missouri, from the crew that does it.",
    h1="Demolition and Concrete Guides for Mid-Missouri",
    subtitle="What it costs, what comes first, and how the job goes.",
    crumbs=[("/", "Home"), ("/blog/", "Blog")],
    body="\n".join(parts),
)
open("blog/index.html", "w").write(out)
print(f"blog/index.html: {total} posts", {k: len(v) for k, v in posts.items()})
