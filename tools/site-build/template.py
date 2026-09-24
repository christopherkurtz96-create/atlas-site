"""Shared page builder for the Atlas site restructure. Output is static HTML committed to the repo."""
import json, html as H

SITE = "https://deployatlas.com"
PHONE_TEL = "tel:5732346641"; PHONE = "(573) 234-6641"; EMAIL = "chris@deployatlas.com"
GA = """    <script async src="https://www.googletagmanager.com/gtag/js?id=G-11MK2WQ0NC"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-11MK2WQ0NC');
        gtag('config', 'AW-17754715518');
    </script>"""
PHONE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'

NAV_DEMO = [("/demolition/","Demolition Services"),("/demolition/structural/","House, Garage & Barn Teardowns"),("/demolition/mobile-home-removal/","Mobile Home Removal"),("/demolition/interior-selective/","Interior & Selective Demo")]
NAV_CONC = [("/concrete/","Concrete & Paving"),("/concrete/concrete-removal/","Concrete Removal"),("/concrete/parking-lot-removal/","Parking Lot Removal & Replacement"),("/concrete/driveway-replacement/","Driveway Replacement"),("/site-work/","Backfill, Grading & Pad Prep")]
NAV_AREAS = [("/locations/columbia-mo","Columbia, MO"),("/locations/jefferson-city-mo","Jefferson City, MO"),("/locations/fulton-mo","Fulton, MO"),("/locations/moberly-mo","Moberly, MO"),("/locations/fayette-mo","Fayette, MO"),("/locations/boonville-mo","Boonville, MO"),("/locations/ashland-mo","Ashland, MO"),("/service-areas","All Service Areas")]

AREAS = ["Columbia","Jefferson City","Fulton","Moberly","Fayette","Boonville","Ashland","Centralia","Hallsville","Harrisburg","Rocheport"]

def header():
    dd = lambda items: "".join(f'\n                            <a href="{h}">{t}</a>' for h,t in items)
    return f'''    <header class="header" id="header">
        <div class="container">
            <div class="header-inner">
                <a href="/" class="logo">
                    <img src="/images/logo.svg" alt="ATLAS Demolition & Site Work">
                </a>

                <nav class="nav-menu">
                    <div class="nav-dropdown">
                        <a href="/demolition/" class="nav-link">Demolition</a>
                        <div class="nav-dropdown-content">{dd(NAV_DEMO)}
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="/concrete/" class="nav-link">Site Work</a>
                        <div class="nav-dropdown-content">{dd(NAV_CONC)}
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="/service-areas" class="nav-link">Service Areas</a>
                        <div class="nav-dropdown-content">{dd(NAV_AREAS)}
                        </div>
                    </div>
                    <a href="/about" class="nav-link">About</a>
                    <a href="/contact" class="nav-link">Contact</a>
                </nav>

                <div class="header-cta">
                    <a href="{PHONE_TEL}" class="header-phone">
                        {PHONE_SVG}
                        {PHONE}
                    </a>
                    <a href="/consultation/" class="btn btn-primary btn-sm">Free Consultation</a>
                </div>

                <div class="mobile-toggle" id="mobile-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="mobile-nav" id="mobile-nav">
        <a href="/">Home</a>
        <a href="/demolition/">Demolition</a>
        <a href="/concrete/">Site Work: Concrete & Paving</a>
        <a href="/service-areas">Service Areas</a>
        <a href="/about">About</a>
        <a href="/consultation/">Request a Free Consultation</a>
        <a href="/contact">Contact</a>
        <a href="{PHONE_TEL}" class="btn btn-primary">Call {PHONE}</a>
    </nav>
'''

