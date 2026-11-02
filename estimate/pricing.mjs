// v2 pricing engine — TEST RATES ONLY. Pure functions, unit-testable.
import { SERVICES, TEST_RATES, SLOPE_CLASSES, RANGE, IS_TEST } from './config.mjs';

export const roundTo = (n, step) => Math.round(n / step) * step;

export function slopeClass(gradePct) {
  if (gradePct === null || gradePct === undefined || !Number.isFinite(gradePct)) return null;
  const g = Math.abs(gradePct);
  return SLOPE_CLASSES.find((c) => g < c.maxPct) || SLOPE_CLASSES[SLOPE_CLASSES.length - 1];
}

export function padDims(sizeId, custom) {
  if (sizeId === 'custom') {
    const w = Number(custom?.width_ft), l = Number(custom?.length_ft);
    return { width_ft: Number.isFinite(w) && w > 0 ? w : 20, length_ft: Number.isFinite(l) && l > 0 ? l : 20 };
  }
  const [w, l] = String(sizeId).split('x').map(Number);
  return { width_ft: w, length_ft: l };
}

// q: { length_ft?, area_sqft?, gradePct? (null = unknown) }
// returns null when there is nothing to price yet
export function evaluate(serviceId, opts, q) {
  const svc = SERVICES[serviceId];
  if (!svc) return null;
  const lines = [];
  let units = 0, unitPrice = 0, base = 0;
  const o = { ...Object.fromEntries(svc.options.map((x) => [x.id, x.default])), ...(opts || {}) };

  if (serviceId === 'drainage') {
    units = q.length_ft || 0; if (units <= 0) return null;
    unitPrice = TEST_RATES.drainage.perFt[o.type] ?? TEST_RATES.drainage.perFt.daylight;
    base = units * unitPrice;
    lines.push({ label: `${fmtNum(units)} ft × $${unitPrice} / ft (${o.type === 'french' ? 'French drain' : 'daylight line'})`, amount: base });
    const basins = Number(o.basins) || 0;
    if (basins > 0) { const a = basins * TEST_RATES.drainage.basin; lines.push({ label: `${basins} catch basin${basins > 1 ? 's' : ''} × $${TEST_RATES.drainage.basin}`, amount: a }); base += a; }
    const cross = TEST_RATES.drainage.crossing[o.crossing] || 0;
    if (cross > 0) { lines.push({ label: `Crossing under the drive (${o.crossing === 'concrete' ? 'saw-cut concrete' : 'gravel cut and patch'})`, amount: cross }); base += cross; }
  } else if (serviceId === 'driveway') {
    units = q.length_ft || 0; if (units <= 0) return null;
    const width = o.width === '16' ? 16 : 12;
    unitPrice = TEST_RATES.driveway.perFt[o.job === 'resurface' ? 'resurface' : 'new'][width];
    base = units * unitPrice;
    lines.push({ label: `${fmtNum(units)} ft × $${unitPrice} / ft (${o.job === 'resurface' ? 'resurface' : 'new'}, ${width} ft wide)`, amount: base });
    if (o.ditch === 'culvert') { lines.push({ label: 'Culvert at the road (allowance)', amount: TEST_RATES.driveway.culvertAdd }); base += TEST_RATES.driveway.culvertAdd; }
  } else if (serviceId === 'culvert') {
    units = q.length_ft || 0; if (units <= 0) return null;
    const pipe = TEST_RATES.culvert.perFt[o.pipe] ?? TEST_RATES.culvert.perFt[12];
    unitPrice = o.job === 'replace' ? pipe * TEST_RATES.culvert.replaceFactor : pipe;
    base = units * unitPrice;
    lines.push({ label: `${fmtNum(units)} ft × $${fmtNum(unitPrice)} / ft (${o.pipe} in, ${o.job === 'replace' ? 'replace' : 'new'})`, amount: base });
  } else if (serviceId === 'pad') {
    units = q.area_sqft || 0; if (units <= 0) return null;
    unitPrice = TEST_RATES.pad.perSqFt;
    base = units * unitPrice;
    lines.push({ label: `${fmtNum(units)} sq ft × $${unitPrice} / sq ft`, amount: base });
  }

  // Slope modifier only from real measured grade. Unknown grade => no modifier, flagged.
  const sc = slopeClass(q.gradePct);
  let slopeAmount = 0;
  if (sc && sc.factor > 0) { slopeAmount = base * sc.factor; lines.push({ label: `${sc.label} ground +${Math.round(sc.factor * 100)}% (measured ${Math.abs(q.gradePct).toFixed(1)}%)`, amount: slopeAmount }); }
  let subtotal = base + slopeAmount;
  let minimumApplied = false;
  if (subtotal < svc.minimum) { lines.push({ label: `Job minimum $${svc.minimum.toLocaleString('en-US')}`, amount: svc.minimum - subtotal }); subtotal = svc.minimum; minimumApplied = true; }

  const typical = roundTo(subtotal, RANGE.roundTo);
  const low = roundTo(subtotal * RANGE.lowFactor, RANGE.roundTo);
  const high = roundTo(subtotal * RANGE.highFactor, RANGE.roundTo);
  return {
    service: serviceId, options: o, units: Math.round(units * 10) / 10, unitLabel: svc.unitLabel,
    unitPrice: Math.round((subtotal / units) * 100) / 100, typical, low, high, minimumApplied,
    slope: sc ? { id: sc.id, label: sc.label, factor: sc.factor, gradePct: q.gradePct } : null,
    groundKnown: sc !== null,
    lines, included: svc.included, excluded: svc.excluded,
    rateVersion: TEST_RATES.version, test: IS_TEST,
  };
}

export const fmtNum = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
export const money = (n) => '$' + Math.round(Number(n)).toLocaleString('en-US');
