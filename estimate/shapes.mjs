// Pure shape helpers shared by the map module and the unit tests (no browser dependencies).
import { EARTH_R } from './geo.mjs';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// Pure helpers (unit-tested)
export function screenToSvg(ctm, clientX, clientY) {
  const { a, b, c, d, e, f } = ctm; const det = a * d - b * c;
  if (!det) return { x: clientX - e, y: clientY - f };
  const x = clientX - e, y = clientY - f;
  return { x: (d * x - c * y) / det, y: (-b * x + a * y) / det };
}
export function offsetM(p, dx, dy) {
  return { lon: p.lon + deg(dx / (EARTH_R * Math.cos(rad(p.lat)))), lat: p.lat + deg(dy / EARTH_R) };
}
export function rectCorners(rect) {
  const w = rect.w_m / 2, l = rect.l_m / 2, t = rad(rect.rot_deg || 0);
  return [[-w, l], [w, l], [w, -l], [-w, -l]].map(([x, y]) => offsetM(rect.center, x * Math.cos(t) + y * Math.sin(t), -x * Math.sin(t) + y * Math.cos(t)));
}

