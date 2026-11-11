// Atlas Instant Estimate v2 — address-first homeowner flow. PRIVATE prototype, TEST rates, in-memory only.
import { BRAND, TEST_BADGE, IS_TEST, STATUS, DELIVERY, DEMO_ADDRESS, MAP, SERVICES, SERVICE_ORDER, TYPICAL_SCENARIOS, LEAD_FORM, TEST_RATES } from './config.mjs';
import { evaluate, padDims, money, fmtNum } from './pricing.mjs';
import { createMap } from './map.mjs';
import { isAllowedHostname, validateAddress } from './guards.mjs';
import { haversineM, mToFt, round } from './geo.mjs';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const testPill = () => (IS_TEST ? `<span class="test-pill">${esc(TEST_BADGE)}</span>` : '');
const statusText = () => (IS_TEST ? STATUS.estimateTest : STATUS.estimate);
const ICONS = {
  drain: '<svg viewBox="0 0 24 24"><path d="M3 17c3-4 6 4 9 0s6 4 9 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 7h16M4 11h10" stroke="currentColor" stroke-width="2"/></svg>',
  drive: '<svg viewBox="0 0 24 24"><path d="M9 3 5 21M15 3l4 18M12 6v2M12 11v2M12 16v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  culvert: '<svg viewBox="0 0 24 24"><ellipse cx="7" cy="12" rx="3" ry="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 6h10a3 6 0 0 1 0 12H7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  pad: '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 10h16M4 14h16" stroke="currentColor" stroke-width="1"/></svg>',
};

// ---------------- state (memory only) ----------------
const st = {
  path: null, demoLead: null,
  view: 'landing', address: null, geocode: null, service: null, opts: {}, custom: { width_ft: '20', length_ft: '20' },
  geometry: null, ground: { status: 'idle' }, groundRev: 0, lead: null, map: null, mode: 'map',
};

const isProduction = () => DELIVERY.productionHosts.includes(location.hostname) || location.hostname.endsWith(DELIVERY.previewHostSuffix);
// Netlify Forms AJAX submit (production only). Returns { sent, status, error }.
async function deliver(formName, fields) {
  if (!isProduction()) return { sent: false, status: STATUS.notSent, mode: 'local-only (not the production host)' };
  // Copy to the ATLAS Leads app (never blocks the form; Netlify Forms is still the record).
  try { if (window.atlasLeads) window.atlasLeads.send({ form_name: formName === DELIVERY.forms.lead ? 'estimate_tool' : 'estimate_consultation', name: fields.name, phone: fields.phone, email: fields.email, address: fields.address, service: fields.service || fields.what, message: fields.notes, est_low: fields.price_low, est_high: fields.price_high, timeline: fields.timing, contact_pref: fields.contact, property: fields.property }); } catch (e) {}
  const body = new URLSearchParams({ 'form-name': formName, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])) });
  try {
    const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return { sent: true, status: STATUS.sent, mode: 'netlify-forms' };
  } catch (e) { return { sent: false, status: STATUS.sendFailed, error: e.message, mode: 'netlify-forms' }; }
}

async function fetchJson(url, ms = 35000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal, credentials: 'omit' }); const j = await r.json().catch(() => null); if (!r.ok) throw new Error((j && j.error) || `HTTP ${r.status}`); return j; } finally { clearTimeout(t); }
}

