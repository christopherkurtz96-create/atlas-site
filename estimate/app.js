// Atlas Get My Price. Questions first, one at a time; drawing the job on an aerial map is the second option.
// One lead form for both paths (Netlify "site-visit-request") plus the general contact form at the bottom.
import { BRAND, TEST_BADGE, IS_TEST, STATUS, DELIVERY, REGION, MAP, SERVICES, SERVICE_ORDER, TYPICAL_SCENARIOS, LEAD_FORM, TEST_RATES, DEMO_FLOW } from './config.mjs';
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
  view: 'landing', path: null, step: 0,
  demo: { what: null, size: null, after: null },
  service: null, opts: {}, custom: { width_ft: '20', length_ft: '20' }, lengthFt: '',
  address: '', geocode: null,            // geocode: { label, lon, lat, source, approx }
  lead: { timing: null, name: '', phone: '', email: '', contact: null, notes: '' },
  mapPrice: null,                        // { r, q, est } when the price was locked in from a drawing
  mapAsk: false,                         // asking for the address so the map can open
  sending: false, sent: null,
  geometry: null, ground: { status: 'idle' }, groundRev: 0, map: null, mode: 'map',
};

const isProduction = () => DELIVERY.productionHosts.includes(location.hostname) || location.hostname.endsWith(DELIVERY.previewHostSuffix);
const track = (name, params) => { try { if (typeof window.gtag === 'function') window.gtag('event', name, { page_path: location.pathname, ...params }); } catch (e) { /* analytics never blocks a lead */ } };
// Netlify Forms AJAX submit (production only). `copies` runs first and never blocks the form. Returns { sent, status }.
async function deliver(formName, fields, copies) {
  if (!isProduction()) return { sent: false, status: STATUS.notSent, mode: 'local-only (not the production host)' };
  try { if (copies) copies(); } catch (e) { /* Netlify Forms is still the record */ }
  const body = new URLSearchParams({ 'form-name': formName, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])) });
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

