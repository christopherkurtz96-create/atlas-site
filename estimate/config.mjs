// Atlas Instant Estimate v2 — PRIVATE prototype configuration.
// *** EVERY RATE IN THIS FILE IS A FICTIONAL TEST RATE. NOT ATLAS PRICING. NOT A QUOTE. ***
// Replace the TEST_RATES block with approved Atlas rates before any public use.

export const BRAND = Object.freeze({
  name: 'ATLAS Demolition & Site Work',
  short: 'Atlas',
  phone: '(573) 234-6641',
  phoneHref: 'tel:5732346641',
  smsHref: 'sms:5732346641',
  email: 'chris@deployatlas.com',
  office: 'Columbia, MO',
  city: 'Columbia, MO',
  serviceArea: 'Columbia, Jefferson City, Fulton, Boonville, Mexico, Ashland and the rest of mid-Missouri (about 45 minutes around Columbia). Farther out? Call us.',
});

export const TEST_BADGE = 'TEST — NOT A QUOTE · fictional test rates';
// Tile layers (all through the local proxy; see serve.py TILE_LAYERS)
export const TILES = Object.freeze({
  usgs: { label: 'USGS National Map imagery (USDA NAIP based)', attribution: 'Imagery: USGS The National Map (USDA NAIP)' },
  local: { enabled: true, layer: 'como2019', label: 'City of Columbia GIS 2019 leaf-off aerials (Boone County Assessor, 6-inch)', attribution: 'Aerials: City of Columbia GIS, 2019 (Boone County Assessor)', minzoom: 14, maxzoom: 19, bounds: [-92.75, 38.65, -92.0, 39.25] },
  terrain: { label: 'Tilezen terrain tiles (USGS 3DEP) on AWS', attribution: 'Terrain: Tilezen terrain tiles on AWS (USGS 3DEP)' },
});

// Lead delivery. On the production host, forms POST to Netlify Forms (same rail as the public consultation
// form); Netlify emails each submission to the address configured in the Netlify dashboard. Anywhere else
// (loopback prototype) nothing is sent and the request is saved to the device.
export const DELIVERY = Object.freeze({
  productionHosts: ['deployatlas.com', 'www.deployatlas.com'],
  previewHostSuffix: '.netlify.app',
  notifyEmail: 'chris@deployatlas.com', // configured in Netlify → Forms → Notifications (not used by the code)
  forms: { lead: 'site-visit-request', contact: 'contact' }, // Get my price (both paths) + general contact
});

export const STATUS = Object.freeze({
  estimate: 'ESTIMATE — NOT A QUOTE. Not binding, not guaranteed. A written price after a free site visit is the only real number.',
  estimateTest: 'TEST ESTIMATE — NOT A QUOTE. Fictional test rates. Not binding, not guaranteed. A written price after a free site visit is the only real number.',
  notSent: 'NOT SENT / NOT BOOKED',
  sent: 'SENT — we got it. We call or text back fast to set up your free site visit.',
  sendFailed: 'Could not send. Call or text (573) 234-6641 and we will take it from there.',
});

// Region used to bias address suggestions and as the fallback map centre (downtown Columbia).
export const REGION = Object.freeze({ lon: -92.3341, lat: 38.9517, addressZoom: 19 });

export const MAP = Object.freeze({
  minZoom: 12, maxZoom: 20, defaultZoom: 18.5,
  minSize: 64, maxSize: 1024, maxSpanM: 200000,
  attribution: 'Aerials: City of Columbia GIS 2019 leaf-off (Boone County Assessor) over USGS National Map imagery. Ground: USGS 3DEP via Tilezen terrain tiles and EPQS. Planning only — not a survey.',
  imageryNote: 'Columbia-area aerials are the 2019 county flight (6-inch); elsewhere USGS national imagery, which is coarser.',
  profileSamples: 8,          // max elevation samples per line
  profileMinSpacingM: 10,     // do not sample closer than this
  gradeMinSeparationM: 30,    // below this a DEM grade is meaningless
});

// Slope classes (TEST thresholds) derived from measured USGS grade. No pricing from grade when ground data is unavailable.
export const SLOPE_CLASSES = Object.freeze([
  { id: 'flat', label: 'Flat', maxPct: 3, factor: 0 },
  { id: 'moderate', label: 'Moderate', maxPct: 10, factor: 0.15 },
  { id: 'steep', label: 'Steep', maxPct: Infinity, factor: 0.35 },
]);

