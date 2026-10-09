// Localisation runtime (M24 Stage A). Self-contained, no dependency on
// settings/storage - app.js owns the persisted language choice and calls
// setLanguage() with it; this module just resolves keys to strings.
// Schema: docs/FlipTheNumber_LocalisationSchema.md.
(function () {
  'use strict';

  // §6: active language is whatever was last set via setLanguage(); the
  // English file is ALWAYS also cached, regardless of which language is
  // active, since every lookup falls back to it (missing key, or an
  // entire language file that doesn't exist yet - Stage A ships EN only,
  // so selecting FR/IT/DE/ES today degrades to English on every string,
  // not a blank or a 404 in the UI).
  var cache = {}; // code -> { key: value }
  var activeCode = 'en';

  // {name} - curly braces, lowercase, no spaces (schema §2). A slot with
  // no matching param is left as-is rather than silently blanked, so a
  // wiring mistake is visible instead of swallowed.
  function interpolate(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : match;
    });
  }

  // §6: missing in the active language -> English. Missing everywhere ->
  // surface the key itself (a bug to catch in QA), never a blank.
  function t(key, params) {
    var active = cache[activeCode];
    var str = (active && active[key] != null) ? active[key]
      : (cache.en && cache.en[key] != null) ? cache.en[key]
      : key;
    return interpolate(str, params);
  }

  // Relative path (no leading slash), matching every other same-origin
  // asset this app loads (style.css, avatars/, manifest.webmanifest) -
  // the app is served from a subpath, not a domain root. A same-origin
  // fetch of the app's own bundled static JSON, not a backend/API call -
  // same class of exception CLAUDE.md's locked "no network calls at
  // runtime" rule already grants the Google Fonts <link> (M14 DECISIONS.md
  // entry), just JS-initiated instead of a <link> tag. Cached per code so
  // switching back to an already-loaded language never re-fetches.
  function fetchLang(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch('lang/' + code + '.json')
      .then(function (res) { if (!res.ok) throw new Error('no lang file for ' + code); return res.json(); })
      .then(function (data) { cache[code] = data; return data; })
      .catch(function () {
        // No file yet for this language (Stage A ships EN only) or a
        // network hiccup - silently stay on whatever's already active;
        // t()'s own English fallback means nothing renders blank.
        return null;
      });
  }

  // Always ensures English is cached (the universal fallback) before
  // resolving, then loads `code` on top if it's something else.
  function setLanguage(code, onReady) {
    var want = code || 'en';
    fetchLang('en').then(function () {
      if (want === 'en') {
        activeCode = 'en';
        if (onReady) onReady();
        return;
      }
      fetchLang(want).then(function () {
        activeCode = want; // set even if the fetch failed - t() falls back to en per-key
        if (onReady) onReady();
      });
    });
  }

  window.I18N = {
    t: t,
    setLanguage: setLanguage,
    activeCode: function () { return activeCode; }
  };
})();
