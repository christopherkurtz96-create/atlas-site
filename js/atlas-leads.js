// ATLAS Leads hookup. Loaded on every page.
//
// 1. Remembers how a visitor first got here (ad click ids, UTM tags, landing
//    page, referrer) for 90 days, in this browser only. First touch wins.
// 2. atlasLeads.send(fields) posts a copy of a form submission, with that
//    first-touch record, to the ATLAS Leads app. It never blocks or breaks
//    the form: Netlify Forms still gets the submission either way.
(function () {
  'use strict';
  if (window.atlasLeads) return;

  var ENDPOINT = 'https://leads.deployatlas.com/api/intake/form';
  var KEY = 'atlas_first_touch';
  var DAYS = 90;
  var TAGS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'matchtype', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  var loadedAt = Date.now();

  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && saved.first_seen_at && Date.now() - Date.parse(saved.first_seen_at) < DAYS * 86400000) return saved;
    } catch (e) {}
    return null;
  }

  function capture() {
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return null; }
    var touch = {};
    var tagged = false;
    TAGS.forEach(function (t) {
      var v = params.get(t);
      if (v) { touch[t] = v.slice(0, 300); tagged = true; }
    });
    var saved = read();
    // Keep the first visit, unless that visit had no ad tags and this one does.
    if (saved && (saved.tagged || !tagged)) return saved;
    touch.tagged = tagged;
    touch.landing_page = (window.location.pathname || '/').slice(0, 300);
    touch.referrer = (document.referrer || '').slice(0, 300);
    touch.first_seen_at = (saved && saved.first_seen_at) || new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(touch)); } catch (e) {}
    return touch;
  }

  var first = capture();

  function id() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 12);
  }

  function attribution() {
    var a = {};
    var src = read() || first || {};
    Object.keys(src).forEach(function (k) { if (k !== 'tagged' && src[k]) a[k] = src[k]; });
    return a;
  }

  function send(fields) {
    try {
      var payload = {};
      Object.keys(fields || {}).forEach(function (k) {
        var v = fields[k];
        if (v !== null && v !== undefined && v !== '') payload[k] = v;
      });
      payload.attribution = attribution();
      payload.submission_id = id();
      payload.elapsed_ms = Date.now() - loadedAt;
      if (!payload.page) payload.page = window.location.pathname;
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    return Promise.resolve();
  }

  window.atlasLeads = { send: send, attribution: attribution };
})();
