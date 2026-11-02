// County imagery tiles: City of Columbia GIS 2019 leaf-off (Boone County Assessor) exported per Web Mercator tile.
// Only this one upstream, integer z/x/y, bounded zoom. Cached at the CDN for a week.
const MERC = 20037508.342789244;
const UPSTREAM = "https://gis.gocolumbiamo.com/arcgis/rest/services/BASEMAPS/2019_Imagery_LeafOff/MapServer/export";
const bad = (msg, status = 400) => new Response(JSON.stringify({ error: msg }), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req, context) => {
  const { z, x, y } = context.params;
  if (![z, x, y].every((v) => /^\d{1,7}$/.test(v))) return bad("tile coordinates must be integers");
  const zi = +z, xi = +x, yi = +y;
  if (zi < 13 || zi > 20 || xi < 0 || yi < 0 || xi >= 2 ** zi || yi >= 2 ** zi) return bad("tile out of range");
  const s = (2 * MERC) / 2 ** zi;
  const bbox = [-MERC + xi * s, MERC - (yi + 1) * s, -MERC + (xi + 1) * s, MERC - yi * s].map((v) => v.toFixed(3)).join(",");
  const url = `${UPSTREAM}?${new URLSearchParams({ bbox, bboxSR: "3857", imageSR: "3857", size: "256,256", format: "jpg", transparent: "false", f: "image" })}`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: "error", headers: { accept: "image/*" } });
    if (!r.ok) return bad(`upstream ${r.status}`, 502);
    const ctype = (r.headers.get("content-type") || "").split(";")[0];
    if (!ctype.startsWith("image/")) return bad("upstream returned non-image", 502);
    const buf = await r.arrayBuffer();
    if (buf.byteLength > 2 * 1024 * 1024) return bad("tile too large", 502);
    return new Response(buf, { status: 200, headers: { "content-type": ctype, "cache-control": "public, max-age=86400", "netlify-cdn-cache-control": "public, max-age=604800, durable" } });
  } catch (e) {
    return bad("upstream unreachable or timed out", 502);
  } finally { clearTimeout(t); }
};

export const config = { path: "/api/tile/como2019/:z/:x/:y", method: ["GET", "HEAD"] };