def footer():
    return f'''    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <img src="/images/logo-white.svg" alt="ATLAS Demolition & Site Work" style="height: 50px; margin-bottom: 10px;">
                    <p>ATLAS Demolition & Site Work is a locally owned demolition and concrete contractor in Columbia, Missouri. We tear it out, haul it off, and put the site back. One contractor, start to finish, across Mid-Missouri.</p>
                    <div class="footer-social">
                        <a href="https://www.facebook.com/profile.php?id=61584529212929" aria-label="Facebook" rel="noopener">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/deployatlas/" aria-label="Instagram" rel="noopener">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 4H8C5.79 4 4 5.79 4 8v8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-4 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4.5-7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
                        </a>
                    </div>
                </div>

                <div class="footer-col">
                    <h4>Demolition</h4>
                    <ul class="footer-links">
                        <li><a href="/demolition/">Demolition Services</a></li>
                        <li><a href="/demolition/structural/">House & Garage Teardowns</a></li>
                        <li><a href="/demolition/mobile-home-removal/">Mobile Home Removal</a></li>
                        <li><a href="/demolition/interior-selective/">Interior & Selective Demo</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Site Work</h4>
                    <ul class="footer-links">
                        <li><a href="/concrete/">Concrete & Paving</a></li>
                        <li><a href="/concrete/concrete-removal/">Concrete Removal</a></li>
                        <li><a href="/concrete/parking-lot-removal/">Parking Lot Removal</a></li>
                        <li><a href="/concrete/driveway-replacement/">Driveway Replacement</a></li>
                        <li><a href="/site-work/">Backfill, Grading & Pad Prep</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Contact Us</h4>
                    <div class="footer-contact-item">
                        {PHONE_SVG}
                        <a href="{PHONE_TEL}">{PHONE}</a>
                    </div>
                    <div class="footer-contact-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <a href="mailto:{EMAIL}">{EMAIL}</a>
                    </div>
                    <div class="footer-contact-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>Columbia, MO 65201 · Serving {", ".join(AREAS[:5])} and Mid-Missouri</span>
                    </div>
                    <p style="margin-top:12px;font-size:13px;opacity:.8">Licensed and insured. General liability, umbrella and workers' compensation.</p>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 ATLAS Demolition & Site Work. All rights reserved.</p>
                <div class="footer-bottom-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/sitemap">Sitemap</a>
                </div>
            </div>
        </div>
    </footer>
'''

def business_schema(extra_ids=None):
    return {
        "@context":"https://schema.org","@type":"HomeAndConstructionBusiness","@id":f"{SITE}/#business",
        "name":"ATLAS Demolition & Site Work","alternateName":"ATLAS Demolition",
        "image":f"{SITE}/images/icon-512.png","logo":f"{SITE}/images/icon-512.png",
        "description":"Demolition and concrete contractor in Columbia, Missouri. Structural, mobile home, interior and concrete demolition; parking lot and driveway removal and replacement; site work after the teardown. Serving Mid-Missouri within about 45 minutes of Columbia.",
        "url":SITE,"telephone":"+1-573-234-6641","email":EMAIL,"priceRange":"$$$",
        "address":{"@type":"PostalAddress","addressLocality":"Columbia","addressRegion":"MO","postalCode":"65201","addressCountry":"US"},
        "geo":{"@type":"GeoCoordinates","latitude":38.9517,"longitude":-92.3341},
        "areaServed":[{"@type":"City","name":c,"containedInPlace":{"@type":"State","name":"Missouri"}} for c in AREAS],
        "serviceArea":{"@type":"GeoCircle","geoMidpoint":{"@type":"GeoCoordinates","latitude":38.9517,"longitude":-92.3341},"geoRadius":"45 mi"},
        "openingHoursSpecification":{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"07:00","closes":"18:00"},
        "sameAs":["https://www.facebook.com/profile.php?id=61584529212929","https://www.instagram.com/deployatlas/"],
        "hasOfferCatalog":{"@type":"OfferCatalog","name":"Demolition and concrete services","itemListElement":[
            {"@type":"Offer","itemOffered":{"@type":"Service","name":n,"url":SITE+u}} for n,u in [
            ("Structural demolition","/demolition/structural/"),("Mobile home removal","/demolition/mobile-home-removal/"),("Interior and selective demolition","/demolition/interior-selective/"),
            ("Concrete removal","/concrete/concrete-removal/"),("Parking lot removal and replacement","/concrete/parking-lot-removal/"),("Concrete driveway replacement","/concrete/driveway-replacement/"),
            ("Site work after demolition","/site-work/")]]}
    }

def jsonld(obj):
    return '    <script type="application/ld+json">\n' + json.dumps(obj, indent=4, ensure_ascii=False) + '\n    </script>\n'

def faq_html(faqs):
    if not faqs: return ""
    items = "".join(f'''
                    <details class="faq-item">
                        <summary><h3>{H.escape(q)}</h3></summary>
                        <div class="faq-answer"><p>{a}</p></div>
                    </details>''' for q,a in faqs)
    return f'''
                    <h2 id="faq">Frequently Asked Questions</h2>
                    <div class="faq-list">{items}
                    </div>'''