export const RANGE = Object.freeze({ lowFactor: 0.9, highFactor: 1.2, roundTo: 50 });

// ---- services (labels are Atlas services; ALL numbers are TEST rates) ----
export const SERVICES = Object.freeze({
  drainage: {
    id: 'drainage', label: 'Drainage', blurb: 'Move water off the wet spot', geometry: 'line', icon: 'drain',
    prompt: 'Tap where the water sits, then follow the path it should take downhill to daylight.',
    editPrompt: 'Drag any point to adjust. Keep tapping to extend the run.',
    options: [
      { id: 'type', label: 'Drain type', ask: 'What kind of drain do you need?', choices: [{ id: 'daylight', label: 'Daylight line', hint: 'Solid pipe from a downspout or low spot to an open outlet' }, { id: 'french', label: 'French drain', hint: 'Perforated pipe in a gravel trench that picks up water along the run' }], default: 'daylight' },
      { id: 'basins', label: 'Catch basins', ask: 'How many catch basins?', help: 'A catch basin is a grated box that takes in surface water.', choices: [{ id: '0', label: 'None' }, { id: '1', label: '1' }, { id: '2', label: '2' }], default: '0' },
      { id: 'crossing', label: 'Does the line cross a driveway?', ask: 'Does the line cross a driveway?', choices: [{ id: 'none', label: 'No' }, { id: 'gravel', label: 'Yes, gravel drive' }, { id: 'concrete', label: 'Yes, concrete' }], default: 'none' },
    ],
    unitLabel: 'ft',
    lengthAsk: 'About how long is the run?', lengthPresets: [50, 80, 130, 200],
    minimum: 3000,
    included: ['Trench dug along the drawn path', 'Perforated or solid pipe as drawn', 'Gravel bedding and backfill', 'Outlet to daylight with a pop-up or grate', 'Trench rough-graded and seeded (sod is extra)'],
    excluded: ['Rock excavation', 'Utility relocation', 'Sod or landscape restoration', 'Permits (passed through at cost)'],
  },
  driveway: {
    id: 'driveway', label: 'Driveway', blurb: 'New gravel or a resurface', geometry: 'line', icon: 'drive',
    prompt: 'Tap the edge of the road where the driveway starts, then follow the path to where it ends.',
    editPrompt: 'Drag any point to adjust. Keep tapping to extend.',
    options: [
      { id: 'job', label: 'Job', ask: 'New driveway or a resurface?', choices: [{ id: 'new', label: 'New', hint: 'No driveway there now' }, { id: 'resurface', label: 'Resurface', hint: 'Fresh stone over an existing gravel drive' }], default: 'new' },
      { id: 'width', label: 'Width', ask: 'How wide?', choices: [{ id: '12', label: '12 ft', hint: 'One vehicle' }, { id: '16', label: '16 ft', hint: 'Room to pass or park' }], default: '12' },
      { id: 'ditch', label: 'Is there a ditch at the road?', ask: 'Is there a ditch at the road?', choices: [{ id: 'culvert', label: 'Yes, add a culvert' }, { id: 'no', label: 'No' }, { id: 'unsure', label: 'Not sure' }], default: 'no' },
    ],
    unitLabel: 'ft',
    lengthAsk: 'About how long is the driveway?', lengthPresets: [100, 150, 300, 500],
    minimum: 3500,
    included: ['Topsoil stripped along the path', 'Woven stabilization fabric (new only)', 'Compacted base stone', 'Top stone compacted into a driving surface', 'Crowned so water sheds both ways', 'Stone delivery included'],
    excluded: ['Tree or stump removal', 'Paving or concrete', 'Permits (passed through at cost)'],
  },
  culvert: {
    id: 'culvert', label: 'Culvert', blurb: 'Pipe where the drive crosses a ditch', geometry: 'line', icon: 'culvert',
    prompt: 'Tap one side of the ditch crossing, then the other side.',
    editPrompt: 'Drag either end to adjust the pipe length.',
    options: [
      { id: 'job', label: 'Job', ask: 'New culvert or replacing one?', choices: [{ id: 'new', label: 'New', hint: 'No pipe there now' }, { id: 'replace', label: 'Replace', hint: 'Old pipe comes out and gets hauled off' }], default: 'new' },
      { id: 'pipe', label: 'Pipe size', ask: 'What size pipe?', help: 'Not sure? Pick 12 in. We confirm the size on site.', choices: [{ id: '12', label: '12 in' }, { id: '15', label: '15 in' }, { id: '18', label: '18 in' }], default: '12' },
    ],
    unitLabel: 'ft',
    lengthAsk: 'How long is the crossing?', lengthPresets: [20, 24, 30, 40],
    minimum: 3000,
    maxLengthFt: 40,
    included: ['Old pipe removed (replace)', 'Pipe set to grade', 'Bedding and compacted backfill', 'Stone over the crossing'],
    excluded: ['County or MoDOT entrance permit passed through at cost (typically $50–300)', 'Headwalls or end sections', 'Road surface restoration'],
  },
  pad: {
    id: 'pad', label: 'Gravel pad', blurb: 'Shed, garage or pole barn', geometry: 'rect', icon: 'pad',
    prompt: 'Tap where the pad goes. Then drag it into place and set the size.',
    editPrompt: 'Drag the pad to move it. Set width and length below.',
    options: [
      { id: 'size', label: 'Size', ask: 'How big is the pad?', choices: [{ id: '12x16', label: 'Shed 12×16' }, { id: '24x24', label: 'Garage 24×24' }, { id: '40x60', label: 'Pole barn 40×60' }, { id: 'custom', label: 'Custom' }], default: '12x16' },
    ],
    unitLabel: 'sq ft',
    minimum: 3500,
    included: ['Topsoil stripped', 'Geotextile fabric', 'Compacted base stone', 'Leveled top stone, compacted', 'Edges feathered to grade'],
    excluded: ['Building, footings or concrete', 'Major cut/fill on steep sites', 'Tree clearing', 'Permits (passed through at cost)'],
  },
});

