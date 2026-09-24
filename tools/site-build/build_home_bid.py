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
                    <a href="/consultation/" class="btn btn-primary btn-lg">Free Consultation</a>
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
                        <img src="/images/concrete-wall-removal-excavator.jpg" alt="Excavator with a hydraulic breaker removing a concrete retaining wall" loading="lazy">
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
{sub_card("/images/concrete-lot-prep-excavator.jpg","Excavator grading a lot base before paving","Parking Lot Removal &amp; Replacement","Asphalt or concrete lots removed in phases and put back with a base that lasts.","/concrete/parking-lot-removal/")}
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
            <a href="/consultation/" class="btn btn-outline btn-lg">Request a Free Consultation</a>
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
    meta="ATLAS Demolition & Site Work: demolition, concrete removal and parking lot replacement in Columbia and Mid-Missouri. Tear it out, haul it off, put it back. Licensed and insured. (573) 234-6641.",
    keywords="demolition contractor Columbia MO, demolition company Columbia Missouri, concrete removal Columbia MO, parking lot removal, mobile home removal, house demolition, concrete contractor Columbia MO, site work",
    h1="", subtitle="", crumbs=[["/","Home"]], body=home_body, faqs=home_faqs,
    og_image="/images/house-demolition-teardown-excavator.jpg",
)
# the custom layout still emits BreadcrumbList for a single crumb; drop it on the home page
home_html = re.sub(r'    <script type="application/ld\+json">\n\{\n    "@context": "https://schema.org",\n    "@type": "BreadcrumbList".*?</script>\n', '', home_html, count=1, flags=re.S)
open(f"{REPO}/index.html","w").write(home_html)
print("index.html", len(home_html), "divs", home_html.count("<div"), home_html.count("</div>"))

