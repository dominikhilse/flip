// localStorage persistence for the player roster and settings only.
// Game-in-progress state is never persisted here - a reload always starts fresh.
// Every access is wrapped in try/catch: Safari throws SecurityError under some
// privacy configurations, and that must not break the app.
(function () {
  'use strict';

  var ROSTER_KEY = 'flip.roster';
  var SETTINGS_KEY = 'flip.settings';
  var DEFAULT_SETTINGS = { placementMode: 'winner-only', rackSize: 9 };

  function loadRoster() {
    try {
      var raw = localStorage.getItem(ROSTER_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveRoster(roster) {
    try {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
    } catch (e) {
      // Storage unavailable - roster simply won't persist this session.
    }
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return {
        placementMode: parsed.placementMode || DEFAULT_SETTINGS.placementMode,
        rackSize: parsed.rackSize === 12 ? 12 : DEFAULT_SETTINGS.rackSize
      };
    } catch (e) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      // Storage unavailable - settings simply won't persist this session.
    }
  }

  window.STORAGE = {
    loadRoster: loadRoster,
    saveRoster: saveRoster,
    loadSettings: loadSettings,
    saveSettings: saveSettings
  };
})();
