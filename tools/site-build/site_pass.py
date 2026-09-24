"""Site-wide pass: retire old files, swap header/footer, rewrite internal links, redirects, sitemap.
Usage: python3 site_pass.py [--skip file1,file2] [--no-delete]"""
import os, re, sys, json, datetime
sys.path.insert(0, os.path.dirname(__file__))
import template as T

REPO = "/Users/chriskurtz/code/atlas/site"
os.chdir(REPO)
args = sys.argv[1:]
skip = set()
if "--skip" in args: skip = set(args[args.index("--skip")+1].split(","))
do_delete = "--no-delete" not in args

RETIRE = {  # old path -> new path (301)
    "/services/demolition.html": "/demolition/",
    "/services/mobile-home-removal.html": "/demolition/mobile-home-removal/",
    "/services/concrete-removal.html": "/concrete/concrete-removal/",
    "/services/excavation.html": "/site-work/",
    "/services/foundation-excavation.html": "/site-work/",
    "/services/grading-drainage.html": "/site-work/",
    "/services/site-preparation.html": "/site-work/",
    "/services/land-clearing.html": "/site-work/",
        "/instant-bid.html": "/consultation/",
    "/instant-bid": "/consultation/",
    "/instant-bid/": "/consultation/",
    "/blog/brush-hogging-columbia-mo.html": "/site-work/",
    "/blog/forestry-mulching-columbia-mo.html": "/site-work/",
    "/blog/fence-line-clearing-mid-missouri.html": "/site-work/",
    "/blog/land-clearing-cost-columbia-mo.html": "/site-work/",
    "/blog/brush-hogging-columbia-mo": "/site-work/",
    "/blog/forestry-mulching-columbia-mo": "/site-work/",
    "/blog/fence-line-clearing-mid-missouri": "/site-work/",
    "/blog/land-clearing-cost-columbia-mo": "/site-work/",
    "/locations/centralia-mo.html": "/service-areas#centralia",
    "/locations/hallsville-mo.html": "/service-areas#hallsville",
    "/locations/harrisburg-mo.html": "/service-areas#harrisburg",
    "/locations/rocheport-mo.html": "/service-areas#rocheport",
    "/locations/centralia-mo": "/service-areas#centralia",
    "/locations/hallsville-mo": "/service-areas#hallsville",
    "/locations/harrisburg-mo": "/service-areas#harrisburg",
    "/locations/rocheport-mo": "/service-areas#rocheport",
}
DELETE_FILES = ["services/demolition.html","services/mobile-home-removal.html","services/concrete-removal.html","services/excavation.html",
    "services/foundation-excavation.html","services/grading-drainage.html","services/site-preparation.html","services/land-clearing.html",
    "instant-bid.html","blog/brush-hogging-columbia-mo.html","blog/forestry-mulching-columbia-mo.html","blog/fence-line-clearing-mid-missouri.html",
    "blog/land-clearing-cost-columbia-mo.html","locations/centralia-mo.html","locations/hallsville-mo.html","locations/harrisburg-mo.html","locations/rocheport-mo.html"]

if do_delete:
    for f in DELETE_FILES:
        if os.path.exists(f): os.remove(f); print("deleted", f)
    if os.path.isdir("services") and not os.listdir("services"): os.rmdir("services")

def all_pages():
    out=[]
    for root,ds,fs in os.walk("."):
        if root.startswith(("./.git","./.claude","./docs","./node_modules")): ds[:]=[]; continue
        for f in fs:
            if f.endswith(".html"): out.append(os.path.normpath(os.path.join(root,f)))
    return sorted(out)

def canon_for(file):
    """repo file -> canonical path"""
    if file.endswith("/index.html"): return "/"+file[:-len("index.html")]
    if file=="index.html": return "/"
    return "/"+file[:-5]

def rewrite_href(h, page_dir):
    """Rewrite one href to root-absolute extensionless, applying retirements."""
    orig=h
    if h.startswith(("http","mailto:","tel:","#","sms:","data:")):
        if h.startswith("https://deployatlas.com/"): h=h[len("https://deployatlas.com"):]
        else: return orig
    frag="";
    if "#" in h: h,frag=h.split("#",1); frag="#"+frag
    if not h: return orig
    if not h.startswith("/"): h="/"+os.path.normpath(os.path.join(page_dir,h)).lstrip("./")
    h=h.replace("//","/")
    if h in RETIRE: return RETIRE[h]+(frag if "#" not in RETIRE[h] else "")
    if h.endswith("/index.html"): h=h[:-len("index.html")]
    elif h.endswith(".html"):
        h=h[:-5]
        if h=="/index": h="/"
        if h in RETIRE: return RETIRE[h]
    # hub pages live in directories
    if h in ("/demolition","/concrete","/site-work","/consultation"): h+="/"
    if h.startswith(("/demolition/","/concrete/")) and not h.endswith("/") and h.count("/")==2: h+="/"
    return h+frag

HDR_RE = re.compile(r'    <header class="header" id="header">.*?</header>\n(?:\s*<!-- Mobile Navigation -->\n)?\s*<nav class="mobile-nav" id="mobile-nav">.*?</nav>\n', re.S)
FTR_RE = re.compile(r'    <footer class="footer">.*?</footer>\n', re.S)

