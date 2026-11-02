// v2 aerial map on MapLibre GL JS (self-hosted, BSD). Imagery and terrain tiles come only
// through the fixed local proxy (/api/tile/<layer>/z/x/y). Drawing: tap to add line points,
// draggable vertices and midpoints, tap-to-place rectangles that drag and rotate. 3D terrain view.
import * as ML from './vendor/maplibre-gl.mjs';
import { MAP, TILES } from './config.mjs';
import { haversineM, segmentLengthsM, pathLengthM, round, mToFt } from './geo.mjs';

const maplibregl = ML.default || ML;

import { screenToSvg, offsetM, rectCorners } from './shapes.mjs';
export { screenToSvg, offsetM, rectCorners };

const toLL = (p) => [p.lon, p.lat];
const fromLL = (ll) => ({ lon: ll.lng ?? ll[0], lat: ll.lat ?? ll[1] });

export function createMap(root, opts = {}) {
  const S = { shape: null, armed: null, rectDefaults: { w_m: 3.66, l_m: 4.88, rot_deg: 0 }, loaded: false, view3d: false, status: '' };
  const onChange = opts.onChange || (() => {});
  const onView = opts.onView || (() => {});
  root.classList.add('amap');
  root.innerHTML = `<div class="amap-canvas" data-testid="map-canvas"></div>
    <div class="amap-msg" data-testid="map-loading">Loading map…</div>
    <div class="amap-msg amap-err" data-testid="map-error" hidden></div>
    <div class="amap-status" data-testid="map-status" hidden></div>
    <span class="sr-only" data-testid="map-attribution">${MAP.attribution}</span>`;
  const q = (t) => root.querySelector(`[data-testid=${t}]`);
  const canvasEl = q('map-canvas'), loading = q('map-loading'), errBox = q('map-error'), status = q('map-status');

  const style = {
    version: 8,
    sources: {
      usgs: { type: 'raster', tiles: ['/api/tile/usgs/{z}/{x}/{y}'], tileSize: 256, maxzoom: 16, attribution: TILES.usgs.attribution },
      ...(TILES.local.enabled ? { local: { type: 'raster', tiles: [`/api/tile/${TILES.local.layer}/{z}/{x}/{y}`], tileSize: 256, minzoom: TILES.local.minzoom, maxzoom: TILES.local.maxzoom, bounds: TILES.local.bounds, attribution: TILES.local.attribution } } : {}),
      terrain: { type: 'raster-dem', tiles: ['/api/tile/terrain/{z}/{x}/{y}'], tileSize: 256, encoding: 'terrarium', maxzoom: 15, attribution: TILES.terrain.attribution },
      shape: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'usgs', type: 'raster', source: 'usgs' },
      ...(TILES.local.enabled ? [{ id: 'local', type: 'raster', source: 'local', minzoom: TILES.local.minzoom - 1 }] : []),
      { id: 'rect-fill', type: 'fill', source: 'shape', filter: ['==', ['get', 'kind'], 'rect'], paint: { 'fill-color': '#F74500', 'fill-opacity': 0.3 } },
      { id: 'rect-line', type: 'line', source: 'shape', filter: ['==', ['get', 'kind'], 'rect'], paint: { 'line-color': '#F74500', 'line-width': 3 } },
      { id: 'line-halo', type: 'line', source: 'shape', filter: ['==', ['get', 'kind'], 'line'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': 'rgba(0,0,0,0.6)', 'line-width': 9 } },
      { id: 'line', type: 'line', source: 'shape', filter: ['==', ['get', 'kind'], 'line'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#F74500', 'line-width': 5 } },
    ],
  };
  let map;
  try {
    map = new maplibregl.Map({ container: canvasEl, style, center: toLL(opts.center), zoom: opts.zoom ?? MAP.defaultZoom, minZoom: MAP.minZoom, maxZoom: MAP.maxZoom, pitch: 0, bearing: 0, attributionControl: false, maxPitch: 70, fadeDuration: 0 });
  } catch (e) { showError(`Map engine failed to start: ${e.message}`); return stubApi(); }
  map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
  map.addControl(new maplibregl.ScaleControl({ unit: 'imperial', maxWidth: 120 }), 'bottom-left');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.on('load', () => {
    S.loaded = true; loading.hidden = true; root.dataset.loaded = '1';
    try { map.setTerrain({ source: 'terrain', exaggeration: 1 }); } catch (e) { console.warn('terrain unavailable', e); }
    render();
  });
  map.on('error', (e) => { const msg = e && e.error && e.error.message ? e.error.message : 'map error'; if (/tile|Failed to fetch|404|AJAX/i.test(msg)) return; console.warn('map error', msg); });
  map.on('moveend', () => onView(getView()));
  function showError(msg) { loading.hidden = true; errBox.hidden = false; errBox.textContent = msg; root.dataset.error = '1'; }

  // ---- shape rendering ----
  let markers = [];
  function clearMarkers() { markers.forEach((m) => m.remove()); markers = []; }
  function mk(cls, ll, { draggable = false, html = '', testid = '' } = {}) {
    const el = document.createElement('div'); el.className = cls; if (html) el.innerHTML = html; if (testid) el.setAttribute('data-testid', testid);
    const m = new maplibregl.Marker({ element: el, draggable, anchor: 'center' }).setLngLat(toLL(ll)).addTo(map);
    markers.push(m); return m;
  }
  // Swallow only click/dblclick on handles (so a tap on a handle never adds a point); mousedown/touchstart must
  // reach the map because MapLibre starts marker drags from the map's own mousedown handler.
  function stop(el) { ['click', 'dblclick'].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation())); }
  function render() {
    if (!S.loaded) return;
    clearMarkers();
    const sh = S.shape; const features = [];
    if (sh && sh.kind === 'line') {
      if (sh.points.length >= 2) features.push({ type: 'Feature', properties: { kind: 'line' }, geometry: { type: 'LineString', coordinates: sh.points.map(toLL) } });
      sh.points.forEach((p, i) => {
        const m = mk(`vtx${i === 0 ? ' first' : ''}`, p, { draggable: true, testid: `vertex-${i}` });
        stop(m.getElement());
        m.on('drag', () => { S.shape.points[i] = fromLL(m.getLngLat()); refreshLine(); });
        m.on('dragend', () => changed());
      });
      segmentLengthsM(sh.points).forEach((mLen, i) => {
        const a = sh.points[i], b = sh.points[i + 1]; const mid = { lon: (a.lon + b.lon) / 2, lat: (a.lat + b.lat) / 2 };
        const lab = mk('seg', mid, { html: `${Math.round(mToFt(mLen))} ft` }); lab.getElement().style.pointerEvents = 'none';
        const h = mk('mid', mid, { draggable: true, testid: `mid-${i}` }); stop(h.getElement());
        let idx = null;
        h.on('dragstart', () => { idx = i + 1; S.shape.points.splice(idx, 0, fromLL(h.getLngLat())); });
        h.on('drag', () => { if (idx !== null) { S.shape.points[idx] = fromLL(h.getLngLat()); refreshLine(); } });
        h.on('dragend', () => { idx = null; changed(); });
      });
      if (sh.points.length === 1) { const lab = mk('seg', sh.points[0], { html: 'Start' }); lab.getElement().style.pointerEvents = 'none'; lab.setOffset([0, -18]); }
    } else if (sh && sh.kind === 'rect') {
      const c = rectCorners(sh);
      features.push({ type: 'Feature', properties: { kind: 'rect' }, geometry: { type: 'Polygon', coordinates: [[...c.map(toLL), toLL(c[0])]] } });
      const lab = mk('seg', sh.center, { html: `${Math.round(mToFt(sh.w_m))} × ${Math.round(mToFt(sh.l_m))} ft` }); lab.getElement().style.pointerEvents = 'none';
      const h = mk('rect-handle', sh.center, { draggable: true, testid: 'rect-handle', html: '✥' }); stop(h.getElement());
      h.on('drag', () => { S.shape.center = fromLL(h.getLngLat()); refreshRect(); });
      h.on('dragend', () => changed());
    }
    map.getSource('shape').setData({ type: 'FeatureCollection', features });
    root.dataset.points = sh ? (sh.kind === 'line' ? sh.points.length : 1) : 0;
    root.dataset.armed = S.armed || '';
    map.getCanvas().style.cursor = S.armed ? 'crosshair' : '';
  }
  function refreshLine() { const sh = S.shape; const f = sh.points.length >= 2 ? [{ type: 'Feature', properties: { kind: 'line' }, geometry: { type: 'LineString', coordinates: sh.points.map(toLL) } }] : []; map.getSource('shape').setData({ type: 'FeatureCollection', features: f }); }
  function refreshRect() { const c = rectCorners(S.shape); map.getSource('shape').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'rect' }, geometry: { type: 'Polygon', coordinates: [[...c.map(toLL), toLL(c[0])]] } }] }); }
  function changed() { render(); onChange(getGeometry()); }

  // ---- drag the pad body ----
  let rectDrag = null;
  function startRectDrag(e) {
    if (!S.shape || S.shape.kind !== 'rect') return;
    e.preventDefault(); map.dragPan.disable();
    rectDrag = { start: fromLL(e.lngLat), c0: { ...S.shape.center } };
  }
  function moveRectDrag(e) { if (!rectDrag) return; const p = fromLL(e.lngLat); S.shape.center = { lon: rectDrag.c0.lon + (p.lon - rectDrag.start.lon), lat: rectDrag.c0.lat + (p.lat - rectDrag.start.lat) }; refreshRect(); markers.forEach((m) => { if (m.getElement().classList.contains('rect-handle') || m.getElement().classList.contains('seg')) m.setLngLat(toLL(S.shape.center)); }); }
  function endRectDrag() { if (!rectDrag) return; rectDrag = null; map.dragPan.enable(); changed(); }
  map.on('mousedown', 'rect-fill', startRectDrag); map.on('touchstart', 'rect-fill', startRectDrag);
  map.on('mousemove', moveRectDrag); map.on('touchmove', moveRectDrag);
  map.on('mouseup', endRectDrag); map.on('touchend', endRectDrag);
  map.on('mouseenter', 'rect-fill', () => { if (!S.armed) map.getCanvas().style.cursor = 'move'; });
  map.on('mouseleave', 'rect-fill', () => { map.getCanvas().style.cursor = S.armed ? 'crosshair' : ''; });

  // ---- tap to add / place ----
  map.on('click', (e) => {
    if (rectDrag) return;
    const ll = fromLL(e.lngLat);
    if (S.armed === 'line') {
      if (!S.shape || S.shape.kind !== 'line') S.shape = { kind: 'line', points: [] };
      const last = S.shape.points[S.shape.points.length - 1];
      if (last && haversineM(last, ll) < 1) return;
      S.shape.points.push(ll); changed();
    } else if (S.armed === 'rect') {
      S.shape = { kind: 'rect', center: ll, ...S.rectDefaults }; changed();
    }
  });
  map.doubleClickZoom.disable();
  map.getCanvasContainer().setAttribute('aria-label', 'Aerial map. Drag to pan, scroll or pinch to zoom. Arrow keys move the map; Enter adds a point at the center.');
  map.getCanvasContainer().addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !S.armed) return;
    const c = fromLL(map.getCenter());
    if (S.armed === 'line') { if (!S.shape || S.shape.kind !== 'line') S.shape = { kind: 'line', points: [] }; S.shape.points.push(c); } else S.shape = { kind: 'rect', center: c, ...S.rectDefaults };
    changed(); e.preventDefault();
  });

  // ---- API ----
  function getView() { const c = map.getCenter(); return { center: { lon: +c.lng.toFixed(7), lat: +c.lat.toFixed(7) }, zoom: round(map.getZoom(), 2), bearing: round(map.getBearing(), 1), pitch: round(map.getPitch(), 1), view: S.view3d ? '3d' : 'top', engine: `MapLibre GL JS ${maplibregl.version || ''}`.trim(), imagery: TILES.local.enabled ? `${TILES.local.label} over ${TILES.usgs.label}` : TILES.usgs.label };
  }
  function getGeometry() {
    const sh = S.shape; if (!sh) return null;
    if (sh.kind === 'line') { const m = pathLengthM(sh.points); return { kind: 'line', points: sh.points.map((p) => ({ lon: +p.lon.toFixed(7), lat: +p.lat.toFixed(7) })), length_m: round(m, 2), length_ft: round(mToFt(m), 1), segments_ft: segmentLengthsM(sh.points).map((x) => round(mToFt(x), 1)) }; }
    const c = rectCorners(sh);
    return { kind: 'rect', center: { lon: +sh.center.lon.toFixed(7), lat: +sh.center.lat.toFixed(7) }, corners: c.map((p) => ({ lon: +p.lon.toFixed(7), lat: +p.lat.toFixed(7) })), width_ft: round(mToFt(sh.w_m), 1), length_ft: round(mToFt(sh.l_m), 1), area_sqft: round(mToFt(sh.w_m) * mToFt(sh.l_m), 0), rot_deg: sh.rot_deg || 0 };
  }
  function stubApi() { const n = () => {}; return { load: n, getView: () => null, getGeometry: () => null, setStatus: n, setCenter: n, arm: n, setRect: n, setShape: n, getShape: () => null, undo: n, clear: n, zoomIn: n, zoomOut: n, set3D: n, sampleElevation: () => null, imageState: () => 'error', isLoaded: () => false }; }
  return {
    load() { map.resize(); },
    getView, getGeometry,
    setStatus(text) { S.status = text || ''; status.hidden = !text; status.textContent = text || ''; },
    setCenter(c, zoom) { map.flyTo({ center: toLL(c), zoom: zoom || map.getZoom(), essential: true }); },
    arm(kind, rectDefaults) { S.armed = kind; if (rectDefaults) S.rectDefaults = { ...S.rectDefaults, ...rectDefaults }; render(); },
    setRect(patch) { if (S.shape && S.shape.kind === 'rect') { Object.assign(S.shape, patch); changed(); } else { S.rectDefaults = { ...S.rectDefaults, ...patch }; } },
    setShape(shape) { S.shape = shape ? JSON.parse(JSON.stringify(shape)) : null; render(); },
    getShape() { return S.shape ? JSON.parse(JSON.stringify(S.shape)) : null; },
    undo() { if (!S.shape) return; if (S.shape.kind === 'line') { S.shape.points.pop(); if (!S.shape.points.length) S.shape = null; } else S.shape = null; changed(); },
    clear() { S.shape = null; changed(); },
    zoomIn: () => map.zoomIn(), zoomOut: () => map.zoomOut(),
    set3D(on) { S.view3d = !!on; map.easeTo({ pitch: on ? 60 : 0, bearing: 0, duration: 600 }); root.dataset.view = on ? '3d' : 'top'; onView(getView()); },
    // Terrain-tile elevation in meters for each point (null where unavailable). Only works once terrain tiles are loaded.
    sampleElevation(points) { try { return points.map((p) => { const v = map.queryTerrainElevation(toLL(p)); return Number.isFinite(v) ? v : null; }); } catch (_) { return points.map(() => null); } },
    imageState: () => (root.dataset.error ? 'error' : S.loaded ? 'loaded' : 'loading'),
    isLoaded: () => S.loaded,
    _map: map,
  };
}