def page(*, path, title, meta, h1, subtitle, crumbs, body, faqs=(), sidebar=None, og_image="/images/og-image.jpg", service=None, cta_h2="Ready to get a number on it?", cta_p="Tell us what you need torn out or put back. We'll walk the site with you and put a fixed price in writing.", extra_head="", layout="service", keywords=""):
    """path: canonical path like /concrete/concrete-removal/ . body: inner HTML of the content column (no FAQ; passed separately)."""
    canon = SITE + path
    crumb_html = "".join(f'<a href="{h}">{t}</a><span>/</span>\n                ' for h,t in crumbs[:-1]) + f'<span class="current">{crumbs[-1][1]}</span>'
    schemas = [business_schema()]
    schemas.append({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":t,"item":SITE+h} for i,(h,t) in enumerate(crumbs)]})
    if faqs:
        schemas.append({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})
    if service:
        schemas.append({"@context":"https://schema.org","@type":"Service","name":service["name"],"serviceType":service.get("type",service["name"]),"provider":{"@id":f"{SITE}/#business"},"areaServed":{"@type":"State","name":"Missouri"},"url":canon,"description":meta})
    sb = sidebar if sidebar is not None else default_sidebar(path)
    if layout=="service":
        main = f'''    <section class="page-header">
        <div class="container">
            <div class="breadcrumb">
                {crumb_html}
            </div>
            <h1>{h1}</h1>
            <p>{subtitle}</p>
        </div>
    </section>

    <section class="service-detail-section">
        <div class="container">
            <div class="service-detail-grid">
                <div class="service-detail-content">
{body}{faq_html(faqs)}
                </div>
{sb}
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>{cta_h2}</h2>
            <p>{cta_p}</p>
            <div class="hero-btns" style="justify-content:center">
                <a href="/consultation/" class="btn btn-primary btn-lg">Request a Free Consultation</a>
                <a href="{PHONE_TEL}" class="btn btn-outline btn-lg">Call {PHONE}</a>
            </div>
        </div>
    </section>
'''
    else:
        main = body
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{H.escape(meta,quote=True)}">
{('    <meta name="keywords" content="'+H.escape(keywords,quote=True)+'">'+chr(10)) if keywords else ''}    <meta name="robots" content="index, follow">
    <meta name="geo.region" content="US-MO">
    <meta name="geo.placename" content="Columbia, Missouri">
    <meta name="msvalidate.01" content="14C2E18BFA57F2F67B32E7A9A4ADEC24" />

    <meta property="og:title" content="{H.escape(title,quote=True)}">
    <meta property="og:description" content="{H.escape(meta,quote=True)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{canon}">
    <meta property="og:image" content="{SITE}{og_image}">
    <meta property="og:site_name" content="ATLAS Demolition & Site Work">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{H.escape(title,quote=True)}">
    <meta name="twitter:description" content="{H.escape(meta,quote=True)}">
    <meta name="twitter:image" content="{SITE}{og_image}">

    <link rel="canonical" href="{canon}">
    <title>{title}</title>

    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css?v=20260924f">
{extra_head}
{GA}

{"".join(jsonld(s) for s in schemas)}</head>
<body>
{header()}
{main}
{footer()}
    <script src="/js/main.js?v=20260924f"></script>
</body>
</html>
'''

def default_sidebar(path):
    demo = path.startswith("/demolition")
    items = NAV_DEMO if demo else NAV_CONC
    other = NAV_CONC if demo else NAV_DEMO
    li = lambda items: "".join(f'\n                            <li><a href="{h}"{" class=\"active\"" if h==path else ""}>{t}</a></li>' for h,t in items)
    return f'''                <div class="service-sidebar">
                    <div class="sidebar-card">
                        <h4>{"Demolition" if demo else "Site Work"}</h4>
                        <ul class="sidebar-services">{li(items)}
                        </ul>
                    </div>
                    <div class="sidebar-card">
                        <h4>{"Site Work" if demo else "Demolition"}</h4>
                        <ul class="sidebar-services">{li(other)}
                        </ul>
                    </div>
                    <div class="sidebar-card sidebar-cta">
                        <h4>Free On-Site Consultation</h4>
                        <p>We walk the site with you, then put a fixed price in writing.</p>
                        <a href="/consultation/" class="btn btn-primary">Request a Free Consultation</a>
                        <a href="{PHONE_TEL}" class="btn btn-outline-orange" style="margin-top:10px">{PHONE}</a>
                    </div>
                </div>'''

def build_from_json(spec_path, out_path):
    spec = json.load(open(spec_path))
    html_out = page(**spec)
    import os; os.makedirs(os.path.dirname(out_path), exist_ok=True)
    open(out_path,"w").write(html_out); return len(html_out)
