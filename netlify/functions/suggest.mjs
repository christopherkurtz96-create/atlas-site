// Address suggestions while the visitor types (Get my price). Looks up street names around Columbia through
// Photon (OpenStreetMap search by komoot, built for search-as-you-type) and pairs them with the house number
// the visitor typed. Returns { suggestions: [{ label, lon, lat, exact, lookups }], source }.
// `exact: false` means lon/lat is a point on the street, not the house. `lookups` are the address strings the
// estimator hands to /api/geocode (U.S. Census), in order, to get the house itself before it opens the map.
// Upstream trouble returns an empty list with an `error` note, never an error page.
const QUERY_RE = /^[A-Za-z0-9 ,.#'\-/]{3,120}$/;
const UPSTREAM = "https://photon.komoot.io/api/";
const CENTER = { lat: 38.9517, lon: -92.3341 };                 // downtown Columbia: closer results rank first
const BBOX = "-93.05,38.3,-91.6,39.6";                          // the service area (about an hour around Columbia)
const ABBR = { rd: "Road", ln: "Lane", ct: "Court", blvd: "Boulevard", hwy: "Highway", pkwy: "Parkway", trl: "Trail", mo: "Missouri" };
const STATES = { Missouri: "MO" };
// Named things you cannot have an address on: trails, sidewalks, interstates and their ramps.
const NOT_A_STREET = /^(cycleway|footway|path|pedestrian|steps|bridleway|bus_stop|platform|construction|proposed|motorway|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$/;
const clean = (s) => String(s || "").replace(/[^A-Za-z0-9 ,.#'\-/]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
const json = (obj, cache = false) => new Response(JSON.stringify(obj), { status: 200, headers: { "content-type": "application/json", ...(cache ? { "cache-control": "public, max-age=3600", "netlify-cdn-cache-control": "public, max-age=604800" } : { "cache-control": "no-store" }) } });

// "1204 w broadway" -> { number: "1204", street: "w broadway" }; "broadway" -> { number: "", street: "broadway" }
export function splitQuery(q) {
  const m = /^\s*(\d{1,6}[A-Za-z]?)\s+(.*)$/.exec(q);
  return m ? { number: m[1], street: m[2].trim() } : { number: "", street: q.trim() };
}
// Photon matches word beginnings, so "Ave" finds "Avenue" and "St" finds "Street" on their own, but "Rd" never
// finds "Road". A leading "St" is a saint ("St Charles Rd"), not a street.
export function expand(street) {
  return street.replace(/[,.]/g, " ").split(/\s+/).filter(Boolean)
    .map((w, i, all) => (i === 0 && all.length > 1 && w.toLowerCase() === "st" ? "Saint" : ABBR[w.toLowerCase()] || w)).join(" ");
}
const words = (s) => String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const km = (lon, lat) => Math.hypot((lon - CENTER.lon) * 86.5, (lat - CENTER.lat) * 111);   // flat-earth is fine at this size

// Best match first: the street (and town) that covers the most typed words, then the one nearest Columbia.
// Lettered state routes (Route K, Highway WW) have no name in this data; the estimator covers those with the
// Census lookup, which it runs alongside this once the visitor has typed a full address.
export function toSuggestions(features, number, text = "", limit = 6) {
  const typed = words(text).filter((w) => w !== "missouri");
  const rows = [];
  for (const f of features || []) {
    const p = f?.properties || {}; const c = f?.geometry?.coordinates || [];
    const lon = Number(c[0]), lat = Number(c[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (p.countrycode && p.countrycode !== "US") continue;
    const isHouse = Boolean(p.housenumber && p.street);
    const isStreet = p.type === "street" || p.osm_key === "highway";
    if (!isHouse && (!isStreet || NOT_A_STREET.test(p.osm_value || ""))) continue;
    const street = clean(isHouse ? p.street : p.name);
    if (!street) continue;
    const num = isHouse ? clean(p.housenumber) : number;
    const line = `${num ? `${num} ` : ""}${street}`;
    const place = clean(p.city || p.town || p.village || "");
    const township = / Township$/i.test(place);                 // rural: OSM gives the township, nobody's mailing address
    const state = STATES[p.state] || clean(p.state) || "MO";
    const zip = /^\d{5}$/.test(p.postcode || "") ? p.postcode : "";
    const county = clean(p.county || "").replace(/ County$/i, "");
    // A street crosses ZIP codes, so the ZIP only goes on the label when there is no town to show.
    const label = township || !place ? [line, county && `${county} County`, [state, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ") : `${line}, ${place}, ${state}`;
    const town = place.replace(/ Township$/i, "");
    const lookups = [town && `${line}, ${town}, ${state}`, zip && `${line}, ${state} ${zip}`].filter(Boolean);
    const name = words(street), where = words(town);
    const score = typed.filter((w) => name.some((n) => n.startsWith(w))).length + 0.5 * typed.filter((w) => where.some((n) => n.startsWith(w))).length;
    // Among equal matches, a street name with words nobody typed ("Red Maple Lane" for "maple ln") counts as 25 km farther.
    const extra = name.filter((n) => !typed.some((w) => n.startsWith(w))).length;
    rows.push({ label, lon: +lon.toFixed(6), lat: +lat.toFixed(6), exact: isHouse, lookups, score, far: km(lon, lat) + 25 * extra, key: `${street}|${town}|${num}`.toLowerCase() });
  }
  rows.sort((a, b) => b.score - a.score || a.far - b.far);
  const out = []; const seen = new Set();
  for (const { score, far, key, ...s } of rows) {
    if (seen.has(key) || seen.has(s.label)) continue;
    seen.add(key); seen.add(s.label);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

async function photon(street, withLayer) {
  const qs = new URLSearchParams({ q: street, limit: "25", lang: "en", lat: String(CENTER.lat), lon: String(CENTER.lon), bbox: BBOX });
  if (withLayer) qs.append("layer", "street");
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
  try {
    const r = await fetch(`${UPSTREAM}?${qs}`, { signal: ctl.signal, redirect: "error", headers: { accept: "application/json" } });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, features: (await r.json())?.features || [] };
  } catch (e) { return { ok: false, status: 0 }; } finally { clearTimeout(t); }
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!QUERY_RE.test(q)) return json({ suggestions: [], error: "q must be 3-120 chars of letters, digits, space , . # ' - /" });
  const { number, street } = splitQuery(q);
  const text = expand(street);
  if (text.length < 3) return json({ suggestions: [] });
  let res = await photon(text, true);
  if (!res.ok && res.status === 400) res = await photon(text, false);                 // older Photon builds reject `layer`
  else if (!res.ok) { await pause(450); res = await photon(text, true); }             // the public service sheds bursts with a 503
  if (!res.ok) return json({ suggestions: [], error: "address suggestions are unavailable right now" });
  return json({ suggestions: toSuggestions(res.features, number, text), source: "Photon (OpenStreetMap)" }, true);
};

export const config = { path: "/api/suggest", method: ["GET"] };
