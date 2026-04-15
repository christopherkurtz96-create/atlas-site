// Atlas Instant Bid Calculator
// Wizard logic, pricing engine, zip distance lookup, UTM capture, N8N webhook

(function () {
    'use strict';

    // ==========================================
    // Configuration & Pricing Tables
    // ==========================================

    var WEBHOOK_URL = 'https://prexinvestments.app.n8n.cloud/webhook/atlas-instant-bid';

    // Base prices
    var BASE_PRICES = {
        'shed-removal':        1500,
        'detached-garage-demo': 3500,
        'mobile-home-removal': 7000,
        'concrete-removal':    6.00,   // per sq ft
        'deck-porch-demo':     1800,
        'outbuilding-barn':    4000,
        'forestry-mulching':   2500,   // per acre
        'brush-hogging':       250,    // per acre
        'lot-clearing':        5500,   // per acre
        'fence-line-clearing': 3.00,   // per linear ft
        'trail-cutting':       4.00    // per linear ft
    };

    // Size multipliers
    var SIZE_MULT = {
        'shed-removal':        { 'Small (under 120 sq ft)': 0.70, 'Medium (120–200 sq ft)': 1.00, 'Large (200+ sq ft)': 1.40 },
        'detached-garage-demo': { 'Single car': 1.00, 'Two car': 1.45, 'Oversized / three car': 1.85 },
        'mobile-home-removal': { 'Single-wide': 1.00, 'Double-wide': 1.50 },
        'deck-porch-demo':     { 'Small (under 200 sq ft)': 0.75, 'Medium (200–400 sq ft)': 1.00, 'Large (400+ sq ft)': 1.50 },
        'outbuilding-barn':    { 'Small (under 500 sq ft)': 0.70, 'Medium (500–1000 sq ft)': 1.00, 'Large (1000+ sq ft)': 1.50 }
    };

    var CONSTRUCTION_MULT = { 'Wood frame': 1.00, 'Metal': 1.10, 'Block or brick': 1.25 };
    var FOUNDATION_MULT   = { 'On blocks / skids': 1.00, 'Slab stays': 1.00, 'Remove slab too': 1.30, 'None (dirt floor)': 1.00 };
    var ACCESS_MULT       = { 'Easy (open lot)': 1.00, 'Moderate (some obstacles)': 1.10, 'Tight (fenced, close to structures)': 1.20 };
    var ROOFING_MULT      = { 'Metal': 1.00, 'Shingles': 1.30 };

    // Shed-specific: bumped so "Remove slab too" actually covers slab disposal on larger sheds
    var SHED_FOUNDATION_MULT = { 'On blocks / skids': 1.00, 'Slab stays': 1.00, 'Remove slab too': 1.50 };

    // Barn-specific: slab removal is a bigger job on a barn than on a shed or garage
    var BARN_FOUNDATION_MULT = { 'None (dirt floor)': 1.00, 'Slab stays': 1.00, 'Remove slab too': 1.60 };

    // Mobile home specifics
    var SKIRTING_MULT  = { 'No': 1.00, 'Yes': 1.10 };

    // Deck specifics
    var HEIGHT_MULT   = { 'Ground level': 1.00, 'Elevated (high off ground or 2nd story)': 1.25 };
    var ATTACHED_MULT = { 'No': 1.00, 'Yes': 1.10 };

    // Concrete specifics
    var THICKNESS_MULT   = { 'Standard 4"': 1.00, 'Heavy 6"+': 1.40 };
    var REBAR_MULT       = { 'None': 1.00, 'Rebar present': 1.25 };
    var CONCRETE_TYPE_MULT = { 'Driveway': 1.00, 'Patio': 0.95, 'Sidewalk': 0.90, 'Foundation slab': 1.15 };

    // Land clearing
    var BRUSH_MULT   = { 'Light (easy to walk through)': 0.80, 'Medium (noticeable brush and saplings)': 1.00, 'Dense (nearly impassable)': 1.30 };
    var TERRAIN_MULT = { 'Flat': 1.00, 'Rolling': 1.10, 'Steep': 1.25 };
    var TREES_MULT   = { 'Few small trees': 1.00, 'Moderate trees': 1.20, 'Heavy timber': 1.50 };

    // Brush hogging (pastures, fields, grasses — not woods)
    var BRUSH_HOG_VEG = {
        'Light (short grass, maintained)': 0.80,
        'Moderate (knee-high grass, weeds)': 1.00,
        'Heavy (tall grass, woody weeds, saplings)': 1.40
    };

    // Questions per job type
    var JOB_QUESTIONS = {
        'shed-removal': [
            { key: 'size', label: 'What size is the shed?', options: Object.keys(SIZE_MULT['shed-removal']) },
            { key: 'roofing', label: 'Roofing material?', options: Object.keys(ROOFING_MULT) },
            { key: 'foundation', label: 'What type of foundation?', options: ['On blocks / skids', 'Slab stays', 'Remove slab too'] }
        ],
        'detached-garage-demo': [
            { key: 'size', label: 'What size garage?', options: Object.keys(SIZE_MULT['detached-garage-demo']) },
            { key: 'construction', label: 'Construction type?', options: Object.keys(CONSTRUCTION_MULT) },
            { key: 'roofing', label: 'Roofing material?', options: Object.keys(ROOFING_MULT) },
            { key: 'foundation', label: 'Foundation?', options: ['Slab stays', 'Remove slab too'] },
            { key: 'access', label: 'Site access?', options: Object.keys(ACCESS_MULT) }
        ],
        'mobile-home-removal': [
            { key: 'size', label: 'What type of mobile home?', options: Object.keys(SIZE_MULT['mobile-home-removal']) },
            { key: 'skirting', label: 'Include deck removal?', options: Object.keys(SKIRTING_MULT) },
            { key: 'access', label: 'Site access?', options: Object.keys(ACCESS_MULT) }
        ],
        'concrete-removal': [
            { key: 'area', label: 'Approximate area (sq ft)?', type: 'preset', presets: [100, 200, 300, 400, 500, 750, 1000], unit: 'sq ft', customLabel: 'sq ft' },
            { key: 'thickness', label: 'Thickness?', options: Object.keys(THICKNESS_MULT) },
            { key: 'rebar', label: 'Rebar?', options: Object.keys(REBAR_MULT) },
            { key: 'concreteType', label: 'Type of concrete?', options: Object.keys(CONCRETE_TYPE_MULT) }
        ],
        'deck-porch-demo': [
            { key: 'size', label: 'What size deck or porch?', options: Object.keys(SIZE_MULT['deck-porch-demo']) },
            { key: 'height', label: 'Height?', options: Object.keys(HEIGHT_MULT) },
            { key: 'attached', label: 'Attached to house?', options: Object.keys(ATTACHED_MULT) },
            { key: 'access', label: 'Site access?', options: Object.keys(ACCESS_MULT) }
        ],
        'outbuilding-barn': [
            { key: 'size', label: 'What size?', options: Object.keys(SIZE_MULT['outbuilding-barn']) },
            { key: 'construction', label: 'Construction type?', options: Object.keys(CONSTRUCTION_MULT) },
            { key: 'roofing', label: 'Roofing material?', options: Object.keys(ROOFING_MULT) },
            { key: 'foundation', label: 'Foundation?', options: ['None (dirt floor)', 'Slab stays', 'Remove slab too'] },
            { key: 'access', label: 'Site access?', options: Object.keys(ACCESS_MULT) }
        ],
        'forestry-mulching': [
            { key: 'acreage', label: 'How many acres?', type: 'preset', presets: [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5], unit: 'acres', customLabel: 'acres' },
            { key: 'brushDensity', label: 'Brush density?', options: Object.keys(BRUSH_MULT) },
            { key: 'terrain', label: 'Terrain?', options: Object.keys(TERRAIN_MULT) }
        ],
        'brush-hogging': [
            { key: 'acreage', label: 'How many acres?', type: 'preset', presets: [0.5, 1, 2, 3, 5, 10, 15, 20], unit: 'acres', customLabel: 'acres' },
            { key: 'vegetation', label: 'Vegetation density?', options: Object.keys(BRUSH_HOG_VEG) },
            { key: 'terrain', label: 'Terrain?', options: Object.keys(TERRAIN_MULT) }
        ],
        'lot-clearing': [
            { key: 'acreage', label: 'Lot size (acres)?', type: 'preset', presets: [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5], unit: 'acres', customLabel: 'acres' },
            { key: 'brushDensity', label: 'Brush density?', options: Object.keys(BRUSH_MULT) },
            { key: 'trees', label: 'Tree density?', options: Object.keys(TREES_MULT) },
            { key: 'terrain', label: 'Terrain?', options: Object.keys(TERRAIN_MULT) }
        ],
        'fence-line-clearing': [
            { key: 'linearFeet', label: 'How many linear feet?', type: 'preset', presets: [100, 200, 300, 500, 750, 1000], unit: 'ft', customLabel: 'ft' },
            { key: 'brushDensity', label: 'Brush density?', options: Object.keys(BRUSH_MULT) },
            { key: 'terrain', label: 'Terrain?', options: Object.keys(TERRAIN_MULT) }
        ],
        'trail-cutting': [
            { key: 'linearFeet', label: 'How many linear feet of trail?', type: 'preset', presets: [100, 200, 300, 500, 750, 1000, 1500, 2000], unit: 'ft', customLabel: 'ft' },
            { key: 'brushDensity', label: 'Brush/tree density along trail?', options: Object.keys(BRUSH_MULT) },
            { key: 'terrain', label: 'Terrain?', options: Object.keys(TERRAIN_MULT) }
        ]
    };

    // ==========================================
    // Zip Code Distance Table
    // ==========================================

    var ZIP_DISTANCES = {
        // Columbia
        '65201': 0, '65202': 0, '65203': 0, '65204': 0, '65205': 0,
        '65211': 0, '65212': 0, '65213': 0, '65214': 0, '65215': 0, '65216': 0, '65217': 0,
        // Nearby
        '65010': 12,  // Ashland
        '65074': 14,  // Holts Summit
        '65037': 18,  // Hartsburg
        '65058': 20,  // Mokane
        '65076': 15,  // Jamestown
        '65255': 18,  // Harrisburg
        '65041': 16,  // Hallsville
        '65279': 10,  // Rocheport
        '65240': 22,  // Centralia
        '65043': 22,  // Fulton
        '65251': 20,  // Fulton (alt)
        '65233': 28,  // Boonville
        '65018': 28,  // California
        '65265': 30,  // Mexico
        '65101': 30,  // Jefferson City
        '65102': 30, '65103': 30, '65104': 30, '65105': 30,
        '65106': 30, '65107': 30, '65108': 30, '65109': 30,
        '65236': 25,  // Glasgow
        '65257': 18,  // Huntsdale
        '65275': 25,  // Sturgeon
        '65230': 20,  // Fayette
        '65254': 15,  // Hallsville (alt)
        '65259': 25,  // Moberly (south)
        '65270': 35,  // Moberly
        '65301': 38,  // Sedalia
        '65340': 35,  // Marshall
        '65084': 38,  // Versailles
        '65336': 38,  // Knob Noster
        '65248': 15,  // Harrisburg (alt)
        '65023': 22,  // Centertown
        '65046': 20,  // Henley
        '65085': 32,  // Westphalia
        '65050': 25,  // Linn
        '65247': 28,  // Clark
        '65276': 18,  // Wooldridge
        '65039': 15,  // Hartsburg (alt)
        '65061': 32,  // New Bloomfield
        '65063': 25,  // New Franklin
        '65066': 45,  // Osage Beach
        '65020': 50,  // Camdenton
        '65401': 60,  // Rolla
        '65243': 12,  // Centralia (south)
        '65237': 22,  // Bunceton
        '65256': 10,  // Harrisburg (close)
        '65274': 20,  // Stoutsville
        '65263': 28,  // Paris
        '65231': 20,  // Franklin
        '65244': 30,  // Clifton Hill
        '65246': 25,  // Dalton
        '65250': 22,  // Fayette (alt)
        '65260': 25,  // Jacksonville
        '65278': 12,  // Woodlandville
        '65299': 0    // Columbia (PO)
    };

    // ==========================================
    // State
    // ==========================================

    var state = {
        step: 1,
        tab: 'demolition',
        jobType: null,
        selections: {},
        zipCode: '',
        distanceMiles: 0,
        estimate: { low: 0, high: 0 },
        utm: { source: '', medium: '', campaign: '', content: '' },
        lead: {}
    };

    // ==========================================
    // DOM References
    // ==========================================

    var wizard       = document.getElementById('bid-wizard');
    var progressFill = document.getElementById('bid-progress-fill');
    var stepNum      = document.getElementById('bid-step-num');
    var backBtn      = document.getElementById('bid-back');
    var nextBtn      = document.getElementById('bid-next');
    var navWrap      = document.getElementById('bid-nav');
    var zipInput     = document.getElementById('bid-zip');
    var zipMessage   = document.getElementById('bid-zip-message');
    var questionsEl  = document.getElementById('bid-questions');

    // ==========================================
    // Init
    // ==========================================

    function init() {
        captureUTM();
        readTabFromURL();
        bindTabs();
        bindCards();
        bindNav();
        bindZip();
        updateUI();
    }

    function captureUTM() {
        var params = new URLSearchParams(window.location.search);
        state.utm.source   = params.get('utm_source')   || '';
        state.utm.medium   = params.get('utm_medium')   || '';
        state.utm.campaign = params.get('utm_campaign')  || '';
        state.utm.content  = params.get('utm_content')   || '';
    }

    function readTabFromURL() {
        var params = new URLSearchParams(window.location.search);
        var tab = params.get('tab');
        if (tab === 'clearing' || tab === 'land-clearing') {
            switchTab('clearing');
        }
    }

    // ==========================================
    // Tabs
    // ==========================================

    function bindTabs() {
        document.querySelectorAll('.bid-tab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchTab(this.dataset.tab);
            });
        });
    }

    function switchTab(tab) {
        state.tab = tab;
        state.jobType = null;
        state.selections = {};

        document.querySelectorAll('.bid-tab').forEach(function (t) {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        document.getElementById('tab-demolition').classList.toggle('hidden', tab !== 'demolition');
        document.getElementById('tab-clearing').classList.toggle('hidden', tab !== 'clearing');

        // Deselect cards
        document.querySelectorAll('.bid-card').forEach(function (c) { c.classList.remove('selected'); });
        updateNextBtn();
    }

    // ==========================================
    // Card Selection
    // ==========================================

    function bindCards() {
        document.querySelectorAll('.bid-card').forEach(function (card) {
            card.addEventListener('click', function () {
                // Deselect all in current tab
                this.closest('.bid-cards').querySelectorAll('.bid-card').forEach(function (c) { c.classList.remove('selected'); });
                this.classList.add('selected');
                state.jobType = this.dataset.job;
                state.selections = {};
                updateNextBtn();
            });
        });
    }

    // ==========================================
    // Navigation
    // ==========================================

    function bindNav() {
        nextBtn.addEventListener('click', function () {
            if (state.step === 4) {
                if (!validateLeadForm()) return;
                captureLeadData();
                calculateEstimate();
                submitLead();
            }
            if (state.step < 5) {
                goToStep(state.step + 1);
            }
        });

        backBtn.addEventListener('click', function () {
            if (state.step > 1) {
                goToStep(state.step - 1);
            }
        });
    }

    function goToStep(n) {
        state.step = n;

        // Build questions when arriving at step 2
        if (n === 2) buildQuestions();

        // Show correct step
        document.querySelectorAll('.bid-step').forEach(function (s) {
            s.classList.toggle('active', parseInt(s.dataset.step) === n);
        });

        // Show estimate on step 5
        if (n === 5) showEstimate();

        updateUI();
        window.scrollTo({ top: document.querySelector('.bid-progress').offsetTop - 100, behavior: 'smooth' });
    }

    function updateUI() {
        var pct = state.step * 20;
        progressFill.style.width = pct + '%';
        stepNum.textContent = state.step;
        progressFill.closest('.bid-progress').setAttribute('aria-valuenow', pct);

        // Back button
        backBtn.classList.toggle('hidden', state.step === 1);

        // Hide nav on step 5
        navWrap.style.display = state.step === 5 ? 'none' : 'flex';

        // Next button text
        if (state.step === 4) {
            nextBtn.textContent = 'Show My Estimate';
        } else {
            nextBtn.textContent = 'Continue';
        }

        updateNextBtn();
    }

    function updateNextBtn() {
        var enabled = false;
        switch (state.step) {
            case 1:
                enabled = !!state.jobType;
                break;
            case 2:
                enabled = areQuestionsComplete();
                break;
            case 3:
                enabled = zipInput.value.length === 5 && /^\d{5}$/.test(zipInput.value);
                break;
            case 4:
                enabled = true; // validated on click
                break;
        }
        nextBtn.disabled = !enabled;
    }

    // ==========================================
    // Step 2 — Dynamic Questions
    // ==========================================

    function buildQuestions() {
        var questions = JOB_QUESTIONS[state.jobType] || [];
        state.selections = {};
        questionsEl.innerHTML = '';

        questions.forEach(function (q) {
            var div = document.createElement('div');
            div.className = 'bid-question';

            var label = document.createElement('div');
            label.className = 'bid-question-label';
            label.textContent = q.label;
            div.appendChild(label);

            if (q.type === 'preset') {
                var wrap = document.createElement('div');
                wrap.className = 'bid-presets';

                q.presets.forEach(function (val) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'bid-option';
                    btn.textContent = val >= 1000 ? val.toLocaleString() + '+' : val;
                    btn.addEventListener('click', function () {
                        wrap.querySelectorAll('.bid-option').forEach(function (o) { o.classList.remove('selected'); });
                        btn.classList.add('selected');
                        var customInput = wrap.querySelector('.bid-custom-input');
                        if (customInput) customInput.value = '';
                        state.selections[q.key] = val;
                        updateNextBtn();
                    });
                    wrap.appendChild(btn);
                });

                // Custom entry
                var custom = document.createElement('div');
                custom.className = 'bid-custom-entry';
                var input = document.createElement('input');
                input.type = 'number';
                input.className = 'bid-custom-input';
                input.placeholder = 'Custom';
                input.min = '1';
                input.setAttribute('inputmode', 'decimal');
                input.addEventListener('input', function () {
                    var v = parseFloat(this.value);
                    if (v > 0) {
                        wrap.querySelectorAll('.bid-option').forEach(function (o) { o.classList.remove('selected'); });
                        state.selections[q.key] = v;
                    } else {
                        delete state.selections[q.key];
                    }
                    updateNextBtn();
                });
                custom.appendChild(input);
                var unitLabel = document.createElement('span');
                unitLabel.className = 'bid-custom-label';
                unitLabel.textContent = q.customLabel;
                custom.appendChild(unitLabel);
                wrap.appendChild(custom);

                div.appendChild(wrap);
            } else {
                var optWrap = document.createElement('div');
                optWrap.className = 'bid-options';

                q.options.forEach(function (opt) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'bid-option';
                    btn.textContent = opt;
                    btn.addEventListener('click', function () {
                        optWrap.querySelectorAll('.bid-option').forEach(function (o) { o.classList.remove('selected'); });
                        btn.classList.add('selected');
                        state.selections[q.key] = opt;
                        updateNextBtn();
                    });
                    optWrap.appendChild(btn);
                });

                div.appendChild(optWrap);
            }

            questionsEl.appendChild(div);
        });
    }

    function areQuestionsComplete() {
        var questions = JOB_QUESTIONS[state.jobType] || [];
        for (var i = 0; i < questions.length; i++) {
            if (state.selections[questions[i].key] === undefined) return false;
        }
        return true;
    }

    // ==========================================
    // Step 3 — Zip Code
    // ==========================================

    function bindZip() {
        zipInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 5);
            state.zipCode = this.value;

            if (this.value.length === 5) {
                lookupZip(this.value);
            } else {
                zipMessage.textContent = '';
                zipMessage.className = 'bid-zip-message';
            }
            updateNextBtn();
        });
    }

    function lookupZip(zip) {
        var dist = ZIP_DISTANCES[zip];
        if (dist !== undefined) {
            state.distanceMiles = dist;
            if (dist === 0) {
                zipMessage.textContent = 'Columbia — right in our backyard!';
                zipMessage.className = 'bid-zip-message success';
            } else if (dist <= 30) {
                zipMessage.textContent = 'Within our primary service area (' + dist + ' miles).';
                zipMessage.className = 'bid-zip-message success';
            } else if (dist <= 45) {
                zipMessage.textContent = 'About ' + dist + ' miles out — a small travel fee may apply.';
                zipMessage.className = 'bid-zip-message warning';
            } else {
                zipMessage.textContent = 'About ' + dist + ' miles out — we\'ll confirm availability during follow-up.';
                zipMessage.className = 'bid-zip-message warning';
            }
        } else {
            state.distanceMiles = -1; // unknown
            zipMessage.textContent = 'We\'ll confirm service area availability during follow-up.';
            zipMessage.className = 'bid-zip-message warning';
        }
    }

    // ==========================================
    // Step 4 — Lead Form Validation
    // ==========================================

    function validateLeadForm() {
        var valid = true;
        var fields = [
            { id: 'bid-first-name', msg: 'First name is required' },
            { id: 'bid-last-name',  msg: 'Last name is required' },
            { id: 'bid-phone',      msg: 'Phone number is required' },
            { id: 'bid-email',      msg: 'Email is required' },
            { id: 'bid-address',    msg: 'Property address is required' },
            { id: 'bid-call-time',  msg: 'Please select a time' }
        ];

        fields.forEach(function (f) {
            var el = document.getElementById(f.id);
            var existingErr = el.parentElement.querySelector('.bid-input-error');
            if (existingErr) existingErr.remove();
            el.classList.remove('error');

            if (!el.value.trim()) {
                el.classList.add('error');
                var err = document.createElement('div');
                err.className = 'bid-input-error';
                err.textContent = f.msg;
                el.parentElement.appendChild(err);
                valid = false;
            }
        });

        // Email format check
        var emailEl = document.getElementById('bid-email');
        if (emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
            emailEl.classList.add('error');
            var existingErr = emailEl.parentElement.querySelector('.bid-input-error');
            if (existingErr) existingErr.remove();
            var err = document.createElement('div');
            err.className = 'bid-input-error';
            err.textContent = 'Please enter a valid email';
            emailEl.parentElement.appendChild(err);
            valid = false;
        }

        return valid;
    }

    function captureLeadData() {
        state.lead = {
            firstName:      document.getElementById('bid-first-name').value.trim(),
            lastName:       document.getElementById('bid-last-name').value.trim(),
            phone:          document.getElementById('bid-phone').value.trim(),
            email:          document.getElementById('bid-email').value.trim(),
            propertyAddress: document.getElementById('bid-address').value.trim(),
            bestTimeToCall: document.getElementById('bid-call-time').value
        };
    }

    // ==========================================
    // Pricing Engine
    // ==========================================

    function calculateEstimate() {
        var job = state.jobType;
        var sel = state.selections;
        var raw = 0;

        switch (job) {
            case 'shed-removal':
                raw = BASE_PRICES[job]
                    * (SIZE_MULT[job][sel.size] || 1)
                    * (ROOFING_MULT[sel.roofing] || 1)
                    * (SHED_FOUNDATION_MULT[sel.foundation] || 1);
                break;

            case 'detached-garage-demo':
                raw = BASE_PRICES[job]
                    * (SIZE_MULT[job][sel.size] || 1)
                    * (CONSTRUCTION_MULT[sel.construction] || 1)
                    * (ROOFING_MULT[sel.roofing] || 1)
                    * (FOUNDATION_MULT[sel.foundation] || 1)
                    * (ACCESS_MULT[sel.access] || 1);
                break;

            case 'mobile-home-removal':
                raw = BASE_PRICES[job]
                    * (SIZE_MULT[job][sel.size] || 1)
                    * (SKIRTING_MULT[sel.skirting] || 1)
                    * (ACCESS_MULT[sel.access] || 1);
                break;

            case 'concrete-removal':
                var sqft = parseFloat(sel.area) || 0;
                raw = BASE_PRICES[job] * sqft
                    * (THICKNESS_MULT[sel.thickness] || 1)
                    * (REBAR_MULT[sel.rebar] || 1)
                    * (CONCRETE_TYPE_MULT[sel.concreteType] || 1);
                // Minimum job charge: disposal + dumpster alone puts a floor around $750
                // raw is bumped so the ±10% low-end lands at ~$750
                if (raw < 833) raw = 833;
                break;

            case 'deck-porch-demo':
                raw = BASE_PRICES[job]
                    * (SIZE_MULT[job][sel.size] || 1)
                    * (HEIGHT_MULT[sel.height] || 1)
                    * (ATTACHED_MULT[sel.attached] || 1)
                    * (ACCESS_MULT[sel.access] || 1);
                break;

            case 'outbuilding-barn':
                raw = BASE_PRICES[job]
                    * (SIZE_MULT[job][sel.size] || 1)
                    * (CONSTRUCTION_MULT[sel.construction] || 1)
                    * (ROOFING_MULT[sel.roofing] || 1)
                    * (BARN_FOUNDATION_MULT[sel.foundation] || 1)
                    * (ACCESS_MULT[sel.access] || 1);
                break;

            case 'forestry-mulching':
                var acres = parseFloat(sel.acreage) || 0;
                raw = BASE_PRICES[job] * acres
                    * (BRUSH_MULT[sel.brushDensity] || 1)
                    * (TERRAIN_MULT[sel.terrain] || 1);
                break;

            case 'lot-clearing':
                var lotAcres = parseFloat(sel.acreage) || 0;
                raw = BASE_PRICES[job] * lotAcres
                    * (BRUSH_MULT[sel.brushDensity] || 1)
                    * (TREES_MULT[sel.trees] || 1)
                    * (TERRAIN_MULT[sel.terrain] || 1);
                break;

            case 'fence-line-clearing':
                var ft = parseFloat(sel.linearFeet) || 0;
                raw = BASE_PRICES[job] * ft
                    * (BRUSH_MULT[sel.brushDensity] || 1)
                    * (TERRAIN_MULT[sel.terrain] || 1);
                break;

            case 'trail-cutting':
                var trailFt = parseFloat(sel.linearFeet) || 0;
                raw = BASE_PRICES[job] * trailFt
                    * (BRUSH_MULT[sel.brushDensity] || 1)
                    * (TERRAIN_MULT[sel.terrain] || 1);
                break;

            case 'brush-hogging':
                var hogAcres = parseFloat(sel.acreage) || 0;
                raw = BASE_PRICES[job] * hogAcres
                    * (BRUSH_HOG_VEG[sel.vegetation] || 1)
                    * (TERRAIN_MULT[sel.terrain] || 1);
                // Minimum job charge: half-day / single-acre floor
                if (raw < 389) raw = 389;  // ensures low-end displays ~$350
                break;
        }

        // Distance adjustment
        var dist = state.distanceMiles;
        if (dist > 30) {
            raw += (dist - 30) * 3.50;
        }

        // Range
        state.estimate.low  = Math.round(raw * 0.90);
        state.estimate.high = Math.round(raw * 1.10);

        // Minimum floor
        if (state.estimate.low < 100) state.estimate.low = 100;
        if (state.estimate.high < 150) state.estimate.high = 150;
    }

    // ==========================================
    // Step 5 — Display Estimate
    // ==========================================

    function showEstimate() {
        var lowEl  = document.getElementById('bid-est-low');
        var highEl = document.getElementById('bid-est-high');

        // Show service area warning if needed
        var msgEl = document.getElementById('bid-service-message');
        if (state.distanceMiles > 45 || state.distanceMiles === -1) {
            msgEl.classList.remove('hidden');
        } else {
            msgEl.classList.add('hidden');
        }

        // Counting animation
        animateCount(lowEl, state.estimate.low);
        animateCount(highEl, state.estimate.high);
    }

    function animateCount(el, target) {
        var duration = 800;
        var start = 0;
        var startTime = null;

        function tick(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (target - start) * eased);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    // ==========================================
    // Lead Submission (N8N Webhook)
    // ==========================================

    function submitLead() {
        // Populate hidden fields for Netlify Forms
        document.getElementById('bid-h-tab').value        = state.tab;
        document.getElementById('bid-h-job').value        = state.jobType;
        document.getElementById('bid-h-selections').value = JSON.stringify(state.selections);
        document.getElementById('bid-h-est-low').value    = state.estimate.low;
        document.getElementById('bid-h-est-high').value   = state.estimate.high;
        document.getElementById('bid-h-distance').value   = state.distanceMiles === -1 ? 'unknown' : state.distanceMiles;
        document.getElementById('bid-h-zip').value        = state.zipCode;
        document.getElementById('bid-h-utm-source').value   = state.utm.source;
        document.getElementById('bid-h-utm-medium').value   = state.utm.medium;
        document.getElementById('bid-h-utm-campaign').value = state.utm.campaign;
        document.getElementById('bid-h-utm-content').value  = state.utm.content;

        // Submit to Netlify Forms via AJAX (so the page doesn't redirect)
        var form = document.getElementById('bid-lead-form');
        var formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        }).catch(function (err) {
            console.error('Netlify form submission failed:', err);
        });

        // Also POST to N8N webhook
        var payload = {
            source: 'instant-bid',
            firstName:      state.lead.firstName,
            lastName:       state.lead.lastName,
            phone:          state.lead.phone,
            email:          state.lead.email,
            propertyAddress: state.lead.propertyAddress,
            zipCode:        state.zipCode,
            bestTimeToCall: state.lead.bestTimeToCall,
            tab:            state.tab,
            jobType:        state.jobType,
            selections:     state.selections,
            estimate:       state.estimate,
            distanceMiles:  state.distanceMiles === -1 ? 'unknown' : state.distanceMiles,
            utm:            state.utm,
            timestamp:      new Date().toISOString()
        };

        sendWebhook(payload, 0);
    }

    function sendWebhook(payload, attempt) {
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(function () {
            // Retry up to 2 more times
            if (attempt < 2) {
                setTimeout(function () { sendWebhook(payload, attempt + 1); }, 2000 * (attempt + 1));
            } else {
                console.error('Instant Bid webhook failed after 3 attempts');
            }
        });
    }

    // ==========================================
    // Boot
    // ==========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
