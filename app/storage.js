// localStorage persistence for the player roster and settings only.
// Game-in-progress state is never persisted here - a reload always starts fresh.
// Every access is wrapped in try/catch: Safari throws SecurityError under some
// privacy configurations, and that must not break the app.
(function () {
  'use strict';

  var ROSTER_KEY = 'flip.roster';
  var SETTINGS_KEY = 'flip.settings';
  var DEFAULT_SETTINGS = {
    placementMode: 'winner-only',
    rackSize: 9,
    overpayMode: 'A', // 'A' strict (D-18) | 'D' overpay
    boostEnabled: false, // A-only; inert until M6 (D-27, D-28)
    // 0 = undecided - the first player to reach the single-die-unlocked
    // state this game gets asked live and their answer becomes this
    // setting (and sticks for future games too); 1 or 2 once decided.
    diceCount: 0,
    motionEnabled: true, // D-21
    // D-29: default ON in development (this prototype), OFF in the final
    // build - there is no build step to branch on, so this is the
    // development default; flip it when the product actually ships.
    tapToProceed: true,
    theme: 'dark' // 'dark' | 'light'
  };

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
        rackSize: parsed.rackSize === 12 ? 12 : DEFAULT_SETTINGS.rackSize,
        overpayMode: parsed.overpayMode === 'D' ? 'D' : DEFAULT_SETTINGS.overpayMode,
        boostEnabled: parsed.boostEnabled === true,
        diceCount: (parsed.diceCount === 1 || parsed.diceCount === 2) ? parsed.diceCount : DEFAULT_SETTINGS.diceCount,
        motionEnabled: parsed.motionEnabled !== false,
        tapToProceed: parsed.tapToProceed !== false,
        theme: parsed.theme === 'light' ? 'light' : DEFAULT_SETTINGS.theme
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
