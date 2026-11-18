import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import template as T

REPO = "/Users/chriskurtz/code/atlas/site"
old = open(f"{REPO}/index.html").read()

def section(cls):
    m = re.search(rf'    <section class="{cls}">.*?</section>\n', old, re.S)
    return m.group(0)

ARROW = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>'
PIN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'

def sub_card(img, alt, h4, p, href):
    return f'''                <div class="sub-service-card">
                    <div class="sub-service-card-image">
                        <img src="{img}" alt="{alt}" loading="lazy">
                    </div>
                    <div class="sub-service-card-content">
                        <h4>{h4}</h4>
                        <p>{p}</p>
                        <a href="{href}" class="learn-more">
                            Learn More
                            {ARROW}
                        </a>
                    </div>
                </div>
'''

# ---------- reuse the real about story and real testimonials from the current home page ----------
about = section("section about-section")
about = about.replace('<h2>More Than a Name &mdash; A Way of Working</h2>', '<h2>Old-School Work Ethic. Modern-Day Results.</h2>')
about = re.sub(r'alt="[^"]*"', 'alt="Chris Kurtz operating a skid steer on a Columbia, MO job site"', about, count=1)
about = about.replace('src="images/', 'src="/images/').replace('href="about.html"', 'href="/about"').replace('href="contact.html"', 'href="/contact"')
about = about.replace('land clearing', 'concrete work').replace('Land Clearing', 'Concrete Work').replace('excavation', 'concrete')
testimonials = section("section testimonials-section")
testimonials = testimonials.replace("Don't just take our word for it. Here's what our satisfied customers have to say about working with Atlas.",
                                    "Eleven Google reviews, all five stars. A few of them, by first name.")

hero = '''    <section class="hero">
        <div class="hero-bg">
            <img src="/images/house-demolition-teardown-excavator.jpg" alt="Atlas Cat 308 excavator tearing down a house in Columbia, Missouri" fetchpriority="high">
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <div class="hero-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Tear it out. Haul it off. Put it back.
                </div>
                <h1>Professional <span>Demolition</span> &amp; <span>Site Work</span> Services</h1>
                <p class="hero-subtitle">Houses, mobile homes, garages, barns and commercial buildings down. Driveways and parking lots out and poured new. Free consultation, fixed price in writing. Columbia, MO.</p>
                <div class="hero-btns">
                    <a href="/estimate/" class="btn btn-primary btn-lg">Get my price</a>
                    <a href="tel:5732346641" class="btn btn-outline btn-lg">Call (573) 234-6641</a>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <div class="hero-stat-number">100+</div>
                        <div class="hero-stat-label">Teardowns Completed</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-number">5.0</div>
                        <div class="hero-stat-label">Google Rating</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-number">45 min</div>
                        <div class="hero-stat-label">Around Columbia</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
'''

