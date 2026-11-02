// Geographic math: haversine distances, locally-projected polygon areas,
// Web Mercator (EPSG:3857) projection helpers. Dependency-free.

export const EARTH_R = 6371008.8; // mean Earth radius (m), used for haversine
export const MERC_R = 6378137; // WGS84 semi-major axis, Web Mercator sphere
export const MERC_MAX = 20037508.342789244;
export const FT_PER_M = 3.280839895;
export const SQFT_PER_SQM = 10.763910417;

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export function haversineM(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function pathLengthM(points) {
  let t = 0;
  for (let i = 1; i < points.length; i++) t += haversineM(points[i - 1], points[i]);
  return t;
}

export function segmentLengthsM(points) {
  const out = [];
  for (let i = 1; i < points.length; i++) out.push(haversineM(points[i - 1], points[i]));
  return out;
}

// Local equirectangular projection around the polygon centroid latitude
// (x scaled by cos(lat0)) — appropriate latitude correction for parcel-scale areas.
export function localXY(points) {
  if (!points.length) return [];
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lon0 = points.reduce((s, p) => s + p.lon, 0) / points.length;
  const k = Math.cos(rad(lat0));
  return points.map((p) => ({ x: EARTH_R * rad(p.lon - lon0) * k, y: EARTH_R * rad(p.lat - lat0) }));
}

export function polygonAreaM2(points) {
  if (points.length < 3) return 0;
  const xy = localXY(points);
  let s = 0;
  for (let i = 0; i < xy.length; i++) {
    const a = xy[i];
    const b = xy[(i + 1) % xy.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

export function polygonPerimeterM(points) {
  if (points.length < 2) return 0;
  return pathLengthM(points) + (points.length > 2 ? haversineM(points[points.length - 1], points[0]) : 0);
}

export function longestEdgeM(points) {
  if (points.length < 2) return 0;
  let best = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    if (j === 0 && points.length < 3) break;
    best = Math.max(best, haversineM(points[i], points[j]));
  }
  return best;
}

// --- polygon validity ---
function segmentsIntersect(p1, p2, p3, p4) {
  const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (a, b, c) => Math.min(a.x, b.x) - 1e-9 <= c.x && c.x <= Math.max(a.x, b.x) + 1e-9 && Math.min(a.y, b.y) - 1e-9 <= c.y && c.y <= Math.max(a.y, b.y) + 1e-9;
  if (Math.abs(d1) < 1e-9 && on(p3, p4, p1)) return true;
  if (Math.abs(d2) < 1e-9 && on(p3, p4, p2)) return true;
  if (Math.abs(d3) < 1e-9 && on(p1, p2, p3)) return true;
  if (Math.abs(d4) < 1e-9 && on(p1, p2, p4)) return true;
  return false;
}

// Returns { ok, error, code } for a closed polygon: rejects too few points,
// duplicate/near-duplicate vertices, self-crossing (bow-tie) outlines and zero area.
export function validatePolygon(points) {
  const n = points.length;
  if (n < 3) return { ok: false, code: 'too-few', error: 'A closed area needs at least 3 corners.' };
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (haversineM(points[i], points[j]) < 0.5) return { ok: false, code: 'duplicate', error: `Corners ${i + 1} and ${j + 1} are on top of each other. Move or undo one of them.` };
  }
  const xy = localXY(points);
  for (let i = 0; i < n; i++) {
    const a = xy[i], b = xy[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // adjacent edges share a vertex
      const c = xy[j], d = xy[(j + 1) % n];
      if (segmentsIntersect(a, b, c, d)) return { ok: false, code: 'crossing', error: `The outline crosses itself (edge ${i + 1} crosses edge ${j + 1}). Fix the outline so edges do not cross, then continue.` };
    }
  }
  if (polygonAreaM2(points) < 0.5) return { ok: false, code: 'zero-area', error: 'The outline encloses no area (corners are in a line). Move a corner to form a shape.' };
  return { ok: true, code: 'ok', error: null };
}

// --- Web Mercator ---
export function lonLatToMerc({ lon, lat }) {
  const la = Math.max(-85.05112878, Math.min(85.05112878, lat));
  return { x: MERC_R * rad(lon), y: MERC_R * Math.log(Math.tan(Math.PI / 4 + rad(la) / 2)) };
}

export function mercToLonLat({ x, y }) {
  return { lon: deg(x / MERC_R), lat: deg(2 * Math.atan(Math.exp(y / MERC_R)) - Math.PI / 2) };
}

export function resolutionAt(zoom) {
  return (2 * Math.PI * MERC_R) / 256 / 2 ** zoom; // meters per pixel (Web Mercator units)
}

export function bboxFor(center, zoom, w, h) {
  const c = lonLatToMerc(center);
  const r = resolutionAt(zoom);
  return [c.x - (w / 2) * r, c.y - (h / 2) * r, c.x + (w / 2) * r, c.y + (h / 2) * r];
}

export function lonLatToPixel(p, center, zoom, w, h) {
  const c = lonLatToMerc(center);
  const m = lonLatToMerc(p);
  const r = resolutionAt(zoom);
  return { x: w / 2 + (m.x - c.x) / r, y: h / 2 - (m.y - c.y) / r };
}

export function pixelToLonLat(px, center, zoom, w, h) {
  const c = lonLatToMerc(center);
  const r = resolutionAt(zoom);
  return mercToLonLat({ x: c.x + (px.x - w / 2) * r, y: c.y - (px.y - h / 2) * r });
}

export const mToFt = (m) => m * FT_PER_M;
export const m2ToSqft = (m2) => m2 * SQFT_PER_SQM;
export const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