export const SERVICE_ORDER = ['drainage', 'driveway', 'culvert', 'pad'];

// ---- RATES (USD) — Atlas rates from the Nov 1, 2026 worksheet (ballpark items noted there) ----
// Built as (crew + Cat 308 + hauled mobilization + fuel + net floor) x 1.30 plus materials (+10% waste).
export const TEST_RATES = Object.freeze({
  version: 'ATLAS-2026-11',                   // no "TEST" => badges off
  drainage: {
    perFt: { daylight: 20, french: 32 },      // $ per foot: daylight line / French drain (4" SDR35, French with sock, 18x24 trench)
    basin: 375,                               // $ each catch basin
    crossing: { none: 0, gravel: 600, concrete: 1200 }, // $ each: drain crossing under a drive (gravel cut & patch / saw-cut concrete)
  },
  driveway: {
    perFt: { new: { 12: 48, 16: 64 }, resurface: { 12: 19, 16: 25 } },  // 4" base + 2" top new; 2" top resurface
    culvertAdd: 1800,                         // allowance inside a driveway job when there is a ditch at the road
  },
  culvert: {
    perFt: { 12: 125, 15: 135, 18: 145 },     // HDPE dual-wall, priced at a 30 ft crossing
    replaceFactor: 1.6,                       // full day vs half day plus old-pipe haul-off
  },
  pad: { perSqFt: 5.0 },                      // 4" base + 2" top, all presets
  notes: 'Mobilization folded in at $875 blended (Columbia $750 / outside $1,000); past ~45 min say call us.',
});
export const IS_TEST = /TEST/i.test(TEST_RATES.version);

// Landing "Typical prices" scenarios — computed from TEST rates at runtime so the table always matches the engine.
export const TYPICAL_SCENARIOS = Object.freeze([
  { group: 'Drainage', label: 'Downspout line to daylight, 80 ft', service: 'drainage', opts: { type: 'daylight', basins: '0', crossing: 'none' }, q: { length_ft: 80 } },
  { group: 'Drainage', label: 'French drain, 130 ft with 2 catch basins, moderate slope', service: 'drainage', opts: { type: 'french', basins: '2', crossing: 'none' }, q: { length_ft: 130, gradePct: 5 } },
  { group: 'Driveways and culverts', label: 'New gravel driveway, 150 ft × 12 ft', service: 'driveway', opts: { job: 'new', width: '12', ditch: 'no' }, q: { length_ft: 150 } },
  { group: 'Driveways and culverts', label: 'Driveway resurface, 300 ft', service: 'driveway', opts: { job: 'resurface', width: '12', ditch: 'no' }, q: { length_ft: 300 } },
  { group: 'Driveways and culverts', label: 'New 12 in culvert, 20 ft', service: 'culvert', opts: { job: 'new', pipe: '12' }, q: { length_ft: 20 } },
  { group: 'Driveways and culverts', label: 'Replace 15 in culvert, 24 ft', service: 'culvert', opts: { job: 'replace', pipe: '15' }, q: { length_ft: 24 } },
  { group: 'Gravel pads', label: 'Shed pad, 12 × 16', service: 'pad', opts: { size: '12x16' }, q: { area_sqft: 192 } },
  { group: 'Gravel pads', label: 'Pole barn pad, 40 × 60, flat ground', service: 'pad', opts: { size: '40x60' }, q: { area_sqft: 2400 } },
]);