services = f'''    <section class="section bg-white" id="services">
        <div class="container">
            <div class="section-header">
                <h2>What We Do</h2>
                <p>Tear it out. Put it back.</p>
            </div>

            <div class="services-grid">
                <div class="service-card">
                    <div class="service-card-image">
                        <img src="/images/house-demolition-teardown-excavator.jpg" alt="Excavator tearing the roof off a house during a demolition in Columbia, MO" loading="lazy">
                    </div>
                    <div class="service-card-content">
                        <h3>Demolition</h3>
                        <p>Houses, mobile homes, garages, barns, sheds, decks, commercial strip-outs and selective demo. Permits pulled, utilities disconnected, debris hauled and recycled, basement filled, lot graded. Any size job.</p>
                        <a href="/demolition/" class="btn btn-primary">Demolition Services</a>
                    </div>
                </div>

                <div class="service-card">
                    <div class="service-card-image">
                        <img src="/images/site-work-grading-excavator.jpg" alt="Excavator grading a cleared site after demolition in Mid-Missouri" loading="lazy">
                    </div>
                    <div class="service-card-content">
                        <h3>Site Work</h3>
                        <p>Once it's down, we put the site back. Concrete and paving poured or paved new, foundations filled, lots graded. Parking lots and driveways too, with or without a teardown.</p>
                        <a href="/concrete/" class="btn btn-primary">Site Work Services</a>
                    </div>
                </div>
            </div>

            <h3 class="section-sub" style="margin-top:50px">Demolition</h3>
            <div class="sub-services-grid" style="margin-top: 18px;">
{sub_card("/images/house-demolition.jpg","House demolition in progress in Columbia, MO","House, Garage &amp; Barn Teardowns","Structural demolition with the basement filled and the lot graded when we leave.","/demolition/structural/")}
{sub_card("/images/mobile-home.jpg","Mobile home demolition with excavator and dumpster","Mobile Home Removal","Single and double-wides demolished in place, steel scrapped, pad left clean.","/demolition/mobile-home-removal/")}
{sub_card("/images/interior-demolition.jpg","Commercial interior strip-out down to the shell","Interior &amp; Selective Demo","Strip-outs, tenant finish demo, porches and additions, occupied buildings.","/demolition/interior-selective/")}
            </div>
            <h3 class="section-sub" style="margin-top:40px">Site Work</h3>
            <div class="sub-services-grid" style="margin-top: 18px;">
{sub_card("/images/concrete-removal.jpg","Concrete slab being broken out for removal","Concrete Removal","Slabs, driveways, sidewalks, footings and foundations. Saw-cut, broken, recycled.","/concrete/concrete-removal/")}
{sub_card("/images/concrete-lot-prep-excavator-wide.jpg","Excavator grading a lot base before paving","Parking Lot Removal &amp; Replacement","Asphalt or concrete lots removed in phases and put back with a base that lasts.","/concrete/parking-lot-removal/")}
{sub_card("/images/site-work-grading-excavator.jpg","Excavator rough-grading a site after demolition","Backfill, Grading &amp; Pad Prep","Foundation holes filled, lots graded to drain, pads built for what comes next.","/site-work/")}
            </div>
        </div>
    </section>
'''

STEPS=[("Free Consultation","We walk the site with you and tell you what we'd do."),("Written Bid","A fixed price for labor and equipment in writing, with disposal billed at actual tonnage."),("Prep","Permitting, utility disconnects and the schedule are on us. You don't chase anybody."),("Tear Out and Put Back","The work, the haul, and the finish you chose, on one invoice.")]
process = '''    <section class="section process-section">
        <div class="container">
            <div class="section-header">
                <h2>How It Works</h2>
                <p>Four steps. You make one call.</p>
            </div>
            <div class="process-steps">
''' + "".join(f'''                <div class="process-step">
                    <div class="process-icon">
                        <span class="process-number">{i+1}</span>
                        {CHECK}
                    </div>
                    <h4>{h}</h4>
                    <p>{p}</p>
                </div>
''' for i,(h,p) in enumerate(STEPS)) + '''            </div>
        </div>
    </section>
'''

areas = f'''    <section class="section areas-section">
        <div class="container">
            <div class="section-header">
                <h2>Where We Work</h2>
                <p>Based in Columbia. Demolition and concrete across Mid-Missouri within about 45 minutes.</p>
            </div>
            <div class="areas-grid">
''' + "".join(f'''                <a href="{h}" class="area-card">
                    {PIN}
                    <h4>{n}</h4>
                    <p>{s}</p>
                </a>
''' for h,n,s in [("/locations/columbia-mo","Columbia","Home base, Boone County"),("/locations/jefferson-city-mo","Jefferson City","Cole County"),("/locations/fulton-mo","Fulton","Callaway County"),("/locations/moberly-mo","Moberly","Randolph County"),("/locations/fayette-mo","Fayette","Howard County"),("/locations/boonville-mo","Boonville","Cooper County"),("/locations/ashland-mo","Ashland","Southern Boone"),("/service-areas","All Service Areas","Centralia, Hallsville, Harrisburg, Rocheport")]) + '''            </div>
        </div>
    </section>
'''