# ---------- instant bid: scoped intake form ----------
bid_body = f'''    <section class="page-header">
        <div class="container">
            <div class="breadcrumb">
                <a href="/">Home</a><span>/</span>
                <span class="current">Free Consultation</span>
            </div>
            <h1>Free On-Site Consultation</h1>
            <p>Tell us what's coming out and what you want left behind. We walk the site with you, tell you what we'd do, and put a fixed price in writing.</p>
        </div>
    </section>

    <section class="service-detail-section">
        <div class="container">
            <div class="service-detail-grid">
                <div class="service-detail-content">
                    <form id="bid-lead-form" name="instant-bid" method="POST" action="/thank-you" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" class="bid-intake">
                        <input type="hidden" name="form-name" value="instant-bid">
                        <p class="hidden-field" hidden><label>Don't fill this out: <input name="bot-field"></label></p>
                        <input type="hidden" name="source" value="instant-bid">
                        <input type="hidden" name="utmSource" id="bid-h-utm-source">
                        <input type="hidden" name="utmMedium" id="bid-h-utm-medium">
                        <input type="hidden" name="utmCampaign" id="bid-h-utm-campaign">
                        <input type="hidden" name="utmContent" id="bid-h-utm-content">

                        <h2>1. The job</h2>
                        <div class="form-group">
                            <label for="bid-project-type">What needs to happen?</label>
                            <select id="bid-project-type" name="projectType" class="bid-input" required>
                                <option value="">Select one</option>
                                <optgroup label="Demolition">
                                    <option>House or building teardown</option>
                                    <option>Mobile home removal</option>
                                    <option>Garage, barn, shed or outbuilding</option>
                                    <option>Interior strip-out or selective demo</option>
                                    <option>Pool, deck, porch or addition removal</option>
                                </optgroup>
                                <optgroup label="Concrete &amp; paving">
                                    <option>Parking lot removal and replacement</option>
                                    <option>Parking lot removal only</option>
                                    <option>Driveway removal and replacement</option>
                                    <option>Slab, patio, sidewalk or foundation removal</option>
                                    <option>New concrete: pad, drive, lot</option>
                                </optgroup>
                                <optgroup label="After the teardown">
                                    <option>Backfill, grading or pad prep (with a demo or concrete job)</option>
                                </optgroup>
                                <option>Something else</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="bid-sqft">Approximate size</label>
                                <input type="text" id="bid-sqft" name="approxSize" class="bid-input" placeholder="e.g. 1,400 sq ft house, 40-space lot, 20x24 slab" required>
                            </div>
                            <div class="form-group">
                                <label for="bid-put-back">When we're done, you want</label>
                                <select id="bid-put-back" name="finishState" class="bid-input" required>
                                    <option value="">Select one</option>
                                    <option>Bare, graded ground</option>
                                    <option>Graded, seeded and strawed</option>
                                    <option>Pad prepped for a new build</option>
                                    <option>New concrete poured back</option>
                                    <option>New asphalt paved back</option>
                                    <option>Not sure yet</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="bid-property-type">Property</label>
                                <select id="bid-property-type" name="propertyType" class="bid-input" required>
                                    <option value="">Select one</option>
                                    <option>Residential, I own it</option>
                                    <option>Commercial, I own or manage it</option>
                                    <option>Church, school or nonprofit</option>
                                    <option>I'm a general contractor</option>
                                    <option>Government or public</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="bid-timeline">Timeline</label>
                                <select id="bid-timeline" name="timeline" class="bid-input" required>
                                    <option value="">Select one</option>
                                    <option>As soon as possible</option>
                                    <option>Within 30 days</option>
                                    <option>1 to 3 months</option>
                                    <option>Planning, no date yet</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="bid-details">Anything we should know <span style="font-weight:400;color:var(--gray-light)">(optional)</span></label>
                            <textarea id="bid-details" name="details" class="bid-input" rows="4" placeholder="Basement or slab? Utilities still on? Asbestos inspection done? Gate width, tight access, tenants in the building, a date you need to hit."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="bid-photos">Photos <span style="font-weight:400;color:var(--gray-light)">(optional, up to 3)</span></label>
                            <input type="file" id="bid-photos" name="photos" class="bid-input" accept="image/*" multiple>
                            <small>Two or three photos and a wide shot of the access usually let us get a number close before we visit.</small>
                        </div>

                        <h2>2. The site</h2>
                        <div class="form-group">
                            <label for="bid-address">Project location <span style="font-weight:400;color:var(--gray-light)">(city and state is fine)</span></label>
                            <input type="text" id="bid-address" name="propertyAddress" class="bid-input" required autocomplete="off" placeholder="e.g. Columbia, MO">
                        </div>

                        <h2>3. You</h2>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="bid-first-name">First name</label>
                                <input type="text" id="bid-first-name" name="firstName" class="bid-input" required autocomplete="given-name">
                            </div>
                            <div class="form-group">
                                <label for="bid-last-name">Last name</label>
                                <input type="text" id="bid-last-name" name="lastName" class="bid-input" required autocomplete="family-name">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="bid-phone">Phone</label>
                                <input type="tel" id="bid-phone" name="phone" class="bid-input" required autocomplete="tel">
                            </div>
                            <div class="form-group">
                                <label for="bid-email">Email</label>
                                <input type="email" id="bid-email" name="email" class="bid-input" required autocomplete="email">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="consent">
                                <input type="checkbox" name="smsConsent" value="yes">
                                <span>It's fine to text me about this consultation at the number above. Message and data rates may apply. Reply STOP to opt out. See our <a href="/privacy">privacy policy</a>.</span>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Request a Free Consultation</button>
                        <p class="bid-disclaimer" style="margin-top:14px">No obligation. We'll call to set up the site visit, then send a fixed price in writing. Disposal is billed at actual tonnage.</p>
                    </form>
                </div>

                <div class="service-sidebar">
                    <div class="sidebar-card">
                        <h4>What happens next</h4>
                        <ul class="sidebar-services">
                            <li><span style="display:block;padding:8px 0">1. We call you to set up the visit.</span></li>
                            <li><span style="display:block;padding:8px 0">2. Site visit. We measure, check access and the base or foundation.</span></li>
                            <li><span style="display:block;padding:8px 0">3. Fixed price in writing, with the put-back option if you want it.</span></li>
                        </ul>
                    </div>
                    <div class="sidebar-card">
                        <h4>Rather talk?</h4>
                        <p style="margin-bottom:12px">Chris answers the phone. Owner, estimator and operator.</p>
                        <a href="{T.PHONE_TEL}" class="btn btn-primary" style="width:100%">{T.PHONE}</a>
                    </div>
                    <div class="sidebar-card">
                        <h4>Typical ranges</h4>
                        <ul class="sidebar-services">
                            <li><a href="/demolition/structural/">House teardown $8,000 to $30,000</a></li>
                            <li><a href="/demolition/mobile-home-removal/">Mobile home $4,000 to $10,000</a></li>
                            <li><a href="/concrete/driveway-replacement/">Driveway replaced $7,000 to $14,000</a></li>
                            <li><a href="/concrete/parking-lot-removal/">Parking lot replaced $60,000+</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
'''
bid_html = T.page(
    path="/consultation/", layout="custom",
    title="Free Consultation | ATLAS Demolition & Site Work | Columbia, MO",
    meta="Free on-site consultation for demolition, concrete removal, parking lot or driveway replacement in Columbia and Mid-Missouri. We walk the site, then put a fixed price in writing. (573) 234-6641.",
    keywords="demolition estimate Columbia MO, demolition bid, concrete removal quote, parking lot replacement quote, get a demolition quote Missouri",
    h1="", subtitle="", crumbs=[["/","Home"],["/consultation/","Free Consultation"]], body=bid_body, faqs=[],
    og_image="/images/house-demolition-teardown-excavator.jpg",
    extra_head='    <script>document.addEventListener("DOMContentLoaded",function(){var p=new URLSearchParams(location.search);[["utm_source","bid-h-utm-source"],["utm_medium","bid-h-utm-medium"],["utm_campaign","bid-h-utm-campaign"],["utm_content","bid-h-utm-content"]].forEach(function(x){var e=document.getElementById(x[1]);if(e&&p.get(x[0]))e.value=p.get(x[0]);});});</script>',
)
os.makedirs(f"{REPO}/consultation", exist_ok=True)
open(f"{REPO}/consultation/index.html","w").write(bid_html)
print("consultation/index.html", len(bid_html), "divs", bid_html.count("<div"), bid_html.count("</div>"))