// ---------------- address: suggestions while typing + lookup ----------------
const cleanAddress = (s) => String(s || '').replace(/[^A-Za-z0-9 ,.#'\-/]/g, ' ').replace(/\s+/g, ' ').trim();
const hasCoords = () => Boolean(st.geocode && Number.isFinite(st.geocode.lon) && Number.isFinite(st.geocode.lat));
// The Census lookup needs a town plus state, or a ZIP. Everyone we serve is in Missouri, so add the state when it
// is missing, and when no town was typed either, try Columbia, where most of our jobs are.
const TOWN_AT_END = /\b(columbia|ashland|hallsville|centralia|sturgeon|harrisburg|rocheport|hartsburg|fulton|jefferson city|holts summit|new bloomfield|auxvasse|kingdom city|millersburg|boonville|new franklin|fayette|glasgow|mexico|moberly|california|tipton)\s*$/i;
function censusCandidates(text) {
  const t = cleanAddress(text); if (!t) return [];
  if (/\d{5}(-\d{4})?\s*$/.test(t) || /\b(MO|Missouri)\b/i.test(t)) return [t];
  return t.includes(',') || TOWN_AT_END.test(t) ? [`${t}, MO`] : [`${t}, Columbia, MO`, `${t}, MO`];
}
// "7401 E HIGHWAY WW, COLUMBIA, MO, 65201" -> "7401 E Highway WW, Columbia, MO 65201"
function tidyCensus(a) {
  const parts = String(a || '').split(',').map((x) => x.trim()).filter(Boolean);
  const title = (w) => (/^\d/.test(w) || (w.length <= 2 && !/^(ST|RD|DR|LN|CT|PL)$/.test(w)) ? w : w.charAt(0) + w.slice(1).toLowerCase());
  const nice = parts.map((part, i) => (i >= 2 ? part : part.split(' ').map(title).join(' ')));
  return nice.length >= 4 ? `${nice[0]}, ${nice[1]}, ${nice[2]} ${nice[3]}` : nice.join(', ');
}
// With only a state to go on, the Census geocoder will happily match the same street in a town across Missouri.
const inArea = (m) => m.lon >= REGION.area[0] && m.lat >= REGION.area[1] && m.lon <= REGION.area[2] && m.lat <= REGION.area[3];
// First Census match for any of the candidate address strings, or null. `areaOnly` keeps to the service area.
async function censusLookup(candidates, signal, areaOnly = true) {
  for (const c of candidates) {
    const v = validateAddress(cleanAddress(c)); if (!v.ok) continue;
    try {
      const r = await fetch(`/api/geocode?address=${encodeURIComponent(v.address)}`, { signal, credentials: 'omit' });
      const j = await r.json(); const m = ((j && j.matches) || []).find((x) => !areaOnly || inArea(x));
      if (m) return { label: tidyCensus(m.address), lon: m.lon, lat: m.lat, exact: true };
    } catch (e) { if (signal && signal.aborted) return null; }
  }
  return null;
}
// "1204 W Broadway, Columbia, MO 65203" and "1204 West Broadway, Columbia, MO" are the same address.
const LONG = { n: 'north', s: 'south', e: 'east', w: 'west', st: 'street', rd: 'road', dr: 'drive', ln: 'lane', ct: 'court', ave: 'avenue', blvd: 'boulevard', hwy: 'highway', pkwy: 'parkway', pl: 'place', cir: 'circle', ter: 'terrace', trl: 'trail', rte: 'route' };
const canon = (label) => String(label).toLowerCase().replace(/\b\d{5}\b\s*$/, '').split(/[^a-z0-9]+/).filter(Boolean).map((w) => LONG[w] || w).join(' ');

function attachSuggest(input, list, onPick) {
  let timer = null, timer2 = null, ctl = null, items = [], active = -1, lastQ = '';
  const close = () => { items = []; active = -1; list.innerHTML = ''; list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
  const paint = () => {
    list.innerHTML = items.map((s, i) => `<li role="option" id="sg-${i}" data-i="${i}" class="${i === active ? 'on' : ''}" aria-selected="${i === active}" data-testid="suggestion">${esc(s.label)}</li>`).join('');
    list.hidden = !items.length; input.setAttribute('aria-expanded', String(items.length > 0));
    if (active >= 0) input.setAttribute('aria-activedescendant', `sg-${active}`); else input.removeAttribute('aria-activedescendant');
  };
  const pick = (i) => { const s = items[i]; if (!s) return; input.value = s.label; close(); onPick(s); };
  input.addEventListener('input', () => {
    onPick(null);                                   // typed text no longer matches a picked address
    clearTimeout(timer); clearTimeout(timer2);
    if (ctl) ctl.abort();
    items.forEach((s) => { s.stale = true; });         // still shown until fresh results land, never kept past them
    const q = cleanAddress(input.value);
    if (q.replace(/^\d+[A-Za-z]?\s+/, '').length < 3 || q.length > 120) { close(); return; }
    const mine = new AbortController(); ctl = mine; lastQ = q;
    const live = () => lastQ === q && !mine.signal.aborted && document.activeElement === input;
    // Street names, fast.
    const streets = async (again) => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(q)}${again ? '&retry=1' : ''}`, { signal: mine.signal, credentials: 'omit' });
        const j = await r.json();
        if (!live()) return;
        if (j.error) { if (!again) timer = setTimeout(() => streets(true), 800); return; }   // lookup hiccup: keep what is showing, try once more
        const top = items.filter((s) => s.census && !s.stale);
        items = [...top, ...(Array.isArray(j.suggestions) ? j.suggestions : []).filter((s) => !top.some((t) => canon(t.label) === canon(s.label)))].slice(0, 6); active = -1; paint();
      } catch (e) { /* aborted, offline or unavailable: typing still works */ }
    };
    timer = setTimeout(() => streets(false), 280);
    // The exact address from the Census geocoder, once a house number and street are typed and the typing pauses.
    if (/^\d+[A-Za-z]?\s+\S+\s+\S{2,}/.test(q)) timer2 = setTimeout(async () => {
      const hit = await censusLookup(censusCandidates(q), mine.signal);
      if (!live()) return;
      if (!hit) { if (items.some((s) => s.census)) { items = items.filter((s) => !s.census); active = -1; paint(); } return; }
      items = [{ ...hit, census: true }, ...items.filter((s) => !s.census && canon(s.label) !== canon(hit.label))].slice(0, 6); active = -1; paint();
    }, 650);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = active <= 0 ? items.length - 1 : active - 1; paint(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape') close();
  });
  list.addEventListener('mousedown', (e) => { const li = e.target.closest('li'); if (li) { e.preventDefault(); pick(Number(li.dataset.i)); } });
  input.addEventListener('blur', () => setTimeout(close, 180));
}

// Exact coordinates for the map. Tries the Census geocoder; falls back to the street-level point from a suggestion.
async function refineAddress() {
  if (hasCoords() && !st.geocode.approx) return true;
  const tries = st.geocode && st.geocode.lookups && st.geocode.lookups.length ? st.geocode.lookups : censusCandidates(st.address);
  const hit = (await censusLookup(tries)) || (await censusLookup(tries, undefined, false));   // someone outside the area still gets their map
  if (hit) { st.geocode = { label: (st.geocode && st.geocode.label) || hit.label, lon: hit.lon, lat: hit.lat, source: 'U.S. Census Bureau geocoder', approx: false }; return true; }
  return hasCoords();
}

// ---------------- wizard: one question per screen ----------------
const LEAD_STEPS = ['timing', 'name', 'phone', 'contact', 'notes'];
function steps() {
  if (st.path === 'demo') {
    const s = ['what'];
    if (!st.demo.what || DEMO_FLOW.size[st.demo.what]) s.push('size');
    if (st.demo.what !== 'other') s.push('after');
    return [...s, 'address', ...LEAD_STEPS];
  }
  const s = ['service'];
  if (st.service) {
    const svc = SERVICES[st.service];
    svc.options.forEach((o) => s.push(`opt:${o.id}`));
    if (svc.geometry === 'rect') { if (st.opts.size === 'custom') s.push('dims'); } else s.push('length');
  } else s.push('opt:?', 'opt:?', 'length');     // placeholders so the progress bar starts at a fair length
  return [...s, 'address', 'price', ...LEAD_STEPS];
}
const stepId = () => steps()[Math.min(st.step, steps().length - 1)];
function goTo(id) { const i = steps().indexOf(id); if (i >= 0) st.step = i; renderCard(true); }
function next() { st.step = Math.min(st.step + 1, steps().length - 1); renderCard(true); }
function back() {
  if (st.mapAsk) { st.mapAsk = false; renderCard(true); return; }
  if (st.step === 0) { st.path = null; renderCard(true); return; }
  st.step -= 1; renderCard(true);
}
function startPath(p) { if (st.path !== p) st.step = 0; st.path = p; st.sent = null; st.mapAsk = false; renderCard(true); }
function resetAll() {
  Object.assign(st, { path: null, step: 0, demo: { what: null, size: null, after: null }, service: null, opts: {}, custom: { width_ft: '20', length_ft: '20' }, lengthFt: '', mapPrice: null, mapAsk: false, sending: false, sent: null, geometry: null, ground: { status: 'idle' } });
  st.lead.notes = '';
  renderCard(true);
}

const choiceLabel = (choices, id) => (choices.find((c) => c.id === id) || {}).label || '';
const demoWhat = () => DEMO_FLOW.what.find((w) => w.id === st.demo.what) || null;
const demoSize = () => DEMO_FLOW.size[st.demo.what] || null;
const demoAfter = () => DEMO_FLOW.after[st.demo.what] || DEMO_FLOW.after.default;

// Quantities from typed answers (no drawing, so no ground reading).
function answeredQuantities() {
  const svc = SERVICES[st.service]; if (!svc) return null;
  if (svc.geometry === 'rect') { const d = padDims(st.opts.size || '12x16', st.custom); return { area_sqft: d.width_ft * d.length_ft, width_ft: d.width_ft, length_ft: d.length_ft, gradePct: null, source: 'entered' }; }
  const L = Number(st.lengthFt);
  return { length_ft: Number.isFinite(L) && L > 0 ? L : 0, gradePct: null, source: 'entered' };
}
function currentPrice() {
  if (st.mapPrice) return st.mapPrice;
  const q = answeredQuantities(); const r = q ? evaluate(st.service, st.opts, q) : null;
  return r ? { r, q, est: null } : null;
}
// Short line of what has been answered so far.
function trail() {
  const parts = [];
  if (st.path === 'demo') {
    const w = demoWhat(); if (w) parts.push(w.label);
    if (demoSize() && st.demo.size) parts.push(choiceLabel(demoSize().choices, st.demo.size));
    if (st.demo.after && st.demo.what !== 'other') parts.push(choiceLabel(demoAfter().choices, st.demo.after));
  } else if (st.service) {
    const svc = SERVICES[st.service]; const ids = steps(); const upTo = st.step;
    parts.push(svc.label);
    svc.options.forEach((o) => { const i = ids.indexOf(`opt:${o.id}`); if (i >= 0 && i < upTo) parts.push(choiceLabel(o.choices, st.opts[o.id])); });
    const li = ids.indexOf('length'); if (li >= 0 && li < upTo && Number(st.lengthFt) > 0) parts.push(`${fmtNum(Number(st.lengthFt))} ft`);
  }
  return parts.length ? `<p class="wiz-trail" data-testid="wiz-trail">${parts.map(esc).join(' · ')}</p>` : '';
}

const choicesHtml = (choices, current) => `<div class="choices" role="radiogroup">${choices.map((c) => `<button type="button" role="radio" aria-checked="${current === c.id}" class="choice${current === c.id ? ' on' : ''}" data-val="${esc(c.id)}" data-testid="choice-${esc(c.id)}"><strong>${esc(c.label)}</strong>${c.hint ? `<span>${esc(c.hint)}</span>` : ''}</button>`).join('')}</div>`;
const continueBtn = (label = 'Continue', small = '') => `<p class="wiz-err" data-testid="wiz-err" aria-live="polite"></p><button type="submit" class="btn btn-primary btn-block" data-testid="wiz-next"><span>${esc(label)}</span>${small ? `<small>${esc(small)}</small>` : ''}</button>`;
const mapLink = (text = 'Rather draw it on a map of your property?') => `<p class="wiz-alt"><button type="button" class="link" data-testid="use-map">${esc(text)}</button></p>`;

// Each step returns { q, help, body, alt }.
function stepView(id) {
  if (st.mapAsk) return {
    q: 'What is the property address?', help: 'We pull up the aerial photo of the property so you can draw the job on it.',
    body: `<form class="wiz-form" data-testid="address-form" novalidate>${addressField()}${continueBtn('Show my property')}</form>`,
  };
  if (id === 'what') return { q: 'What is coming down?', body: `<div class="tiles" data-testid="tiles">${DEMO_FLOW.what.map((w) => `<button type="button" class="tile${st.demo.what === w.id ? ' on' : ''}" data-val="${w.id}" data-testid="tile-${w.id}"><strong>${esc(w.label)}</strong><span>${esc(w.blurb)}</span></button>`).join('')}</div>` };
  if (id === 'size') { const s = demoSize(); return { q: s.ask, help: 'A rough answer is fine. We measure on site.', body: choicesHtml(s.choices, st.demo.size) }; }
  if (id === 'after') { const a = demoAfter(); return { q: a.ask, body: choicesHtml(a.choices, st.demo.after) }; }
  if (id === 'service') return {
    q: 'What are we building?',
    body: `<div class="tiles" data-testid="tiles">${SERVICE_ORDER.map((sid) => { const s = SERVICES[sid]; return `<button type="button" class="tile${st.service === sid ? ' on' : ''}" data-val="${sid}" data-testid="tile-${sid}"><span class="tile-ico">${ICONS[s.icon]}</span><strong>${esc(s.label)}</strong><span>${esc(s.blurb)}</span></button>`; }).join('')}</div>`,
    alt: mapLink(),
  };
  if (id.startsWith('opt:')) { const o = SERVICES[st.service].options.find((x) => x.id === id.slice(4)); return { q: o.ask || o.label, help: o.help || '', body: choicesHtml(o.choices, st.opts[o.id]), alt: mapLink() }; }
  if (id === 'length') {
    const svc = SERVICES[st.service];
    return {
      q: svc.lengthAsk, help: 'A rough number is fine. We measure on site.',
      body: `<form class="wiz-form" data-testid="length-form" novalidate>
        <div class="chips">${svc.lengthPresets.map((n) => `<button type="button" class="chip" data-len="${n}" data-testid="len-${n}">${n} ft</button>`).join('')}</div>
        <label>Length in feet<input type="text" inputmode="decimal" name="length" data-testid="length-input" autocomplete="off" value="${esc(st.lengthFt)}"></label>
        ${continueBtn()}</form>`,
      alt: mapLink('Not sure how long? Measure it on a map of your property.'),
    };
  }
  if (id === 'dims') return {
    q: 'How big is the pad?', help: 'Width and length in feet.',
    body: `<form class="wiz-form" data-testid="dims-form" novalidate><div class="two"><label>Width (ft)<input type="text" inputmode="decimal" name="width" data-testid="custom-width" autocomplete="off" value="${esc(st.custom.width_ft)}"></label><label>Length (ft)<input type="text" inputmode="decimal" name="length" data-testid="custom-length" autocomplete="off" value="${esc(st.custom.length_ft)}"></label></div>${continueBtn()}</form>`,
    alt: mapLink(),
  };
  if (id === 'address') return {
    q: 'Where is the property?', help: st.path === 'site' ? 'Last one before your price.' : 'So we know where the job is.',
    body: `<form class="wiz-form" data-testid="address-form" novalidate>${addressField()}${continueBtn(st.path === 'site' ? 'Show my price' : 'Continue')}</form>`,
  };
  if (id === 'price') return priceView();
  if (id === 'timing') return { q: 'When do you want it done?', body: choicesHtml(LEAD_FORM.timing, st.lead.timing) };
  if (id === 'name') return { q: 'Who should we ask for?', body: `<form class="wiz-form" data-testid="name-form" novalidate><label>Your name<input type="text" name="name" data-testid="lead-name" autocomplete="name" value="${esc(st.lead.name)}"></label>${continueBtn()}</form>` };
  if (id === 'phone') return {
    q: 'What is the best number to reach you?', help: 'We only use it to set up the visit and send your price.',
    body: `<form class="wiz-form" data-testid="phone-form" novalidate><label>Mobile phone<input type="tel" inputmode="tel" name="phone" data-testid="lead-phone" autocomplete="tel" value="${esc(st.lead.phone)}"></label><label><span>Email <em>(optional)</em></span><input type="email" name="email" data-testid="lead-email" autocomplete="email" value="${esc(st.lead.email)}"></label>${continueBtn()}</form>`,
  };
  if (id === 'contact') return { q: 'How should we reach you?', body: choicesHtml(LEAD_FORM.contact, st.lead.contact) };
  // notes: the last screen, with the send button
  const p = st.path === 'site' ? currentPrice() : null;
  return {
    q: 'Anything we should know?', help: 'Optional. Gate codes, access, utilities, the best time to visit.',
    body: `<form class="wiz-form" data-testid="lead-form" novalidate>
      <label class="sr-only" for="lead-notes">Notes</label><textarea id="lead-notes" name="notes" rows="3" data-testid="lead-notes">${esc(st.lead.notes)}</textarea>
      <div class="summary" data-testid="lead-summary"><span>${esc(st.path === 'site' ? `${SERVICES[st.service].label}, price range` : `Demolition: ${demoWhat() ? demoWhat().label : ''}`)}</span><strong>${p ? `${money(p.r.low)} to ${money(p.r.high)}` : 'Fixed price in writing'}</strong></div>
      ${isProduction() ? '' : `<div class="not-sent" data-testid="not-sent-banner">${esc(STATUS.notSent)} — preview only</div>`}
      ${continueBtn(st.sending ? 'Sending…' : 'Book my free site visit', 'We call or text back fast')}
      <p class="small light">By sending this you agree ATLAS can call and text you about your request. We use your details only to set up the visit and send your price. No spam, no selling your info.</p>
    </form>`,
  };
}
function addressField() {
  return `<label for="addr">Property address</label>
    <div class="suggest"><input id="addr" type="text" name="address" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Start typing your address" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="addr-list" data-testid="address-input" value="${esc(st.address)}"><ul id="addr-list" class="suggest-list" role="listbox" data-testid="suggestions" hidden></ul></div>
    <p class="wiz-note">Pick your address from the list as you type. Not there? Type it out with the town.</p>`;
}
function priceView() {
  const p = currentPrice(); const svc = SERVICES[st.service];
  if (!p) return { q: 'We need a size to price it.', body: `<button type="button" class="btn btn-primary btn-block" data-testid="fix-size"><span>Enter the size</span></button>`, alt: mapLink() };
  const { r, q } = p;
  return {
    q: 'Your price range', help: `${svc.label}${q.length_ft && !q.area_sqft ? `, ${fmtNum(q.length_ft)} ft` : ''}${q.area_sqft ? `, ${fmtNum(q.width_ft)} × ${fmtNum(q.length_ft)} ft` : ''}${st.mapPrice ? ', measured from your drawing' : ''}.`,
    body: `<div class="price" data-testid="price">
      <span class="price-label">Your price range ${IS_TEST ? '<span class="test-pill">TEST</span>' : ''}</span>
      <div class="price-range"><strong data-testid="price-low">${money(r.low)}</strong><span>to</span><strong data-testid="price-high">${money(r.high)}</strong></div>
      <p>Most jobs like this land around <strong data-testid="price-typical">${money(r.typical)}</strong>.${r.minimumApplied ? ' Job minimum applied.' : ''}</p>
      <details><summary>What's included</summary><ul class="small">${r.included.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="small"><strong>Not included:</strong> ${esc(r.excluded.join('; '))}.</p></details>
      <details><summary>How this number is built</summary><ul class="small">${r.lines.map((l) => `<li>${esc(l.label)}: ${money(l.amount)}</li>`).join('')}</ul></details>
      <button type="button" class="btn btn-primary btn-block" data-testid="lock-in"><span>Lock in my price</span><small>Free site visit</small></button>
      <p class="small">${esc(statusText())}</p>
    </div>`,
    alt: st.mapPrice ? '' : mapLink('Want a tighter number? Draw it on a map of your property.'),
  };
}

function cardHtml() {
  if (st.sent) {
    const ok = st.sent.sent;
    return `<div class="wiz wiz-done" data-testid="wizard" data-step="done">
      <h2>${ok ? 'Got it.' : isProduction() ? 'That did not send.' : 'Preview only.'}</h2>
      <div class="lead-saved" data-testid="${ok ? 'lead-sent' : 'lead-saved'}"><strong>${esc(st.sent.status)}</strong></div>
      <p>${ok ? 'We walk the property with you, mark out the work and put the scope and a fixed price in writing.' : isProduction() ? 'Your answers are still here. Try again, or call or text and we will take it from there.' : 'Forms only send on deployatlas.com. Nothing was transmitted.'}</p>
      <div class="btn-row"><a class="btn btn-primary" href="${BRAND.phoneHref}">Call ${esc(BRAND.phone)}</a><a class="btn btn-ghost light" href="${BRAND.smsHref}">Text us</a></div>
      <p class="wiz-alt">${ok ? '<button type="button" class="link" data-testid="start-over">Price another job</button>' : '<button type="button" class="link" data-testid="retry-send">Back to my answers</button>'}</p>
    </div>`;
  }
  if (!st.path) return `
        <h2>What are we doing?</h2>
        <div class="path-tiles" data-testid="path-tiles">
          <button type="button" class="path-tile" data-path="demo" data-testid="path-demo"><strong>Demolition</strong><span>Tear it out, haul it off. Houses, mobile homes, garages, barns, decks, concrete.</span><em>Answer a few questions →</em></button>
          <button type="button" class="path-tile" data-path="site" data-testid="path-site"><strong>Site work</strong><span>Gravel driveways, culverts, drainage and gravel pads.</span><em>Answer a few questions →</em></button>
        </div>
        <p class="small light">Not sure? Call or text <a href="${BRAND.phoneHref}">${esc(BRAND.phone)}</a>.</p>`;
  const ids = steps(); const id = stepId(); const v = stepView(id);
  const n = st.step + 1, total = ids.length;
  return `<div class="wiz" data-testid="wizard" data-step="${esc(st.mapAsk ? 'map-address' : id)}">
      <div class="wiz-top"><button type="button" class="link back-link" data-testid="wiz-back">‹ Back</button>${st.mapAsk ? '' : `<span class="wiz-count" data-testid="wiz-count">${n} of ${total}</span>`}${testPill()}</div>
      ${st.mapAsk ? '' : `<div class="wiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${n}" aria-label="Progress"><i style="width:${Math.round((n / total) * 100)}%"></i></div>`}
      ${st.mapAsk ? '' : trail()}
      <div class="wiz-step">
        <h2 class="wiz-q" data-testid="wiz-q">${esc(v.q)}</h2>
        ${v.help ? `<p class="wiz-help">${esc(v.help)}</p>` : ''}
        ${v.body}
      </div>
      ${v.alt || ''}
    </div>`;
}

function renderCard(moved) {
  const card = $('#tool'); if (!card) return;
  card.dataset.path = st.path || 'choose'; delete card.dataset.busy;
  card.innerHTML = cardHtml();
  bindCard(card);
  if (moved) {
    const top = card.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.45) card.scrollIntoView({ block: 'start', behavior: 'instant' });
    const first = $('.wiz-form input:not([type=hidden]), .wiz-form textarea', card);
    if (first && window.matchMedia('(min-width: 861px)').matches) { first.focus(); try { first.setSelectionRange(first.value.length, first.value.length); } catch (e) { /* not a text field */ } }
  }
}

function bindCard(card) {
  const err = (msg) => { const el = $('[data-testid=wiz-err]', card); if (el) el.textContent = msg; };
  const pickThen = (btn, fn) => { if (card.dataset.busy) return; card.dataset.busy = '1'; $$('.choice, .tile', card).forEach((b) => b.classList.toggle('on', b === btn)); fn(btn.dataset.val); setTimeout(next, 170); };
  $$('.path-tile', card).forEach((b) => b.addEventListener('click', () => startPath(b.dataset.path)));
  $('[data-testid=wiz-back]', card)?.addEventListener('click', back);
  $('[data-testid=use-map]', card)?.addEventListener('click', (e) => openMapFlow(e.currentTarget));
  $('[data-testid=start-over]', card)?.addEventListener('click', resetAll);
  $('[data-testid=retry-send]', card)?.addEventListener('click', () => { st.sent = null; renderCard(true); });
  $('[data-testid=fix-size]', card)?.addEventListener('click', () => goTo(SERVICES[st.service].geometry === 'rect' ? 'opt:size' : 'length'));
  $('[data-testid=lock-in]', card)?.addEventListener('click', next);
  if (!st.path || st.sent) return;
  const id = stepId();

  if (st.mapAsk || id === 'address') {
    const input = $('#addr', card); let picked = hasCoords() && st.geocode.label === st.address ? st.geocode : null;
    attachSuggest(input, $('#addr-list', card), (s) => { picked = s ? { label: s.label, lon: s.lon, lat: s.lat, source: s.census ? 'U.S. Census Bureau geocoder' : 'address suggestion', approx: !s.exact, lookups: s.lookups || [] } : null; });
    $('[data-testid=address-form]', card).addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = cleanAddress(input.value);
      if (text.length < 5) { err('Type the property address, or at least the street and town.'); return; }
      st.address = text; st.geocode = picked;
      if (!st.mapAsk) { next(); return; }
      err('Finding your property…');
      if (await refineAddress()) { st.mapAsk = false; openEstimator(); } else err('We could not find that address. Add the town, like 1204 W Broadway, Columbia, or pick one from the list.');
    });
    return;
  }
  if (id === 'what') { $$('.tile', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { if (st.demo.what !== v) { st.demo.size = null; st.demo.after = null; } st.demo.what = v; }))); return; }
  if (id === 'size') { $$('.choice', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { st.demo.size = v; }))); return; }
  if (id === 'after') { $$('.choice', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { st.demo.after = v; }))); return; }
  if (id === 'service') {
    $$('.tile', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => {
      if (st.service !== v) { st.opts = Object.fromEntries(SERVICES[v].options.map((o) => [o.id, o.default])); st.lengthFt = ''; st.geometry = null; st.ground = { status: 'idle' }; st.mapPrice = null; }
      st.service = v;
    })));
    return;
  }
  if (id.startsWith('opt:')) { $$('.choice', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { st.opts[id.slice(4)] = v; st.mapPrice = null; }))); return; }
  if (id === 'length') {
    const svc = SERVICES[st.service]; const input = $('[data-testid=length-input]', card);
    const submit = () => {
      const n = Number(String(input.value).replace(/[, ]/g, ''));
      delete card.dataset.busy;
      if (!Number.isFinite(n) || n <= 0) { err('Enter a length in feet. A rough number is fine.'); return; }
      if (n > 5000) { err('That is a big one. Call or text (573) 234-6641 and we will price it with you.'); return; }
      if (svc.maxLengthFt && n > svc.maxLengthFt) { err(`We price culverts up to ${svc.maxLengthFt} ft online. For a longer crossing, call or text (573) 234-6641.`); return; }
      if (String(n) !== st.lengthFt) st.mapPrice = null;
      st.lengthFt = String(n); next();
    };
    $$('.chip', card).forEach((c) => c.addEventListener('click', () => { if (card.dataset.busy) return; card.dataset.busy = '1'; input.value = c.dataset.len; $$('.chip', card).forEach((x) => x.classList.toggle('on', x === c)); setTimeout(submit, 170); }));
    $('[data-testid=length-form]', card).addEventListener('submit', (e) => { e.preventDefault(); submit(); });
    return;
  }
  if (id === 'dims') {
    $('[data-testid=dims-form]', card).addEventListener('submit', (e) => {
      e.preventDefault();
      const w = Number(e.target.width.value), l = Number(e.target.length.value);
      if (!(w > 0 && l > 0) || w > 500 || l > 500) { err('Enter the width and length in feet.'); return; }
      st.custom = { width_ft: String(w), length_ft: String(l) }; st.mapPrice = null; next();
    });
    return;
  }
  if (id === 'timing') { $$('.choice', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { st.lead.timing = v; }))); return; }
  if (id === 'contact') { $$('.choice', card).forEach((b) => b.addEventListener('click', () => pickThen(b, (v) => { st.lead.contact = v; }))); return; }
  if (id === 'name') {
    $('[data-testid=name-form]', card).addEventListener('submit', (e) => { e.preventDefault(); const v = e.target.name.value.trim(); if (v.length < 2) { err('Tell us who to ask for.'); return; } st.lead.name = v.slice(0, 120); next(); });
    return;
  }
  if (id === 'phone') {
    $('[data-testid=phone-form]', card).addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = e.target.phone.value.trim(), email = e.target.email.value.trim();
      if (phone.replace(/\D/g, '').length < 10) { err('Enter a 10-digit phone number.'); return; }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err('That email does not look right. Fix it or leave it blank.'); return; }
      st.lead.phone = phone.slice(0, 40); st.lead.email = email.slice(0, 200); next();
    });
    return;
  }
  if (id === 'notes') {
    $('[data-testid=lead-form]', card).addEventListener('submit', (e) => { e.preventDefault(); st.lead.notes = e.target.notes.value.trim().slice(0, 2000); sendLead(); });
  }
}

// ---------------- the one Get my price submission ----------------
async function sendLead() {
  if (st.sending) return;
  const L = st.lead; const property = (st.geocode && st.geocode.label) || st.address;
  const timing = L.timing || LEAD_FORM.timing[0].id, contact = L.contact || LEAD_FORM.contact[0].id;
  let fields, leads;
  if (st.path === 'site') {
    const p = currentPrice(); const svc = SERVICES[st.service];
    const est = p ? (p.est || buildEstimate(p.r, p.q)) : null;
    if (est) est.site_visit_request = { ...L, timing, contact, address: st.address, requested_at: new Date().toISOString() };
    fields = { path: 'site work', name: L.name, phone: L.phone, email: L.email, contact, address: st.address, timing, notes: L.notes, service: svc.label, options: JSON.stringify(st.opts), price_low: p ? String(p.r.low) : '', price_high: p ? String(p.r.high) : '', price_typical: p ? String(p.r.typical) : '', quantities: p ? JSON.stringify(p.q) : '', property, source_mode: st.mapPrice ? 'drawn on the map' : 'answered questions', estimate_json: est ? JSON.stringify(est) : '' };
    leads = { form_name: 'estimate_tool', name: L.name, phone: L.phone, email: L.email, address: st.address, service: svc.label, message: L.notes, est_low: fields.price_low, est_high: fields.price_high, timeline: timing, contact_pref: contact, property };
  } else {
    const w = demoWhat(); const size = demoSize() && st.demo.size ? choiceLabel(demoSize().choices, st.demo.size) : ''; const after = st.demo.what !== 'other' && st.demo.after ? choiceLabel(demoAfter().choices, st.demo.after) : '';
    fields = { path: 'demolition', name: L.name, phone: L.phone, email: L.email, contact, address: st.address, timing, notes: L.notes, service: `Demolition: ${w ? w.label : ''}`, what: st.demo.what, size, after, property, source_mode: 'answered questions' };
    leads = { form_name: 'estimate_consultation', name: L.name, phone: L.phone, email: L.email, address: st.address, service: st.demo.what, message: [L.notes, size && `Size: ${size}`, after && `Finish: ${after}`].filter(Boolean).join(' | '), timeline: timing, contact_pref: contact, property };
  }
  st.sending = true; renderCard(false);
  const d = await deliver(DELIVERY.forms.lead, fields, () => { if (window.atlasLeads) window.atlasLeads.send(leads); });
  st.sending = false; st.sent = d;
  if (d.sent) { track('consultation_submit', { lead_path: fields.path, service: fields.service }); track('generate_lead', { lead_path: fields.path, service: fields.service }); }
  renderCard(true);
}

// ---------------- general contact form (bottom of the page) ----------------
function bindContactForm() {
  const f = $('[data-testid=contact-form]'); if (!f) return;
  const out = $('[data-testid=contact-status]');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = (n) => (f.elements[n].value || '').trim();
    const name = val('name'), phone = val('phone'), email = val('email'), message = val('message');
    const say = (msg, state) => { out.textContent = msg; out.dataset.state = state; };
    if (name.length < 2) return say('Add your name.', 'error');
    if (phone.replace(/\D/g, '').length < 10 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return say('Add a phone number or an email so we can get back to you.', 'error');
    if (message.length < 3) return say('Tell us a little about the job.', 'error');
    if (!f.elements.sms_consent.checked) return say('Check the box so we can call or text you back, or call us at (573) 234-6641.', 'error');
    say('Sending…', 'loading');
    const payload = { form: 'contact', source: 'contact-form', name, phone, email, service: '', location: '', message, sms_consent: 'yes', formSource: 'Get my price page', page: location.pathname, referrer: document.referrer || '', timestamp: new Date().toISOString() };
    const d = await deliver(DELIVERY.forms.contact, { name, phone, email, message, sms_consent: 'yes', source: 'Get my price page' }, () => {
      if (window.atlasLeads) window.atlasLeads.send(payload);
      fetch('https://oihevxbiwggnnwsplkwx.supabase.co/functions/v1/web-intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    });
    if (d.sent) { track('contact_submit', {}); f.reset(); say('Sent. We get back to you fast.', 'ok'); } else say(isProduction() ? STATUS.sendFailed : `${STATUS.notSent} — forms only send on deployatlas.com.`, 'error');
  });
}

// ---------------- landing ----------------
function typicalRows() {
  return TYPICAL_SCENARIOS.map((s) => ({ ...s, r: evaluate(s.service, s.opts, { gradePct: 0, ...s.q }) }));
}
function renderLanding() {
  const rows = typicalRows();
  let lastGroup = '';
  $('#app').innerHTML = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1>Get your price.</h1>
        <p class="lead">Answer a few questions, one at a time. A free site visit puts the price in writing.</p>
        <ul class="ticks"><li>About two minutes, start to finish</li><li>Site work: see a range before you give us a phone number</li><li>Demolition: a fixed price in writing after we walk it</li><li>Serving ${esc(BRAND.city)} and 45 minutes around</li></ul>
        <p class="talk">Rather talk it through? Call or text <a href="${BRAND.phoneHref}">${esc(BRAND.phone)}</a>.</p>
      </div>
      <div class="hero-card" id="tool" data-testid="hero-card" data-path="choose"></div>
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
  <section class="band contact" id="contact" data-testid="contact"><div class="wrap contact-grid">
    <div>
      <h2 class="h-bebas">Talk to us</h2>
      <p class="lead">Have a question, or a job that does not fit the questions above? Send a message and we get back to you fast.</p>
      <dl class="contact-list">
        <div><dt>Call or text</dt><dd><a class="big" href="${BRAND.phoneHref}" data-testid="contact-call">${esc(BRAND.phone)}</a><br><a href="${BRAND.smsHref}" data-testid="contact-text">Send a text</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${esc(BRAND.email)}" data-testid="contact-email">${esc(BRAND.email)}</a></dd></div>
        <div><dt>Office</dt><dd>${esc(BRAND.office)}</dd></div>
        <div><dt>Service area</dt><dd>${esc(BRAND.serviceArea)}</dd></div>
      </dl>
    </div>
    <form class="contact-form" data-testid="contact-form" novalidate>
      <h3>Send a message</h3>
      <div class="two"><label>Your name<input type="text" name="name" autocomplete="name" data-testid="contact-name"></label><label>Phone<input type="tel" name="phone" inputmode="tel" autocomplete="tel" data-testid="contact-phone"></label></div>
      <label><span>Email <em>(optional)</em></span><input type="email" name="email" autocomplete="email" data-testid="contact-email-input"></label>
      <label>How can we help?<textarea name="message" rows="4" data-testid="contact-message"></textarea></label>
      <label class="consent"><input type="checkbox" name="sms_consent" value="yes" data-testid="contact-consent"><span>I agree that ATLAS Demolition &amp; Site Work may contact me about my project by phone call and text message at the number I provided, including calls and texts placed with automated technology or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of any purchase. Prefer not to agree? Call us at <a href="${BRAND.phoneHref}">${esc(BRAND.phone)}</a>. See our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noopener">Terms</a>.</span></label>
      <button type="submit" class="btn btn-primary" data-testid="contact-send">Send message</button>
      <p class="form-status" data-testid="contact-status" aria-live="polite"></p>
    </form>
  </div></section>
  <section class="band alt"><div class="wrap">
    <h2 class="h-bebas">What happens after</h2>
    <ol class="steps">
      <li><strong>Tell us about the job.</strong> Call, text or answer a few questions online. It takes about two minutes.</li>
      <li><strong>Free site visit.</strong> We walk the property with you and put the scope and price in writing.</li>
      <li><strong>We do the work.</strong> We call 811 before we dig and send photo updates while we work.</li>
      <li><strong>Walkthrough.</strong> We walk the finished job with you and clean up before we leave.</li>
    </ol>
  </div></section>`;
  renderCard(false);
  bindContactForm();
}

// ---------------- map estimator (second option: draw the job on the aerial) ----------------
async function openMapFlow(link) {
  if (st.path !== 'site') { st.path = 'site'; st.step = 0; }
  if (!hasCoords() || st.geocode.approx) {
    if (st.address) {
      if (link) { link.textContent = 'Finding your property…'; link.disabled = true; }
      if (await refineAddress()) { openEstimator(); return; }
    }
    st.mapAsk = true; renderCard(true); return;
  }
  openEstimator();
}
function openEstimator() {
  st.view = 'estimator'; st.mode = 'map';
  track('estimate_map_open', {});
  renderEstimator();
}
// Close the map and go back to the questions, keeping whatever was measured.
function closeEstimator() {
  const g = st.geometry;
  if (g && st.service && g.kind === 'line' && g.length_ft > 0) { const n = String(Math.round(g.length_ft)); if (n !== st.lengthFt) st.mapPrice = null; st.lengthFt = n; }
  st.view = 'landing'; st.map = null; document.body.classList.remove('est-open');
  st.step = Math.min(st.step, steps().length - 1);
  renderLanding();
  const card = $('#tool'); if (card) card.scrollIntoView({ block: 'start', behavior: 'instant' });
}
// "Lock in your price" from a drawing: keep the measured price and carry on with the last few questions.
function lockFromMap(r, q) {
  st.mapPrice = { r, q, est: buildEstimate(r, q) };
  closeEstimator();
  goTo('timing');
}

function renderEstimator() {
  document.body.classList.add('est-open');
  $('#app').innerHTML = `
  <div class="est" data-testid="estimator" data-mode="map">
    <aside class="est-panel" data-testid="est-panel">
      <header class="est-head">
        <img src="logo.svg" alt="Atlas" class="est-logo"><span class="est-title">Draw it on your property</span>${testPill()}
        <button type="button" class="btn btn-ghost btn-sm" data-testid="est-close">Close</button>
      </header>
      <div class="est-addr"><strong data-testid="est-address">${esc(st.geocode.label)}</strong>${st.geocode.approx ? '<span class="small">We put you on your street. Drag the map to your property.</span>' : ''}</div>
      <div class="est-body" id="est-body"></div>
      <footer class="est-foot small"><span>${esc(MAP.attribution)} ${esc(MAP.imageryNote)}</span><button type="button" class="link" data-testid="toggle-mode">Back to the questions</button></footer>
    </aside>
    <div class="est-map" data-testid="est-map"><div class="amap-root" id="map-root"></div>
      <div class="view-toggle" role="radiogroup" aria-label="Map view"><button type="button" role="radio" aria-checked="false" data-view="3d" data-testid="view-3d">3D</button><button type="button" role="radio" aria-checked="true" class="on" data-view="top" data-testid="view-top">Top</button></div></div>
  </div>`;
  $('[data-testid=est-close]').addEventListener('click', closeEstimator);
  $('[data-testid=toggle-mode]').addEventListener('click', closeEstimator);
  st.geometry = null; st.ground = { status: 'idle' };
  st.map = createMap($('#map-root'), {
    center: { lon: st.geocode.lon, lat: st.geocode.lat }, zoom: REGION.addressZoom,
    onChange: (g) => { st.geometry = g; st.groundRev++; st.ground = { status: 'idle' }; renderBody(); if (g) scheduleGround(); },
  });
  st.map.load();
  if (st.service) armFor(st.service);
  $$('.view-toggle button').forEach((b) => b.addEventListener('click', () => { st.map.set3D(b.dataset.view === '3d'); $$('.view-toggle button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); }));
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
      <ol class="steps small"><li><strong>Pick the job.</strong> Drainage, a driveway, a culvert or a gravel pad.</li><li><strong>Draw it on the aerial.</strong> We measure it in feet and read the ground from USGS lidar.</li><li><strong>See your range.</strong> Lock it in with a free site visit. We confirm everything on site before you sign.</li></ol>`;
    $$('.tile', body).forEach((t) => t.addEventListener('click', () => { st.service = t.dataset.service; st.opts = Object.fromEntries(SERVICES[st.service].options.map((o) => [o.id, o.default])); st.lengthFt = ''; st.mapPrice = null; st.geometry = null; st.ground = { status: 'idle' }; if (st.map) { st.map.clear(); armFor(st.service); } renderBody(); }));
    return;
  }
  const svc = SERVICES[st.service];
  const q = quantities();
  const r = q ? evaluate(st.service, st.opts, q) : null;
  const lengthOk = !(svc.maxLengthFt && q && q.length_ft > svc.maxLengthFt);
  body.innerHTML = `
    <div class="svc-head"><span class="tile-ico">${ICONS[svc.icon]}</span><h2 class="h-bebas">${esc(svc.label)}</h2><button type="button" class="link" data-testid="change-service">Change</button></div>
    <p class="prompt" data-testid="prompt">${esc(st.geometry ? svc.editPrompt : svc.prompt)}</p>
    ${svc.options.map((o) => `<div class="opt"><span class="opt-label">${esc(o.label)}</span><div class="seg-row" role="radiogroup" aria-label="${esc(o.label)}">${o.choices.map((c) => `<button type="button" role="radio" aria-checked="${st.opts[o.id] === c.id}" class="seg-btn${st.opts[o.id] === c.id ? ' on' : ''}" data-opt="${o.id}" data-val="${c.id}" data-testid="opt-${o.id}-${c.id}">${esc(c.label)}</button>`).join('')}</div></div>`).join('')}
    ${svc.geometry === 'rect' && st.opts.size === 'custom' ? `<div class="opt two"><label>Width (ft)<input type="text" inputmode="decimal" data-custom="width_ft" data-testid="custom-width" value="${esc(st.custom.width_ft)}"></label><label>Length (ft)<input type="text" inputmode="decimal" data-custom="length_ft" data-testid="custom-length" value="${esc(st.custom.length_ft)}"></label></div>` : ''}
    <div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-testid="undo">Undo</button><button type="button" class="btn btn-ghost btn-sm" data-testid="clear">Clear</button>${svc.geometry === 'rect' && st.geometry ? `<label class="rot">Rotate <input type="range" min="0" max="179" value="${st.geometry.rot_deg || 0}" data-testid="rotate"></label>` : ''}</div>
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
      <details><summary>How this ${IS_TEST ? 'test ' : ''}number is built</summary><ul class="small">${r.lines.map((l) => `<li>${esc(l.label)}: ${money(l.amount)}</li>`).join('')}</ul><p class="small">Range = typical −10% / +20%, rounded to $50. Rates version ${esc(r.rateVersion)}.</p></details>
      <button type="button" class="btn btn-primary btn-block" data-testid="lock-in"><span>Lock in your price</span><small>Free site visit</small></button>
      <p class="small">${esc(statusText())}</p>
    </div>` : `<p class="hint" data-testid="no-geometry">${svc.geometry === 'rect' ? 'Tap the map to place the pad.' : 'Tap the map to start drawing. You need at least two points.'}</p>`}`;
  // bindings
  $('[data-testid=change-service]').addEventListener('click', () => { st.service = null; st.geometry = null; st.ground = { status: 'idle' }; if (st.map) { st.map.clear(); st.map.arm(null); st.map.setStatus(''); } renderBody(); });
  $$('.seg-btn', body).forEach((b) => b.addEventListener('click', () => { st.opts[b.dataset.opt] = b.dataset.val; st.mapPrice = null; if (svc.geometry === 'rect' && b.dataset.opt === 'size') applyRect(); renderBody(); }));
  $$('input[data-custom]', body).forEach((i) => i.addEventListener('input', () => { st.custom[i.dataset.custom] = i.value; if (svc.geometry === 'rect') applyRect(); renderBody(); if (i.dataset.custom === 'width_ft') $('[data-testid=custom-width]')?.focus(); else $('[data-testid=custom-length]')?.focus(); setCaret(i.dataset.custom === 'width_ft' ? $('[data-testid=custom-width]') : $('[data-testid=custom-length]')); }));
  $('[data-testid=undo]')?.addEventListener('click', () => st.map && st.map.undo());
  $('[data-testid=clear]')?.addEventListener('click', () => st.map && st.map.clear());
  $('[data-testid=rotate]')?.addEventListener('input', (e) => st.map && st.map.setRect({ rot_deg: Number(e.target.value) }));
  $('[data-testid=lock-in]')?.addEventListener('click', () => lockFromMap(r, q));
  if (st.map && st.service) st.map.setStatus(st.geometry ? svc.editPrompt : svc.prompt);
}
function setCaret(el) { if (el) { const n = el.value.length; try { el.setSelectionRange(n, n); } catch (_) { /* ignore */ } } }
function applyRect() { if (!st.map) return; const d = padDims(st.opts.size || 'custom', st.custom); const patch = { w_m: d.width_ft / 3.280839895, l_m: d.length_ft / 3.280839895 }; st.map.setRect(patch); armFor(st.service); }

// ---------------- ground (USGS EPQS via local proxy) ----------------
function groundSummary() {
  const g = st.ground;
  if (g.status === 'available') return `${g.drop_ft >= 0 ? 'rises' : 'drops'} ${Math.abs(g.drop_ft).toFixed(1)} ft · avg ${Math.abs(g.avgPct).toFixed(1)}%`;
  if (g.status === 'loading') return 'reading USGS lidar…';
  if (g.status === 'too-short') return 'too short to read';
  if (g.status === 'unavailable') return 'unavailable';
  return '—';
}
function groundCard() {
  const g = st.ground;
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


// ---------------- estimate record sent with the request ----------------
function buildEstimate(r, q) {
  return {
    app: 'Atlas Get My Price', generated_at: new Date().toISOString(), status: statusText(), test: IS_TEST, binding: false, guaranteed: false,
    brand: BRAND.name, property: st.geocode, address: st.address, mode: q && q.source === 'drawn' ? 'drawn on the map' : 'answered questions', service: st.service, options: st.opts, quantities: q,
    geometry: q && q.source === 'drawn' ? st.geometry : null, ground: q && q.source === 'drawn' ? st.ground : null, pricing: r,
    map: q && q.source === 'drawn' && st.map ? st.map.getView() : null, rates: { version: TEST_RATES.version },
  };
}

// ---------------- boot ----------------
if (!isAllowedHostname(location.hostname)) {
  $('#app').innerHTML = `<div class="blocked" data-testid="blocked">This estimator only runs on deployatlas.com or a local preview. Current host: ${esc(location.hostname)}.</div>`;
} else {
  renderLanding();
  // "Get my price" in the top bar and the phone action bar: back to the questions, keeping any answers.
  $$('.action-bar a[href="#tool"], .topbar a[href="#tool"]').forEach((l) => l.addEventListener('click', (e) => {
    e.preventDefault();
    if (st.view !== 'landing') closeEstimator();
    const card = $('#tool'); if (card) card.scrollIntoView({ block: 'start', behavior: 'instant' });
  }));
}