// ---------------- landing ----------------
function typicalRows() {
  return TYPICAL_SCENARIOS.map((s) => ({ ...s, r: evaluate(s.service, s.opts, { gradePct: 0, ...s.q }) }));
}
function heroCard() {
  if (st.path === 'site') return `
        ${testPill()}
        <button type="button" class="link back-link" data-testid="path-back">‹ Back</button>
        <h2>Draw it on your property.<br>See the price.</h2>
        <p>Aerial photos and USGS ground data for your lot. Drainage, driveways, culverts and gravel pads. No email needed to see a number.</p>
        <form class="addr" data-testid="address-form" novalidate>
          <label for="addr">Your property address</label>
          <div class="addr-row"><input id="addr" type="text" autocomplete="off" placeholder="Start typing your address" data-testid="address-input" value="${esc(st.address || '')}"><button class="btn btn-primary" type="submit" data-testid="address-submit">Show my property</button></div>
          <p class="addr-status" data-testid="address-status" aria-live="polite"></p>
          <div class="addr-alt"><button type="button" class="link" data-testid="use-demo">Use the public demo address (Boone County Courthouse)</button><button type="button" class="link" data-testid="use-describe">Rather answer a few questions?</button></div>
        </form>`;
  if (st.path === 'demo') return `
        <button type="button" class="link back-link" data-testid="path-back">‹ Back</button>
        <h2>Demolition.<br>Free consultation.</h2>
        <p>Houses, mobile homes, garages, barns, decks, concrete. Tell us what's coming down and we'll walk it with you and put a fixed price in writing.</p>
        <div class="btn-row"><a class="btn btn-primary" href="${BRAND.phoneHref}" data-testid="demo-call">Call ${esc(BRAND.phone)}</a><a class="btn btn-ghost light" href="${BRAND.smsHref}" data-testid="demo-text">Text us</a></div>
        <p class="small light">Or send the details:</p>
        <form class="demo-form" data-testid="demo-form" novalidate>
          <div class="two"><label>Your name<input type="text" name="name" data-testid="demo-name" autocomplete="off"></label><label>Mobile phone<input type="text" name="phone" data-testid="demo-phone" autocomplete="off"></label></div>
          <label>Email <em>(optional)</em><input type="text" name="email" data-testid="demo-email" autocomplete="off"></label>
          <label>Property address<input type="text" name="address" data-testid="demo-address" autocomplete="off"></label>
          <label>What's coming down?<select name="what" data-testid="demo-what"><option value="house">House</option><option value="mobile_home">Mobile home</option><option value="garage_barn_shed">Garage, barn or shed</option><option value="deck">Deck</option><option value="concrete">Concrete: driveway, slab or parking lot</option><option value="interior">Interior / selective demo</option><option value="other">Something else</option></select></label>
          <label>Anything we should know? <em>(optional)</em><textarea name="notes" rows="3" placeholder="Size, access, utilities, when you'd like it done." data-testid="demo-notes"></textarea></label>
          ${isProduction() ? '' : `<div class="not-sent" data-testid="demo-not-sent">${esc(STATUS.notSent)} — prototype saves to your device only</div>`}
          <button type="submit" class="btn btn-primary btn-block" data-testid="demo-save"><span>Request my free consultation</span><small>${isProduction() ? 'We reply fast' : esc(STATUS.notSent)}</small></button>
        </form>
        <div id="demo-out">${st.demoLead ? demoSaved() : ''}</div>`;
  return `
        <h2>Get your price.<br>What are we doing?</h2>
        <div class="path-tiles" data-testid="path-tiles">
          <button type="button" class="path-tile" data-path="demo" data-testid="path-demo"><strong>Demolition</strong><span>Tear it out, haul it off. Houses, mobile homes, garages, barns, decks, concrete.</span><em>Free consultation →</em></button>
          <button type="button" class="path-tile" data-path="site" data-testid="path-site"><strong>Site work</strong><span>Gravel driveways, culverts, drainage and gravel pads.</span><em>Draw it, see a price →</em></button>
        </div>
        <p class="small light">Not sure? Call or text <a href="${BRAND.phoneHref}">${esc(BRAND.phone)}</a>.</p>`;
}
function demoSaved() { return `<div class="lead-saved" data-testid="demo-saved"><strong>${esc(STATUS.notSent)}</strong> — saved to your device only. Nothing was transmitted.</div>`; }
function setPath(p) { st.path = p; renderLanding(); const el = document.getElementById('tool'); if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' }); }

function renderLanding() {
  const rows = typicalRows();
  let lastGroup = '';
  $('#app').innerHTML = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1>Get your price.</h1>
        <p class="lead">Type your address, draw the job on your property and see a price range. Like the number? A free site visit locks it in writing.</p>
        <ul class="ticks"><li>Real aerial photos of your property</li><li>See a range before you give us a phone number</li><li>Serving ${esc(BRAND.city)} and 45 minutes around</li></ul>
        <p class="talk">Rather talk it through? Call or text <a href="${BRAND.phoneHref}">${esc(BRAND.phone)}</a>.</p>
      </div>
      <div class="hero-card" id="tool" data-testid="hero-card" data-path="${esc(st.path || 'choose')}">
        ${heroCard()}
      </div>
    </div>
  </section>
  <section class="band"><div class="wrap">
    <h2 class="h-bebas">Typical prices ${IS_TEST ? '<span class="test-pill">TEST figures from fictional rates</span>' : ''}</h2>
    <p class="muted">${IS_TEST ? 'What the test engine returns for common jobs. Not Atlas pricing.' : 'Real jobs we price all the time, so you know what to expect.'}</p>
    <table class="typical" data-testid="typical-table"><thead><tr><th>Job</th><th>Range</th><th>Typical</th></tr></thead><tbody>
      ${rows.map((s) => { const g = s.group !== lastGroup ? `<tr class="grp"><td colspan="3">${esc(s.group)}</td></tr>` : ''; lastGroup = s.group; return `${g}<tr><td>${esc(s.label)}</td><td>${money(s.r.low)}–${money(s.r.high)}</td><td>${money(s.r.typical)}</td></tr>`; }).join('')}
    </tbody></table>
    <p class="small">Job minimums: $3,000 for drainage and culverts, $3,500 for driveways and pads. Public permits are passed through at cost and are not included in any figure shown.</p>
  </div></section>
  <section class="band contact" id="contact" data-testid="contact"><div class="wrap">
    <h2 class="h-bebas">Talk to us</h2>
    <p class="lead">Send us the address and a sentence or two about the job. We get back to you quickly to set up a free site visit.</p>
    <dl class="contact-list">
      <div><dt>Call or text</dt><dd><a class="big" href="${BRAND.phoneHref}" data-testid="contact-call">${esc(BRAND.phone)}</a><br><a href="${BRAND.smsHref}" data-testid="contact-text">Send a text</a></dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${esc(BRAND.email)}" data-testid="contact-email">${esc(BRAND.email)}</a></dd></div>
      <div><dt>Office</dt><dd>${esc(BRAND.office)}</dd></div>
      <div><dt>Service area</dt><dd>${esc(BRAND.serviceArea)}</dd></div>
    </dl>
    <p>Want a number first? <a href="#tool">Get your price in about two minutes.</a></p>
  </div></section>
  <section class="band alt"><div class="wrap">
    <h2 class="h-bebas">What happens after</h2>
    <ol class="steps">
      <li><strong>Tell us about the job.</strong> Call, text or see your range online in about two minutes.</li>
      <li><strong>Free site visit.</strong> We walk the property with you and put the scope and price in writing.</li>
      <li><strong>We build it.</strong> We call 811 before we dig and send photo updates while we work.</li>
      <li><strong>Walkthrough.</strong> We walk the finished job with you and clean up before we leave.</li>
    </ol>
  </div></section>`;
  $$('.path-tile').forEach((b) => b.addEventListener('click', () => setPath(b.dataset.path)));
  $('[data-testid=path-back]')?.addEventListener('click', () => setPath(null));
  $$('a[href="#tool"]').forEach((l) => l.addEventListener('click', (e) => { e.preventDefault(); setPath(null); }));
  const form = $('[data-testid=address-form]');
  if (form) {
    form.addEventListener('submit', (e) => { e.preventDefault(); locate($('#addr').value); });
    $('[data-testid=use-demo]').addEventListener('click', () => { $('#addr').value = DEMO_ADDRESS.query; openEstimator({ label: DEMO_ADDRESS.label, lon: DEMO_ADDRESS.lon, lat: DEMO_ADDRESS.lat, source: 'public demo coordinates (not geocoded)' }); });
    $('[data-testid=use-describe]').addEventListener('click', () => { st.mode = 'describe'; openEstimator(st.geocode || { label: 'No address — step-by-step estimate', lon: DEMO_ADDRESS.lon, lat: DEMO_ADDRESS.lat, source: 'none' }); });
  }
  const dform = $('[data-testid=demo-form]');
  if (dform) dform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = (n) => (dform.querySelector(`[name=${n}]`)?.value || '').trim() || null;
    st.demoLead = { kind: 'demolition_consultation', name: val('name'), phone: val('phone'), email: val('email'), address: val('address'), what: val('what'), notes: val('notes'), requested_at: new Date().toISOString(), status: STATUS.notSent, sent: false, booked: false, delivery: 'pending' };
    $('#demo-out').innerHTML = `<p class="small light">Sending…</p>`;
    const d = await deliver(DELIVERY.forms.demo, { name: st.demoLead.name, phone: st.demoLead.phone, email: st.demoLead.email, address: st.demoLead.address, what: st.demoLead.what, notes: st.demoLead.notes });
    st.demoLead.sent = d.sent; st.demoLead.status = d.status; st.demoLead.delivery = d.mode;
    $('#demo-out').innerHTML = d.sent ? `<div class="lead-saved" data-testid="demo-sent"><strong>${esc(STATUS.sent)}</strong></div>` : demoSaved();
    if (!d.sent) downloadJson({ app: 'Atlas Instant Estimate v2 (private prototype)', brand: BRAND.name, request: st.demoLead, transmission: { sent: false, booked: false, status: STATUS.notSent } }, `atlas-demo-consultation-NOT-SENT-${Date.now()}.json`);
  });
}

async function locate(raw) {
  const status = $('[data-testid=address-status]');
  const v = validateAddress(raw);
  if (!v.ok) { status.textContent = v.error; status.dataset.state = 'error'; return; }
  status.textContent = 'Finding your property (U.S. Census geocoder)…'; status.dataset.state = 'loading';
  try {
    const j = await fetchJson(`/api/geocode?address=${encodeURIComponent(v.address)}`);
    if (!j || !j.matches || !j.matches.length) { status.textContent = 'We could not find that address. Check the house number and town, or use the step-by-step estimate.'; status.dataset.state = 'error'; return; }
    const m = j.matches[0];
    st.address = v.address;
    openEstimator({ label: m.address, lon: m.lon, lat: m.lat, source: 'U.S. Census Bureau geocoder (Public_AR_Current)' });
  } catch (e) { status.textContent = `Address lookup failed: ${e.message}`; status.dataset.state = 'error'; }
}

// ---------------- estimator ----------------
function openEstimator(geo) {
  st.geocode = geo; st.view = 'estimator'; st.lead = null;
  if (!st.service) st.mode = st.mode || 'map';
  renderEstimator();
}
function closeEstimator() { st.view = 'landing'; st.map = null; document.body.classList.remove('est-open'); renderLanding(); window.scrollTo(0, 0); }

function renderEstimator() {
  document.body.classList.add('est-open');
  $('#app').innerHTML = `
  <div class="est" data-testid="estimator" data-mode="${esc(st.mode)}">
    <aside class="est-panel" data-testid="est-panel">
      <header class="est-head">
        <img src="logo.svg" alt="Atlas" class="est-logo"><span class="est-title">Instant estimate</span>${testPill()}
        <button type="button" class="btn btn-ghost btn-sm" data-testid="est-close">Close</button>
      </header>
      <div class="est-addr"><strong data-testid="est-address">${esc(st.geocode.label)}</strong>${st.geocode.source === 'none' ? '' : `<span class="small">${esc(st.geocode.source)} · ${st.geocode.lat.toFixed(5)}, ${st.geocode.lon.toFixed(5)}</span>`}</div>
      <div class="est-body" id="est-body"></div>
      <footer class="est-foot small"><span>${esc(MAP.attribution)} ${esc(MAP.imageryNote)}</span><button type="button" class="link" data-testid="toggle-mode">${st.mode === 'map' ? 'Rather answer a few questions?' : 'Draw it on the map instead'}</button></footer>
    </aside>
    <div class="est-map" data-testid="est-map" ${st.mode === 'describe' ? 'hidden' : ''}><div class="amap-root" id="map-root"></div>
      <div class="view-toggle" role="radiogroup" aria-label="Map view"><button type="button" role="radio" aria-checked="false" data-view="3d" data-testid="view-3d">3D</button><button type="button" role="radio" aria-checked="true" class="on" data-view="top" data-testid="view-top">Top</button></div></div>
  </div>`;
  $('[data-testid=est-close]').addEventListener('click', closeEstimator);
  $('[data-testid=toggle-mode]').addEventListener('click', () => { st.mode = st.mode === 'map' ? 'describe' : 'map'; st.geometry = null; st.ground = { status: 'idle' }; renderEstimator(); });
  if (st.mode === 'map') {
    const prevShape = st.map ? st.map.getShape() : null;
    st.map = createMap($('#map-root'), {
      center: { lon: st.geocode.lon, lat: st.geocode.lat }, zoom: DEMO_ADDRESS.zoom,
      onChange: (g) => { st.geometry = g; st.groundRev++; st.ground = { status: 'idle' }; renderBody(); if (g) scheduleGround(); },
    });
    if (prevShape) st.map.setShape(prevShape);
    st.map.load();
    if (st.service) armFor(st.service);
    $$('.view-toggle button').forEach((b) => b.addEventListener('click', () => { st.map.set3D(b.dataset.view === '3d'); $$('.view-toggle button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); }));
  }
  renderBody();
}

function armFor(id) {
  if (!st.map) return;
  const svc = SERVICES[id];
  if (svc.geometry === 'rect') { const d = padDims(st.opts.size || 'custom', st.custom); st.map.arm('rect', { w_m: d.width_ft / 3.280839895, l_m: d.length_ft / 3.280839895 }); }
  else st.map.arm('line');
  st.map.setStatus(st.geometry ? svc.editPrompt : svc.prompt);
}

function quantities() {
  const g = st.geometry;
  if (st.mode === 'describe') {
    const svc = SERVICES[st.service];
    if (svc.geometry === 'rect') { const d = padDims(st.opts.size || '12x16', st.custom); return { area_sqft: d.width_ft * d.length_ft, width_ft: d.width_ft, length_ft: d.length_ft, gradePct: null, source: 'entered' }; }
    const L = Number(st.custom.length_ft); return { length_ft: Number.isFinite(L) && L > 0 ? L : 0, gradePct: null, source: 'entered' };
  }
  if (!g) return null;
  const grade = st.ground.status === 'available' ? st.ground.avgPct : null;
  if (g.kind === 'rect') return { area_sqft: g.area_sqft, width_ft: g.width_ft, length_ft: g.length_ft, gradePct: grade, source: 'drawn' };
  return { length_ft: g.length_ft, gradePct: grade, source: 'drawn' };
}

function renderBody() {
  const body = $('#est-body'); if (!body) return;
  if (!st.service) {
    body.innerHTML = `<h2 class="h-bebas">What are we building?</h2>
      <div class="tiles" data-testid="tiles">${SERVICE_ORDER.map((id) => { const s = SERVICES[id]; return `<button type="button" class="tile" data-service="${id}" data-testid="tile-${id}"><span class="tile-ico">${ICONS[s.icon]}</span><strong>${esc(s.label)}</strong><span>${esc(s.blurb)}</span></button>`; }).join('')}</div>
      <ol class="steps small"><li><strong>Pick the job.</strong> Drainage, a driveway, a culvert or a gravel pad.</li><li><strong>${st.mode === 'map' ? 'Draw it on the aerial.' : 'Enter the size.'}</strong> We measure it in feet${st.mode === 'map' ? ' and read the ground from USGS lidar' : ''}.</li><li><strong>See your range.</strong> Lock it in with a free site visit. We confirm everything on site before you sign.</li></ol>`;
    $$('.tile', body).forEach((t) => t.addEventListener('click', () => { st.service = t.dataset.service; st.opts = Object.fromEntries(SERVICES[st.service].options.map((o) => [o.id, o.default])); st.geometry = null; st.ground = { status: 'idle' }; if (st.map) { st.map.clear(); armFor(st.service); } renderBody(); }));
    return;
  }
  const svc = SERVICES[st.service];
  const q = quantities();
  const r = q ? evaluate(st.service, st.opts, q) : null;
  const lengthOk = !(svc.maxLengthFt && q && q.length_ft > svc.maxLengthFt);
  body.innerHTML = `
    <div class="svc-head"><span class="tile-ico">${ICONS[svc.icon]}</span><h2 class="h-bebas">${esc(svc.label)}</h2><button type="button" class="link" data-testid="change-service">Change</button></div>
    ${st.mode === 'map' ? `<p class="prompt" data-testid="prompt">${esc(st.geometry ? svc.editPrompt : svc.prompt)}</p>` : ''}
    ${svc.options.map((o) => `<div class="opt"><span class="opt-label">${esc(o.label)}</span><div class="seg-row" role="radiogroup" aria-label="${esc(o.label)}">${o.choices.map((c) => `<button type="button" role="radio" aria-checked="${st.opts[o.id] === c.id}" class="seg-btn${st.opts[o.id] === c.id ? ' on' : ''}" data-opt="${o.id}" data-val="${c.id}" data-testid="opt-${o.id}-${c.id}">${esc(c.label)}</button>`).join('')}</div></div>`).join('')}
    ${svc.geometry === 'rect' && st.opts.size === 'custom' ? `<div class="opt two"><label>Width (ft)<input type="text" inputmode="decimal" data-custom="width_ft" data-testid="custom-width" value="${esc(st.custom.width_ft)}"></label><label>Length (ft)<input type="text" inputmode="decimal" data-custom="length_ft" data-testid="custom-length" value="${esc(st.custom.length_ft)}"></label></div>` : ''}
    ${st.mode === 'describe' && svc.geometry === 'line' ? `<div class="opt"><label>Length (ft)<input type="text" inputmode="decimal" data-custom="length_ft" data-testid="custom-length" value="${esc(st.custom.length_ft)}"></label></div>` : ''}
    ${st.mode === 'map' ? `<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-testid="undo">Undo</button><button type="button" class="btn btn-ghost btn-sm" data-testid="clear">Clear</button>${svc.geometry === 'rect' && st.geometry ? `<label class="rot">Rotate <input type="range" min="0" max="179" value="${st.geometry.rot_deg || 0}" data-testid="rotate"></label>` : ''}</div>` : ''}
    ${!lengthOk ? `<p class="warn" data-testid="length-warn">That is ${fmtNum(q.length_ft)} ft — longer than a culvert we would price online (max ${svc.maxLengthFt} ft). Shorten the line or ask for a site visit.</p>` : ''}
    ${q && r && lengthOk ? `
    <div class="qty" data-testid="quantities">
      ${q.length_ft ? `<div><span>Length</span><strong>${fmtNum(q.length_ft)} ft</strong></div>` : ''}
      ${q.width_ft ? `<div><span>Width</span><strong>${fmtNum(q.width_ft)} ft</strong></div>` : ''}
      ${q.area_sqft ? `<div><span>Area</span><strong>${fmtNum(q.area_sqft)} sq ft</strong></div>` : ''}
      <div><span>Ground</span><strong data-testid="ground-summary">${groundSummary()}</strong></div>
      <details><summary>What's included</summary><ul class="small">${r.included.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="small"><strong>Not included:</strong> ${esc(r.excluded.join('; '))}.</p></details>
    </div>
    ${groundCard()}
    <div class="price" data-testid="price">
      <span class="price-label">Your price range ${IS_TEST ? '<span class="test-pill">TEST</span>' : ''}</span>
      <div class="price-range"><strong data-testid="price-low">${money(r.low)}</strong><span>to</span><strong data-testid="price-high">${money(r.high)}</strong></div>
      <p>Most jobs like this land around <strong data-testid="price-typical">${money(r.typical)}</strong>. About ${money(r.unitPrice)} per ${esc(r.unitLabel)}.${r.minimumApplied ? ' Job minimum applied.' : ''}</p>
      <details><summary>How this test number is built</summary><ul class="small">${r.lines.map((l) => `<li>${esc(l.label)}: ${money(l.amount)}</li>`).join('')}</ul><p class="small">Range = typical −10% / +20%, rounded to $50. Rates version ${esc(r.rateVersion)}.</p></details>
      <button type="button" class="btn btn-primary btn-block" data-testid="lock-in"><span>Lock in your price</span><small>Free site visit</small></button>
      <p class="small">${esc(statusText())}</p>
      <button type="button" class="link" data-testid="download-estimate">Download this estimate (JSON, stays on your device)</button>
    </div>` : `<p class="hint" data-testid="no-geometry">${st.mode === 'map' ? (svc.geometry === 'rect' ? 'Tap the map to place the pad.' : 'Tap the map to start drawing. You need at least two points.') : 'Enter a size to see a range.'}</p>`}
    ${st.lead ? leadSaved() : ''}`;
  // bindings
  $('[data-testid=change-service]').addEventListener('click', () => { st.service = null; st.geometry = null; st.ground = { status: 'idle' }; if (st.map) { st.map.clear(); st.map.arm(null); st.map.setStatus(''); } renderBody(); });
  $$('.seg-btn', body).forEach((b) => b.addEventListener('click', () => { st.opts[b.dataset.opt] = b.dataset.val; if (svc.geometry === 'rect' && b.dataset.opt === 'size') applyRect(); renderBody(); }));
  $$('input[data-custom]', body).forEach((i) => i.addEventListener('input', () => { st.custom[i.dataset.custom] = i.value; if (svc.geometry === 'rect') applyRect(); renderBody(); if (i.dataset.custom === 'width_ft') $('[data-testid=custom-width]')?.focus(); else $('[data-testid=custom-length]')?.focus(); setCaret(i.dataset.custom === 'width_ft' ? $('[data-testid=custom-width]') : $('[data-testid=custom-length]')); }));
  $('[data-testid=undo]')?.addEventListener('click', () => st.map && st.map.undo());
  $('[data-testid=clear]')?.addEventListener('click', () => st.map && st.map.clear());
  $('[data-testid=rotate]')?.addEventListener('input', (e) => st.map && st.map.setRect({ rot_deg: Number(e.target.value) }));
  $('[data-testid=lock-in]')?.addEventListener('click', () => renderLead(r, q));
  $('[data-testid=download-estimate]')?.addEventListener('click', () => downloadJson(buildEstimate(r, q), `atlas-${IS_TEST ? 'TEST-' : ''}estimate-${st.service}-${Date.now()}.json`));
  if (st.map && st.service) st.map.setStatus(st.geometry ? svc.editPrompt : svc.prompt);
}
function setCaret(el) { if (el) { const n = el.value.length; try { el.setSelectionRange(n, n); } catch (_) { /* ignore */ } } }
function applyRect() { if (!st.map) return; const d = padDims(st.opts.size || 'custom', st.custom); const patch = { w_m: d.width_ft / 3.280839895, l_m: d.length_ft / 3.280839895 }; st.map.setRect(patch); armFor(st.service); }

// ---------------- ground (USGS EPQS via local proxy) ----------------
function groundSummary() {
  const g = st.ground;
  if (st.mode === 'describe') return 'not read (no drawing)';
  if (g.status === 'available') return `${g.drop_ft >= 0 ? 'rises' : 'drops'} ${Math.abs(g.drop_ft).toFixed(1)} ft · avg ${Math.abs(g.avgPct).toFixed(1)}%`;
  if (g.status === 'loading') return 'reading USGS lidar…';
  if (g.status === 'too-short') return 'too short to read';
  if (g.status === 'unavailable') return 'unavailable';
  return '—';
}
function groundCard() {
  const g = st.ground;
  if (st.mode === 'describe') return '';
  if (g.status === 'loading') return `<div class="ground" data-testid="ground" data-state="loading"><p>Reading the ground from USGS terrain…</p></div>`;
  if (g.status === 'too-short') return `<div class="ground" data-testid="ground" data-state="too-short"><p>Too short to read a slope (needs ${MAP.gradeMinSeparationM} m end to end). Priced without a ground modifier.</p></div>`;
  if (g.status === 'unavailable') return `<div class="ground" data-testid="ground" data-state="unavailable"><p>Ground data unavailable (${esc(g.message)}). Priced without a ground modifier — no terrain was assumed. <button type="button" class="link" data-testid="ground-retry">Try again</button></p></div>`;
  if (g.status !== 'available') return `<div class="ground" data-testid="ground" data-state="idle"></div>`;
  const W = 300, H = 90, pad = 8;
  const xs = g.samples.map((s) => s.dist_m), ys = g.samples.map((s) => s.elev_ft);
  const minY = Math.min(...ys), maxY = Math.max(...ys), span = Math.max(maxY - minY, 1), maxX = Math.max(...xs, 1);
  const pts = g.samples.map((s) => `${(pad + (s.dist_m / maxX) * (W - 2 * pad)).toFixed(1)},${(H - pad - ((s.elev_ft - minY) / span) * (H - 2 * pad)).toFixed(1)}`);
  const vscale = Math.round((maxX * 3.280839895) / span);
  return `<div class="ground" data-testid="ground" data-state="available">
    <p><strong>${g.drop_ft >= 0 ? 'Rises' : 'Drops'} ${Math.abs(g.drop_ft).toFixed(1)} ft</strong> ${g.kind === 'rect' ? 'across the pad' : `start to end over ${Math.round(mToFt(g.length_m))} ft`}. Average <strong>${Math.abs(g.avgPct).toFixed(1)}%</strong>${g.steepestPct !== null ? `, steepest <strong>${g.steepestPct.toFixed(1)}%</strong>` : ''}.</p>
    <svg viewBox="0 0 ${W} ${H}" class="profile" role="img" aria-label="Ground profile"><polyline points="${pts.join(' ')}" fill="none"/><text x="${pad}" y="${H - 1}" class="axis">${g.kind === 'rect' ? 'W' : 'Start'}</text><text x="${W - pad}" y="${H - 1}" class="axis" text-anchor="end">${g.kind === 'rect' ? 'E' : 'End'}</text><text x="${W - pad}" y="10" class="axis" text-anchor="end">vertical ×${vscale}</text></svg>
    <p class="small">${esc(g.source || 'USGS 3DEP')}${g.date ? `, DEM ${esc(g.date)}` : ''}${g.resolution_m && g.resolution_m !== 'tile' ? `, ${esc(g.resolution_m)} m` : ''}. ${g.samples.length} samples. Not survey accuracy.</p></div>`;
}
let groundTimer = null;
function scheduleGround() { clearTimeout(groundTimer); groundTimer = setTimeout(readGround, 400); }
async function readGround() {
  const g = st.geometry; if (!g || st.mode !== 'map') return;
  const rev = ++st.groundRev;
  let samples = [];
  if (g.kind === 'line') {
    if (g.points.length < 2) return;
    if (g.length_m < MAP.gradeMinSeparationM) { st.ground = { status: 'too-short' }; renderBody(); return; }
    const n = Math.min(MAP.profileSamples, Math.max(2, Math.floor(g.length_m / MAP.profileMinSpacingM) + 1));
    samples = sampleAlong(g.points, n);
  } else {
    const c = g.corners; const center = g.center;
    const diag = Math.max(haversineM(c[0], c[1]), haversineM(c[1], c[2]));
    if (diag < MAP.gradeMinSeparationM / 2) { st.ground = { status: 'too-short' }; renderBody(); return; }
    // W → center → E across the pad (3 samples) keeps it fast
    const w = { lon: (c[0].lon + c[3].lon) / 2, lat: (c[0].lat + c[3].lat) / 2 }, e = { lon: (c[1].lon + c[2].lon) / 2, lat: (c[1].lat + c[2].lat) / 2 };
    samples = [{ ...w, dist_m: 0 }, { ...center, dist_m: haversineM(w, center) }, { ...e, dist_m: haversineM(w, e) }];
  }
  st.ground = { status: 'loading' }; renderBody();
  try {
    let elev = null, source = '', date = null, resolution_m = null;
    const fromTiles = st.map && st.map.sampleElevation ? st.map.sampleElevation(samples) : null;
    if (fromTiles && fromTiles.every((v) => Number.isFinite(v))) {
      elev = fromTiles; source = 'Tilezen terrain tiles (USGS 3DEP), read in the browser'; resolution_m = 'tile';
    } else {
      const res = await Promise.all(samples.map((s) => fetchJson(`/api/elevation?x=${s.lon.toFixed(7)}&y=${s.lat.toFixed(7)}`)));
      if (rev !== st.groundRev) return; // stale
      const bad = res.find((j) => !j || !Number.isFinite(j.elevation_m));
      if (bad) throw new Error((bad && bad.error) || 'no elevation value returned');
      elev = res.map((j) => j.elevation_m); source = 'USGS EPQS (3DEP) via local proxy'; date = res[0].date || null; resolution_m = res[0].resolution_m ?? null;
    }
    if (rev !== st.groundRev) return;
    const pts = samples.map((s, i) => ({ dist_m: round(s.dist_m, 1), elev_m: round(elev[i], 3), elev_ft: round(mToFt(elev[i]), 2) }));
    const len = pts[pts.length - 1].dist_m - pts[0].dist_m;
    const drop_ft = pts[pts.length - 1].elev_ft - pts[0].elev_ft;
    let steepest = null;
    for (let i = 1; i < pts.length; i++) { const d = pts[i].dist_m - pts[i - 1].dist_m; if (d > 0) { const s = Math.abs((pts[i].elev_m - pts[i - 1].elev_m) / d) * 100; steepest = steepest === null ? s : Math.max(steepest, s); } }
    st.ground = { status: 'available', kind: g.kind, samples: pts, length_m: len, drop_ft: round(drop_ft, 2), avgPct: round((drop_ft / mToFt(len)) * 100, 2), steepestPct: steepest === null ? null : round(steepest, 2), date, resolution_m, source, pricing_effect: 'slope class modifier (test)' };
  } catch (e) {
    if (rev !== st.groundRev) return;
    st.ground = { status: 'unavailable', message: e.message };
  }
  renderBody();
  $('[data-testid=ground-retry]')?.addEventListener('click', readGround);
}
function sampleAlong(points, n) {
  const segs = []; let total = 0;
  for (let i = 1; i < points.length; i++) { const d = haversineM(points[i - 1], points[i]); segs.push({ a: points[i - 1], b: points[i], d, start: total }); total += d; }
  const out = [];
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    const s = segs.find((x) => target <= x.start + x.d + 1e-9) || segs[segs.length - 1];
    const t = s.d > 0 ? (target - s.start) / s.d : 0;
    out.push({ lon: s.a.lon + (s.b.lon - s.a.lon) * t, lat: s.a.lat + (s.b.lat - s.a.lat) * t, dist_m: target });
  }
  return out;
}

// ---------------- estimate JSON + lead (local only) ----------------
function buildEstimate(r, q) {
  return {
    app: 'Atlas Instant Estimate v2 (private prototype)', generated_at: new Date().toISOString(), status: statusText(), test: IS_TEST, binding: false, guaranteed: false,
    brand: BRAND.name, property: st.geocode, mode: st.mode, service: st.service, options: st.opts, quantities: q, geometry: st.geometry, ground: st.ground, pricing: r,
    map: st.map ? st.map.getView() : null, rates: { version: TEST_RATES.version, note: 'FICTIONAL TEST RATES' },
    transmission: { sent: false, booked: false, status: STATUS.notSent, note: 'Local download only. No form submission, email, calendar or CRM.' },
    site_visit_request: st.lead,
  };
}
function downloadJson(obj, name) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function leadSaved() { return `<div class="lead-saved" data-testid="lead-saved"><strong>${esc(STATUS.notSent)}</strong> — your request was saved to your device only. Nothing was transmitted.</div>`; }
function renderLead(r, q) {
  const body = $('#est-body');
  body.innerHTML = `
    <h2 class="h-bebas">Lock in your price</h2>
    <p>Book a free site visit. We walk the property with you, mark out the work and send a written scope with a locked price.</p>
    <div class="summary" data-testid="lead-summary"><span>${esc(SERVICES[st.service].label)}, price range${IS_TEST ? ' (TEST)' : ''}</span><strong>${money(r.low)} to ${money(r.high)}</strong></div>
    ${isProduction() ? '' : `<div class="not-sent" data-testid="not-sent-banner">${esc(STATUS.notSent)}</div>`}
    <p class="small">${isProduction() ? 'We use your details only to set up the visit and send your price.' : 'Private prototype: this form does not send anything. It only saves a JSON file to your device. All fields optional.'}</p>
    <form data-testid="lead-form" novalidate>
      <div class="two"><label>Your name<input type="text" name="name" data-testid="lead-name" autocomplete="off"></label><label>Mobile phone<input type="text" name="phone" data-testid="lead-phone" autocomplete="off"></label></div>
      <label>Email <em>(optional if you gave a phone)</em><input type="text" name="email" data-testid="lead-email" autocomplete="off"></label>
      <div class="opt"><span class="opt-label">Best way to reach you</span><div class="seg-row">${LEAD_FORM.contact.map((c, i) => `<button type="button" class="seg-btn${i === 0 ? ' on' : ''}" data-lead="contact" data-val="${c.id}">${esc(c.label)}</button>`).join('')}</div></div>
      <label>Property address<input type="text" name="address" data-testid="lead-address" value="${esc(st.geocode.label)}"></label>
      <div class="opt"><span class="opt-label">When do you want it done?</span><div class="seg-row">${LEAD_FORM.timing.map((c, i) => `<button type="button" class="seg-btn${i === 0 ? ' on' : ''}" data-lead="timing" data-val="${c.id}">${esc(c.label)}</button>`).join('')}</div></div>
      <label>Anything we should know? <em>(optional)</em><textarea name="notes" rows="3" placeholder="Gate codes, where to park, the best time to visit." data-testid="lead-notes"></textarea></label>
      <div class="btn-row between"><button type="button" class="link" data-testid="back-to-price">Back to my price</button><button type="submit" class="btn btn-primary" data-testid="lead-save">${isProduction() ? 'Book my free site visit' : `Save request to my device — ${esc(STATUS.notSent)}`}</button></div>
      <p class="small">By sending this you would agree Atlas can call and text you about your request. In this prototype nothing is sent. We use your details only to set up the visit and send your price. No spam, no selling your info.</p>
    </form>
    <div id="lead-out"></div>`;
  const picks = { contact: LEAD_FORM.contact[0].id, timing: LEAD_FORM.timing[0].id };
  $$('[data-lead]', body).forEach((b) => b.addEventListener('click', () => { picks[b.dataset.lead] = b.dataset.val; $$(`[data-lead=${b.dataset.lead}]`, body).forEach((x) => x.classList.toggle('on', x === b)); }));
  $('[data-testid=back-to-price]').addEventListener('click', renderBody);
  $('[data-testid=lead-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target; const val = (n) => (f.querySelector(`[name=${n}]`)?.value || '').trim() || null;
    st.lead = { name: val('name'), phone: val('phone'), email: val('email'), contact: picks.contact, address: val('address'), timing: picks.timing, notes: val('notes'), requested_at: new Date().toISOString(), status: STATUS.notSent, sent: false, booked: false, delivery: 'pending' };
    const est = buildEstimate(r, q);
    $('#lead-out').innerHTML = `<p class="small">Sending…</p>`;
    const d = await deliver(DELIVERY.forms.lead, { name: st.lead.name, phone: st.lead.phone, email: st.lead.email, contact: st.lead.contact, address: st.lead.address, timing: st.lead.timing, notes: st.lead.notes, service: SERVICES[st.service].label, price_low: String(r.low), price_high: String(r.high), price_typical: String(r.typical), quantities: JSON.stringify(q), property: st.geocode.label, estimate_json: JSON.stringify(est) });
    st.lead.sent = d.sent; st.lead.status = d.status; st.lead.delivery = d.mode; est.site_visit_request = st.lead; est.transmission = { sent: d.sent, booked: false, status: d.status, note: d.sent ? 'Submitted via Netlify Forms; emailed to Atlas.' : 'Not transmitted.' };
    $('#lead-out').innerHTML = `${d.sent ? `<div class="lead-saved" data-testid="lead-sent"><strong>${esc(STATUS.sent)}</strong></div>` : leadSaved()}<details${d.sent ? '' : ' open'}><summary>Request JSON</summary><pre data-testid="lead-json">${esc(JSON.stringify(est, null, 2))}</pre></details>`;
    if (!d.sent) downloadJson(est, `atlas-site-visit-request-NOT-SENT-${Date.now()}.json`);
  });
}

// ---------------- boot ----------------
if (!isAllowedHostname(location.hostname)) {
  $('#app').innerHTML = `<div class="blocked" data-testid="blocked">This estimator only runs on deployatlas.com or a local preview. Current host: ${esc(location.hostname)}.</div>`;
} else {
  renderLanding();
  $$('.action-bar a[href="#tool"], .topbar a[href="#tool"]').forEach((l) => l.addEventListener('click', (e) => { e.preventDefault(); if (st.view !== 'landing') closeEstimator(); setPath(null); }));
}