export const LEAD_FORM = Object.freeze({
  timing: [{ id: 'asap', label: 'As soon as possible' }, { id: 'month', label: 'This month' }, { id: 'flexible', label: 'I am flexible' }],
  contact: [{ id: 'call', label: 'Call' }, { id: 'text', label: 'Text' }, { id: 'email', label: 'Email' }],
});

// ---- Demolition questions (asked one at a time). No online rate for demolition: the answers go with the
// request and the fixed price comes in writing after a free site visit. `what` ids match the old dropdown. ----
const NOT_SURE = { id: 'not_sure', label: 'Not sure' };
export const DEMO_FLOW = Object.freeze({
  what: [
    { id: 'house', label: 'House', blurb: 'Whole house teardown' },
    { id: 'mobile_home', label: 'Mobile home', blurb: 'Single or double wide' },
    { id: 'garage_barn_shed', label: 'Garage, barn or shed', blurb: 'Outbuildings of any size' },
    { id: 'deck', label: 'Deck', blurb: 'Tear off and haul away' },
    { id: 'concrete', label: 'Concrete or asphalt', blurb: 'Driveway, slab, foundation or parking lot' },
    { id: 'interior', label: 'Interior demo', blurb: 'Selective tear-out inside a building' },
    { id: 'other', label: 'Something else', blurb: 'Tell us in a sentence' },
  ],
  size: {
    house: { ask: 'About how big is the house?', choices: [{ id: 'under_1000', label: 'Under 1,000 sq ft' }, { id: '1000_2000', label: '1,000 to 2,000 sq ft' }, { id: '2000_3000', label: '2,000 to 3,000 sq ft' }, { id: 'over_3000', label: 'Over 3,000 sq ft' }, NOT_SURE] },
    mobile_home: { ask: 'Single wide or double wide?', choices: [{ id: 'single', label: 'Single wide' }, { id: 'double', label: 'Double wide' }, NOT_SURE] },
    garage_barn_shed: { ask: 'About how big is it?', choices: [{ id: 'small', label: 'Shed or 1-car garage' }, { id: 'medium', label: '2-car garage' }, { id: 'large', label: 'Barn or large shop' }, NOT_SURE] },
    deck: { ask: 'About how big is the deck?', choices: [{ id: 'under_200', label: 'Under 200 sq ft' }, { id: '200_400', label: '200 to 400 sq ft' }, { id: 'over_400', label: 'Over 400 sq ft' }, NOT_SURE] },
    concrete: { ask: 'What is coming out?', choices: [{ id: 'driveway', label: 'Driveway' }, { id: 'slab', label: 'Slab or patio' }, { id: 'foundation', label: 'Foundation' }, { id: 'parking_lot', label: 'Parking lot' }] },
    interior: { ask: 'How much is coming out?', choices: [{ id: 'one_room', label: 'One room' }, { id: 'several_rooms', label: 'Several rooms' }, { id: 'whole', label: 'A whole floor or building' }, NOT_SURE] },
  },
  after: {
    default: { ask: 'What do you want left when we are done?', choices: [{ id: 'graded', label: 'Backfilled and graded' }, { id: 'pad', label: 'A pad ready to build on' }, { id: 'haul_only', label: 'Just torn out and hauled off' }, { id: 'not_sure', label: 'Not sure yet' }] },
    concrete: { ask: 'Remove only, or remove and replace?', choices: [{ id: 'remove_only', label: 'Remove and haul off only' }, { id: 'replace_concrete', label: 'Remove and pour new concrete' }, { id: 'replace_asphalt', label: 'Remove and repave in asphalt' }, { id: 'not_sure', label: 'Not sure yet' }] },
    interior: { ask: 'How should we leave it?', choices: [{ id: 'studs', label: 'Stripped to the studs' }, { id: 'broom_clean', label: 'Broom clean for the next trade' }, { id: 'not_sure', label: 'Not sure yet' }] },
  },
});
