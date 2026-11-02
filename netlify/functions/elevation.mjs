// Point elevation from USGS EPQS (3DEP). Fallback for when terrain tiles are not loaded in the browser.
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const NUM = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

export default async (req) => {
  const p = new URL(req.url).searchParams;
  const xs = p.get("x") || "", ys = p.get("y") || "";
  if (!NUM.test(xs) || !NUM.test(ys)) return json({ error: "x and y must be numbers" }, 400);
  const x = Number(xs), y = Number(ys);
  if (!(x >= -180 && x <= 180 && y >= -90 && y <= 90)) return json({ error: "x must be lon -180..180 and y must be lat -90..90" }, 400);
  const url = `https://epqs.nationalmap.gov/v1/json?${new URLSearchParams({ x: x.toFixed(7), y: y.toFixed(7), units: "Meters", wkid: "4326", includeDate: "true" })}`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: "error", headers: { accept: "application/json" } });
    if (!r.ok) return json({ error: `upstream ${r.status}` }, 502);
    const j = await r.json();
    const attrs = j && typeof j.attributes === "object" && j.attributes ? j.attributes : {};
    const date = attrs.AcquisitionDate || j.date || j.rasterDate || null;
    const v = Number(j.value);
    const out = { elevation_m: Number.isFinite(v) && v > -10000 ? Math.round(v * 1000) / 1000 : null, raw_value: j.value ?? null, units: "Meters", attribution: j.attribution || "USGS 3DEP via EPQS", resolution_m: Number.isFinite(Number(j.resolution)) ? Number(j.resolution) : null, resolution_units: "meters", date: date ? String(date) : null, source: "USGS EPQS v1" };
    if (out.elevation_m === null) out.error = "EPQS returned no elevation value";
    return json(out);
  } catch (e) {
    return json({ error: "upstream unreachable or timed out" }, 502);
  } finally { clearTimeout(t); }
};

export const config = { path: "/api/elevation", method: ["GET"] };
