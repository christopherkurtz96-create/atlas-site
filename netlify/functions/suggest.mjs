// Address suggestions while the visitor types (Get my price). Looks up street names in mid-Missouri through
// Photon (OpenStreetMap search by komoot, built for search-as-you-type) and pairs them with the house number
// the visitor typed. Returns { suggestions: [{ label, lon, lat, exact }], source }.
// `exact: false` means lon/lat is the street, not the house; the estimator refines it through /api/geocode
// (U.S. Census) before it opens the map. Upstream trouble returns an empty list, never an error page.
const QUERY_RE = /^[A-Za-z0-9 ,.#'\-/]{3,120}$/;
const UPSTREAM = "https://photon.komoot.io/api/";
const CENTER = { lat: "38.9517", lon: "-92.3341" };            // downtown Columbia: closer results rank first
const BBOX = "-93.6,38.0,-91.0,39.9";                           // mid-Missouri, a bit past the service area
const ABBR = { rd: "Road", ln: "Lane", ct: "Court", blvd: "Boulevard", hwy: "Highway", pkwy: "Parkway", trl: "Trail", mo: "Missouri" };
const STATES = { Missouri: "MO" };
const json = (obj, maxAge = 0) => new Response(JSON.stringify(obj), { status: 200, headers: { "content-type": "application/json", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" } });

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
export function toSuggestions(features, number, limit = 6) {
  const out = []; const seen = new Set();
  for (const f of features || []) {
    const p = f?.properties || {}; const c = f?.geometry?.coordinates || [];
    const lon = Number(c[0]), lat = Number(c[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (p.countrycode && p.countrycode !== "US") continue;
    const isHouse = Boolean(p.housenumber && p.street);
    const isStreet = p.type === "street" || p.osm_key === "highway";
    if (!isHouse && !isStreet) continue;
    const street = isHouse ? p.street : p.name;
    if (!street) continue;
    const num = isHouse ? String(p.housenumber) : number;
    const town = p.city || p.town || p.village || p.locality || p.district || "";
    const state = STATES[p.state] || p.state || "";
    const tail = [state, p.postcode].filter(Boolean).join(" ");
    const label = [`${num ? `${num} ` : ""}${street}`, town, tail].filter(Boolean).join(", ").replace(/[^A-Za-z0-9 ,.#'\-/]/g, "").slice(0, 200);
    const key = `${street}|${town}|${num}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, lon: +lon.toFixed(6), lat: +lat.toFixed(6), exact: isHouse });
    if (out.length >= limit) break;
  }
  return out;
}

async function photon(street, withLayer) {
  const qs = new URLSearchParams({ q: street, limit: "15", lang: "en", lat: CENTER.lat, lon: CENTER.lon, bbox: BBOX });
  if (withLayer) qs.append("layer", "street");
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(`${UPSTREAM}?${qs}`, { signal: ctl.signal, redirect: "error", headers: { accept: "application/json" } });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, features: (await r.json())?.features || [] };
  } catch (e) { return { ok: false, status: 0 }; } finally { clearTimeout(t); }
}

export default async (req) => {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!QUERY_RE.test(q)) return json({ suggestions: [], error: "q must be 3-120 chars of letters, digits, space , . # ' - /" });
  const { number, street } = splitQuery(q);
  const text = expand(street);
  if (text.length < 3) return json({ suggestions: [] });
  let res = await photon(text, true);
  if (!res.ok && res.status === 400) res = await photon(text, false);   // older Photon builds reject `layer`
  if (!res.ok) return json({ suggestions: [], error: "address suggestions are unavailable right now" });
  return json({ suggestions: toSuggestions(res.features, number), source: "Photon (OpenStreetMap)" }, 300);
};

export const config = { path: "/api/suggest", method: ["GET"] };