changed=0
for f in all_pages():
    if f in skip: continue
    t=open(f,errors="surrogateescape").read(); o=t
    page_dir=os.path.dirname(f)
    # header/footer swap only on pages not built by template (template pages already carry root-absolute nav)
    if 'class="nav-menu"' in t and 'href="/demolition/" class="nav-link"' not in t:
        t=HDR_RE.sub(T.header(), t, count=1)
        t=FTR_RE.sub(T.footer(), t, count=1)
    # assets to root-absolute
    t=re.sub(r'(href|src)="(?:\.\./)*(css|js|images)/', r'\1="/\2/', t)
    t=t.replace('href="/privacy-policy"','href="/privacy"')
    # internal links
    def _a(m):
        return f'{m.group(1)}="{rewrite_href(m.group(2), page_dir)}"'
    t=re.sub(r'\b(href)="([^"]+)"', _a, t)
    # canonical / og:url / schema urls for this page
    can="https://deployatlas.com"+canon_for(f)
    t=re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{can}">', t)
    t=re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{can}">', t)
    t=re.sub(r'"(url|@id|mainEntityOfPage)": "https://deployatlas\.com/([^"#]*?)\.html(#[^"]*)?"', lambda m: f'"{m.group(1)}": "https://deployatlas.com/{m.group(2)}{m.group(3) or ""}"', t)
    t=re.sub(r'"item": "https://deployatlas\.com/([^"]*?)\.html"', r'"item": "https://deployatlas.com/\1"', t)
    t=t.replace('"item": "https://deployatlas.com/index"','"item": "https://deployatlas.com/"')
    t=t.replace('action="/thank-you.html"','action="/thank-you"')
    if t!=o:
        open(f,"w",errors="surrogateescape").write(t); changed+=1
print("pages rewritten:",changed)

# ---- residual checks ----
bad=[]
pages=set(all_pages())
exists=lambda p: (p=="/" ) or os.path.exists(p.lstrip("/")+"index.html" if p.endswith("/") else p.lstrip("/")+".html") or os.path.exists(p.lstrip("/"))
for f in all_pages():
    t=open(f,errors="ignore").read()
    for h in re.findall(r'href="([^"]+)"',t):
        if h.startswith(("http","mailto","tel","#","sms")): continue
        p=h.split("#")[0].split("?")[0]
        if p and not exists(p): bad.append((f,h))
print("broken internal links:",len(bad)); [print("  ",b) for b in bad[:40]]

# ---- netlify redirects ----
toml=open("netlify.toml").read()
start=toml.find("# ---- restructure redirects")
if start!=-1: toml=toml[:start]
blocks=["# ---- restructure redirects (September 2026) ----"]
for a,b in RETIRE.items():
    if a.endswith("/") and a not in ("/instant-bid/",): continue
    blocks.append(f'[[redirects]]\n  from = "{a}"\n  to = "{b}"\n  status = 301\n  force = true\n')
# .html -> extensionless for every remaining flat page
for f in all_pages():
    if f.endswith("/index.html") or f in ("404.html","index.html","thank-you.html"): continue
    blocks.append(f'[[redirects]]\n  from = "/{f}"\n  to = "{canon_for(f)}"\n  status = 301\n  force = true\n')
blocks.append('[[redirects]]\n  from = "/index.html"\n  to = "/"\n  status = 301\n  force = true\n')
# keep the 404 rule last
toml=toml.replace('# 404 page\n[[redirects]]\n  from = "/*"\n  to = "/404.html"\n  status = 404\n','')
toml=toml.rstrip()+"\n\n"+"\n".join(blocks)+"\n# 404 page\n[[redirects]]\n  from = \"/*\"\n  to = \"/404.html\"\n  status = 404\n"
open("netlify.toml","w").write(toml)
print("redirect rules:",toml.count("[[redirects]]"))

# ---- sitemap ----
today=datetime.date.today().isoformat()
prio={"/":"1.0","/demolition/":"0.9","/concrete/":"0.9","/concrete/concrete-removal/":"0.9","/concrete/parking-lot-removal/":"0.9","/demolition/structural/":"0.8","/demolition/mobile-home-removal/":"0.8","/demolition/interior-selective/":"0.8","/concrete/driveway-replacement/":"0.8","/site-work/":"0.7","/consultation/":"0.8","/services":"0.6","/service-areas":"0.6","/about":"0.5","/contact":"0.6"}
urls=[]
for f in all_pages():
    if f in ("404.html","thank-you.html","sitemap.html"): continue
    c=canon_for(f); p=prio.get(c, "0.6" if c.startswith("/locations/") else "0.5" if c.startswith("/blog/") else "0.3")
    if c in ("/privacy","/terms"): p="0.2"
    lm=today if (c.startswith(("/demolition","/concrete","/site-work","/instant-bid","/services","/service-areas","/about")) or c=="/") else datetime.date.fromtimestamp(os.path.getmtime(f)).isoformat()
    urls.append(f"  <url>\n    <loc>https://deployatlas.com{c}</loc>\n    <lastmod>{lm}</lastmod>\n    <priority>{p}</priority>\n  </url>")
open("sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"\n".join(urls)+"\n</urlset>\n")
print("sitemap urls:",len(urls))
