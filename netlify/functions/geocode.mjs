// Address lookup through the U.S. Census Bureau geocoder (user-triggered from the estimator). Returns the same
// shape the private prototype used: { matches: [{ address, lon, lat }], source }.
const ADDRESS_RE = /^[A-Za-z0-9 ,.#'\-/]{3,200}$/;
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const address = (new URL(req.url).searchParams.get("address") || "").trim();
  if (!ADDRESS_RE.test(address)) return json({ error: "address must be 3-200 chars of letters, digits, space , . # ' - /" }, 400);
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" })}`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: "error", headers: { accept: "application/json" } });
    if (!r.ok) return json({ error: `upstream ${r.status}` }, 502);
    const j = await r.json();
    const matches = [];
    for (const m of (j?.result?.addressMatches || []).slice(0, 5)) {
      const c = m.coordinates || {}; const lon = Number(c.x), lat = Number(c.y);
      if (Number.isFinite(lon) && Number.isFinite(lat)) matches.push({ address: String(m.matchedAddress || "").slice(0, 200), lon, lat });
    }
    return json({ matches, source: "U.S. Census Bureau geocoder (Public_AR_Current)" });
  } catch (e) {
    return json({ error: "upstream unreachable or timed out" }, 502);
  } finally { clearTimeout(t); }
};

export const config = { path: "/api/geocode", method: ["GET"] };
