# Site build tooling (September 2026 restructure)

Static HTML is what ships. These scripts generate it so every page shares one header, footer, nav and schema block.

- `template.py` — `page(...)` builder: head, GA, JSON-LD (HomeAndConstructionBusiness, BreadcrumbList, FAQPage, Service), header + mobile nav, service-page layout with sidebar, CTA, footer. Edit the nav lists here and rerun `site_pass.py` to propagate.
- `pages/*.json` — content specs for every generated page (title, meta, h1, body HTML, faqs). Edit the JSON, then rebuild that page:
  `python3 -c "import sys;sys.path.insert(0,'tools/site-build');import template as T,json;s=json.load(open('tools/site-build/pages/concrete-hub.json'));s['faqs']=[tuple(x) for x in s['faqs']];s['crumbs']=[tuple(x) for x in s['crumbs']];open('concrete/index.html','w').write(T.page(**s))"`
- `money_pages.py` — the two concrete money pages, written as Python dicts; run it to regenerate their JSON.
- `build_home_bid.py` — home page and /consultation/ intake form.
- `site_pass.py` — swaps header/footer onto any page that still has the old ones (e.g. a new blog post from the automation), rewrites internal links to root-absolute extensionless paths, regenerates the netlify.toml redirect table and sitemap.xml. Run with `--no-delete` after adding pages. Run from the repo root.
- `CONTENT-SPEC.md` — the writing brief handed to page-writing agents. Voice, pricing model, allowed claims, photos, links.

URL rules: canonical host is https://deployatlas.com (apex, no www). Hubs are directories (`/demolition/`), flat pages are extensionless (`/about`, `/blog/<slug>`) and stay as `.html` files on disk; netlify.toml 301s the `.html` form. Never link to `/services/*.html`.
