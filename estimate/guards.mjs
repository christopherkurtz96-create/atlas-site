// Client-side guards (mirrored server-side in serve.py). Pure functions, unit-tested.
import { MERC_MAX } from './geo.mjs';
import { MAP } from './config.mjs';

export const LOOPBACK_HOSTS = Object.freeze(['127.0.0.1', 'localhost', '[::1]', '::1']);
export const PRODUCTION_HOSTS = Object.freeze(['deployatlas.com', 'www.deployatlas.com']);
export function isAllowedHostname(h) { return isLoopbackHostname(h) || (typeof h === 'string' && (PRODUCTION_HOSTS.includes(h.toLowerCase()) || /\.netlify\.app$/i.test(h))); }

export function isLoopbackHostname(h) {
  return typeof h === 'string' && LOOPBACK_HOSTS.includes(h.toLowerCase());
}

export function isFinitePositive(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function validateLonLat(lon, lat) {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return { ok: false, error: 'Coordinates must be finite numbers.' };
  if (lon < -180 || lon > 180) return { ok: false, error: 'Longitude must be between -180 and 180.' };
  if (lat < -85 || lat > 85) return { ok: false, error: 'Latitude must be between -85 and 85.' };
  return { ok: true, lon, lat };
}

export function validateSize(w, h) {
  const ok = (v) => Number.isInteger(v) && v >= MAP.minSize && v <= MAP.maxSize;
  if (!ok(w) || !ok(h)) return { ok: false, error: `Image size must be integers ${MAP.minSize}–${MAP.maxSize}.` };
  return { ok: true, w, h };
}

export function validateBbox(b) {
  if (!Array.isArray(b) || b.length !== 4 || !b.every((v) => typeof v === 'number' && Number.isFinite(v))) {
    return { ok: false, error: 'bbox must be four finite numbers.' };
  }
  const [x0, y0, x1, y1] = b;
  if ([x0, y0, x1, y1].some((v) => Math.abs(v) > MERC_MAX)) return { ok: false, error: 'bbox out of Web Mercator bounds.' };
  if (!(x1 > x0 && y1 > y0)) return { ok: false, error: 'bbox min must be less than max.' };
  if (x1 - x0 > MAP.maxSpanM || y1 - y0 > MAP.maxSpanM) return { ok: false, error: 'bbox span too large.' };
  if (x1 - x0 < 1 || y1 - y0 < 1) return { ok: false, error: 'bbox span too small.' };
  return { ok: true, bbox: [x0, y0, x1, y1] };
}

export function validateAddress(s) {
  if (typeof s !== 'string') return { ok: false, error: 'Address required.' };
  const t = s.trim();
  if (t.length < 3 || t.length > 200) return { ok: false, error: 'Address must be 3–200 characters.' };
  if (!/^[A-Za-z0-9 ,.#'\-/]+$/.test(t)) return { ok: false, error: 'Address may only contain letters, digits, spaces and , . # \' - /' };
  return { ok: true, address: t };
}

// Builds the fixed local API URL for imagery; refuses anything invalid.
export function naipUrl(bbox, w, h) {
  const vb = validateBbox(bbox);
  const vs = validateSize(w, h);
  if (!vb.ok) throw new Error(vb.error);
  if (!vs.ok) throw new Error(vs.error);
  const q = new URLSearchParams({ bbox: vb.bbox.map((v) => v.toFixed(3)).join(','), size: `${vs.w},${vs.h}` });
  return `/api/naip?${q.toString()}`;
}