cta = f'''    <section class="cta-section">
        <div class="container">
            <h2>Get a Number on It</h2>
            <p>Tell us what's coming out and what you want left behind. We walk the site and send a fixed price in writing.</p>
            <a href="/estimate/" class="btn btn-outline btn-lg">Get my price</a>
            <div class="cta-phone">
                {T.PHONE_SVG}
                <a href="{T.PHONE_TEL}">{T.PHONE}</a>
            </div>
        </div>
    </section>
'''

home_faqs = [
    ["What does ATLAS Demolition & Site Work do?", "Demolition first: houses, mobile homes, garages, barns, sheds, decks, commercial strip-outs and selective demolition in Columbia and Mid-Missouri. Concrete and paving second: parking lots, driveways, slabs, sidewalks and foundations removed and replaced. Site work such as backfill, grading and pad prep is the finish on those jobs. One contract, owner on the job, licensed and insured."],
    ["Do you only do concrete if you're also doing demolition?", "No. Concrete jobs stand on their own. If you have a parking lot or driveway to replace and nothing to tear down, that's a normal job for us. We remove it with our own equipment and our concrete crew pours or paves it back under our contract and warranty. We don't do concrete leveling, mudjacking or small patch repairs."],
    ["How does pricing work?", "Fixed price for mobilization, equipment and crew, in writing after a site visit. Disposal is billed as a pass-through at actual loads and tonnage with the scale tickets attached to the invoice. Typical ranges are published on each service page so you can see the ballpark before you call."],
    ["How far do you travel from Columbia?", "About 45 minutes: Jefferson City, Fulton, Moberly, Fayette, Boonville, Ashland, Centralia, Hallsville, Harrisburg, Rocheport and the towns between. Larger jobs are worth the drive anywhere in Mid-Missouri."],
]
faq_section = f'''    <section class="section bg-white">
        <div class="container">
            <div class="section-header">
                <h2>Straight Answers</h2>
            </div>
            <div class="service-detail-content" style="max-width:860px;margin:0 auto">
                <div class="faq-list">''' + "".join(f'''
                    <details class="faq-item">
                        <summary><h3>{q}</h3></summary>
                        <div class="faq-answer"><p>{a}</p></div>
                    </details>''' for q,a in home_faqs) + '''
                </div>
            </div>
        </div>
    </section>
'''

home_body = hero + services + process + about + testimonials + faq_section + areas + cta

home_html = T.page(
    path="/", layout="custom",
    title="Demolition & Concrete Contractor | Columbia, MO | Atlas",
    meta="Demolition and concrete contractor in Columbia, MO. Houses, mobile homes and commercial buildings down. Driveways and parking lots out and poured new.",
    keywords="demolition contractor Columbia MO, demolition company Columbia Missouri, concrete removal Columbia MO, parking lot removal, mobile home removal, house demolition, concrete contractor Columbia MO, site work",
    h1="", subtitle="", crumbs=[["/","Home"]], body=home_body, faqs=home_faqs,
    og_image="/images/house-demolition-teardown-excavator.jpg",
)
# the custom layout still emits BreadcrumbList for a single crumb; drop it on the home page
home_html = re.sub(r'    <script type="application/ld\+json">\n\{\n    "@context": "https://schema.org",\n    "@type": "BreadcrumbList".*?</script>\n', '', home_html, count=1, flags=re.S)
open(f"{REPO}/index.html","w").write(home_html)
print("index.html", len(home_html), "divs", home_html.count("<div"), home_html.count("</div>"))


# The /consultation/ page was retired in Nov 2026. Every lead CTA now points at /estimate/ (Get my price),
# and /consultation/ 301s there (see netlify.toml), so this script only builds the home page.
