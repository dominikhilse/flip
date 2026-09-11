(function () {
  'use strict';

  // ---- Persistent state (roster + settings) ----
  var roster = STORAGE.loadRoster();
  var settings = STORAGE.loadSettings();
  var selectedColor = null;

  // ---- In-memory game state (never persisted; a reload always starts fresh) ----
  var game = null;

  // ---- DOM refs ----
  var screens = {
    launch: document.getElementById('screen-launch'),
    setup: document.getElementById('screen-setup'),
    turncard: document.getElementById('screen-turncard'),
    play: document.getElementById('screen-play'),
    end: document.getElementById('screen-end'),
    timeout: document.getElementById('screen-timeout')
  };
  var activeScreen = 'launch';

  var rosterListEl = document.getElementById('roster-list');
  var addPlayerForm = document.getElementById('add-player-form');
  var playerNameInput = document.getElementById('player-name-input');
  var colorSwatchesEl = document.getElementById('color-swatches');
  var rosterNoteEl = document.getElementById('roster-note');
  var rackSizeToggleEl = document.getElementById('rack-size-toggle');
  var rackSizeNoteEl = document.getElementById('rack-size-note');
  var placementModeEl = document.getElementById('placement-mode');
  var placementModeNoteEl = document.getElementById('placement-mode-note');
  var overpayToggleEl = document.getElementById('overpay-toggle');
  var overpayNoteEl = document.getElementById('overpay-note');
  var boostCheckboxEl = document.getElementById('boost-checkbox');
  var boostNoteEl = document.getElementById('boost-note');
  var devTwoDiceForceEl = document.getElementById('dev-two-dice-force');
  var devTimeChallengeInputEl = document.getElementById('dev-time-challenge-input');
  var devTimeChallengeSetBtn = document.getElementById('dev-time-challenge-set');
  var devTimeChallengeStatusEl = document.getElementById('dev-time-challenge-status');
  var motionToggleEl = document.getElementById('motion-toggle');
  var tapToggleEl = document.getElementById('tap-toggle');
  var themeToggleEl = document.getElementById('theme-toggle');
  var startGameBtn = document.getElementById('start-game');
  var backToGameBtn = document.getElementById('back-to-game');
  var endGameBtn = document.getElementById('end-game');

  var turncardNameEl = document.getElementById('turncard-name');
  var turncardScreenEl = screens.turncard;
  var settingsFromTurncardBtn = document.getElementById('settings-from-turncard');
  var turncardTimerEl = document.getElementById('turncard-timer');

  var playPlayerNameEl = document.getElementById('play-player-name');
  var playTimerEl = document.getElementById('play-timer');
  var playBoostCountEl = document.getElementById('play-boost-count');
  var playBoostAnnouncementEl = document.getElementById('play-boost-announcement');
  var playMessageEl = document.getElementById('play-message');
  var playSelectionSumEl = document.getElementById('play-selection-sum');
  var playRackEl = document.getElementById('play-rack');
  var playDiceChoiceEl = document.getElementById('play-dice-choice');
  var playDiceAreaEl = document.getElementById('play-dice-area');
  var playBoostOfferEl = document.getElementById('play-boost-offer');
  var playBoostOfferTextEl = document.getElementById('play-boost-offer-text');
  var playBoostSpendBtn = document.getElementById('play-boost-spend');
  var playBoostDeclineBtn = document.getElementById('play-boost-decline');
  var playRollBtn = document.getElementById('play-roll');
  var playConfirmBtn = document.getElementById('play-confirm');
  var playPassBtn = document.getElementById('play-pass');

  var finishListEl = document.getElementById('finish-list');
  var endNewGameBtn = document.getElementById('end-new-game');
  var timeoutNewGameBtn = document.getElementById('timeout-new-game');

  function showScreen(name) {
    activeScreen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].hidden = key !== name;
    });
    // Time challenge (M9): pauses on the turn card, runs on the rack - the
    // HUD reflects that the instant the screen changes, not just on the
    // next tick (see tickChallenge, further down).
    renderChallengeTimer();
  }

  // Whether overpay-relaxed rules are in effect right now - a persistent
  // mode-state signal, not a per-roll flash. D mode is a standing ruleset:
  // the flip stays on for as long as the game is in D AND overpay is
  // actually available to the current player right now - which excludes
  // the one carve-out where it isn't: the last remaining tile is always
  // exact-only, even under D, so the flip momentarily drops while a player
  // is down to that single tile. A spent boost is the one genuinely
  // per-roll case - it relaxes only the roll it was spent on, so the flip
  // tracks it for exactly that long.
  function overpayFlipActive() {
    if (!game) return false;
    if (game.overpayMode === 'D') {
      return RULES.openValues(currentPlayer().rack).length !== 1;
    }
    // 1-for-2 is never "overpay" in the rules sense - always an exact
    // match, never a relaxed/wasteful one - so it doesn't trigger the
    // signal, only a spent overpay boost does.
    return !!(game.currentRoll && game.currentRoll.boostSpentType === 'overpay');
  }

  // Theme is purely cosmetic (never stored on `game`) but doubles as the
  // overpay "visual highlight" the design track hasn't nailed down yet: the
  // effective theme is the user's preference XORed with overpayFlipActive,
  // so the whole page inverts for as long as overpay-relaxed rules are live.
  function applyTheme() {
    var wantsLight = settings.theme === 'light';
    var showLight = wantsLight !== overpayFlipActive();
    document.body.classList.toggle('theme-light', showLight);
  }

  // ---- Setup screen ----

  function makePlayerId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function renderRosterList() {
    var blocked = game !== null;
    rosterListEl.innerHTML = '';
    roster.forEach(function (p) {
      var li = document.createElement('li');

      var swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = p.color;

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = p.name;

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-player';
      removeBtn.textContent = 'Remove';
      removeBtn.disabled = blocked;
      removeBtn.addEventListener('click', function () {
        roster = roster.filter(function (rp) { return rp.id !== p.id; });
        STORAGE.saveRoster(roster);
        renderSetup();
      });

      li.appendChild(swatch);
      li.appendChild(name);
      li.appendChild(removeBtn);
      rosterListEl.appendChild(li);
    });
  }

  function renderColorSwatches() {
    colorSwatchesEl.innerHTML = '';
    if (selectedColor === null) {
      selectedColor = THEME.playerColors[roster.length % THEME.playerColors.length];
    }
    THEME.playerColors.forEach(function (color) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-swatch' + (color === selectedColor ? ' selected' : '');
      btn.style.background = color;
      btn.addEventListener('click', function () {
        selectedColor = color;
        renderColorSwatches();
      });
      colorSwatchesEl.appendChild(btn);
    });
  }

  // Settings reachable mid-game (§3.10): rack size and the roster are
  // blocked-until-next-game (visibly disabled, not hidden, with a note);
  // placement, overpay, the boost checkbox, and the two handoff toggles are
  // live-at-end-of-lap (editable mid-game, but deferred - see
  // queueSettingChange/notePlayerCompletedTurn). The blocked/live notes only
  // need to be shown while a game is actually in progress.
  function renderSettingsControls() {
    var midGame = game !== null;

    var rackSizeBtns = rackSizeToggleEl.querySelectorAll('.toggle-btn');
    rackSizeBtns.forEach(function (btn) {
      var size = parseInt(btn.getAttribute('data-rack-size'), 10);
      btn.classList.toggle('active', settings.rackSize === size);
      btn.disabled = midGame;
    });
    rackSizeNoteEl.hidden = !midGame;

    placementModeEl.value = settings.placementMode;
    placementModeNoteEl.hidden = !midGame;

    var overpayBtns = overpayToggleEl.querySelectorAll('.toggle-btn');
    overpayBtns.forEach(function (btn) {
      btn.classList.toggle('active', settings.overpayMode === btn.getAttribute('data-overpay'));
    });
    overpayNoteEl.hidden = !midGame;

    boostCheckboxEl.checked = settings.boostEnabled;
    boostCheckboxEl.disabled = settings.overpayMode !== 'A';
    boostCheckboxEl.closest('.setting-row').classList.toggle('disabled', boostCheckboxEl.disabled);
    boostNoteEl.hidden = !midGame;

    // Motion, tap-to-proceed, and theme are input/cosmetic preferences, not
    // rules - they apply immediately (see queueSettingChange), so unlike
    // the settings above they carry no "applies next lap" note.
    motionToggleEl.checked = settings.motionEnabled;
    tapToggleEl.checked = settings.tapToProceed;
    themeToggleEl.checked = settings.theme === 'light';

    // Dev mode (M8) - a testing instrument, applies immediately like the
    // preferences above, carries no "applies next lap" note.
    devTwoDiceForceEl.checked = settings.devTwoDiceForce;

    // Time challenge (M9) - blocked-until-next-game, same class as rack
    // size: retrofitting a countdown onto a game already in progress isn't
    // worth the edge cases for a dev instrument.
    devTimeChallengeInputEl.value = settings.timeChallengeSeconds;
    devTimeChallengeInputEl.disabled = midGame;
    devTimeChallengeSetBtn.disabled = midGame;
    devTimeChallengeStatusEl.textContent =
      (settings.timeChallengeSeconds > 0 ? 'Currently ' + formatSecondsLabel(settings.timeChallengeSeconds) : 'Currently off') +
      (midGame ? ' - applies next game' : '');
  }

  function renderPrimaryAction() {
    var midGame = game !== null;
    startGameBtn.hidden = midGame;
    backToGameBtn.hidden = !midGame;
    endGameBtn.hidden = !midGame;
    startGameBtn.disabled = roster.length < 2;
  }

  function renderRosterEditability() {
    var blocked = game !== null;
    playerNameInput.disabled = blocked;
    addPlayerForm.querySelector('button[type="submit"]').disabled = blocked;
    rosterNoteEl.hidden = !blocked;
  }

  function renderSetup() {
    renderRosterList();
    renderColorSwatches();
    renderRosterEditability();
    renderSettingsControls();
    renderPrimaryAction();
    applyTheme();
  }

  addPlayerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (game !== null) return; // blocked-until-next-game
    var name = playerNameInput.value.trim();
    if (!name) return;
    roster.push({ id: makePlayerId(), name: name, color: selectedColor });
    STORAGE.saveRoster(roster);
    playerNameInput.value = '';
    selectedColor = null;
    renderSetup();
  });

  rackSizeToggleEl.addEventListener('click', function (e) {
    if (game !== null) return; // blocked-until-next-game
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    settings.rackSize = parseInt(btn.getAttribute('data-rack-size'), 10);
    STORAGE.saveSettings(settings);
    renderSettingsControls();
  });

  placementModeEl.addEventListener('change', function () {
    queueSettingChange('placementMode', placementModeEl.value);
    renderSettingsControls();
  });

  overpayToggleEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    queueSettingChange('overpayMode', btn.getAttribute('data-overpay'));
    renderSettingsControls();
  });

  boostCheckboxEl.addEventListener('change', function () {
    queueSettingChange('boostEnabled', boostCheckboxEl.checked);
  });

  devTwoDiceForceEl.addEventListener('change', function () {
    queueSettingChange('devTwoDiceForce', devTwoDiceForceEl.checked);
    renderSettingsControls();
  });

  // Time challenge (M9): blocked-until-next-game, so this writes straight
  // to settings like rackSize does - never through queueSettingChange/game.
  devTimeChallengeSetBtn.addEventListener('click', function () {
    if (game !== null) return; // blocked-until-next-game
    var raw = parseInt(devTimeChallengeInputEl.value, 10);
    if (!Number.isFinite(raw) || raw < 0) raw = 0;
    var rounded = raw === 0 ? 0 : Math.max(15, Math.round(raw / 15) * 15);
    settings.timeChallengeSeconds = rounded;
    STORAGE.saveSettings(settings);
    renderSettingsControls();
  });

  endGameBtn.addEventListener('click', function () {
    if (!game) return;
    game = null;
    renderSetup();
    showScreen('setup');
  });

  // Motion and tap-to-proceed can never both be off at once (§3.9) - forcing
  // the other back on goes through the same queueSettingChange path so the
  // forced flip is deferred exactly like a direct one would be.
  motionToggleEl.addEventListener('change', function () {
    var newValue = motionToggleEl.checked;
    if (!newValue && !tapToggleEl.checked) {
      tapToggleEl.checked = true;
      queueSettingChange('tapToProceed', true);
    }
    queueSettingChange('motionEnabled', newValue);
    renderSettingsControls();
    // Motion started OFF (skipped the launch-screen permission request per
    // §3.8) and is now being turned on for the first time - request
    // permission now, from this same click/change gesture. A no-op if
    // already granted; startListening is only ever attached once.
    if (newValue && !motionPermissionGranted) {
      MOTION.requestPermission().then(function (granted) {
        motionPermissionGranted = granted;
        if (granted) beginMotionListening();
      });
    }
  });

  tapToggleEl.addEventListener('change', function () {
    var newValue = tapToggleEl.checked;
    if (!newValue && !motionToggleEl.checked) {
      motionToggleEl.checked = true;
      queueSettingChange('motionEnabled', true);
    }
    queueSettingChange('tapToProceed', newValue);
    renderSettingsControls();
  });

  themeToggleEl.addEventListener('change', function () {
    queueSettingChange('theme', themeToggleEl.checked ? 'light' : 'dark');
    applyTheme();
  });

  startGameBtn.addEventListener('click', function () {
    if (roster.length < 2) return;
    startNewGame();
  });

  backToGameBtn.addEventListener('click', function () {
    if (!game) return;
    showTurnCardFor(currentPlayer());
  });

  // ---- Game orchestration ----

  // Rule-affecting settings (§3.10) - deferred to the top of the next lap
  // when changed mid-game, so nobody plays part of a lap under one ruleset
  // and the rest under another. A "lap" is anchored to seat order: it always
  // starts at the earliest not-yet-finished player (normally P1), not at
  // whoever happened to be mid-turn when the change was requested.
  var LAP_ANCHORED_SETTING_KEYS = ['placementMode', 'overpayMode', 'boostEnabled'];

  // Pure input-path preferences that affect live game behaviour (read via
  // game.motionEnabled/game.tapToProceed/game.devTwoDiceForce) - no fairness
  // reason to defer these, so they take effect immediately, live, even
  // mid-turn. devTwoDiceForce is a testing instrument, not a rule (M8).
  var IMMEDIATE_SETTING_KEYS = ['motionEnabled', 'tapToProceed', 'devTwoDiceForce'];

  function firstActiveSeatIndex() {
    return game.players.findIndex(function (p) { return !p.finished; });
  }

  // Persists the new preference immediately (it always governs future games
  // and future laps). motionEnabled/tapToProceed also apply to the live
  // game instantly - they're input-path, not rules, so there's no fairness
  // reason to wait. Rule-affecting keys are queued instead: the live effect
  // on the current game waits for the next lap boundary. theme is purely
  // cosmetic and never touches game state at all - see applyTheme().
  function queueSettingChange(key, value) {
    settings[key] = value;
    STORAGE.saveSettings(settings);
    if (key === 'theme' || !game) return;
    if (IMMEDIATE_SETTING_KEYS.indexOf(key) !== -1) {
      game[key] = value;
      return;
    }
    if (LAP_ANCHORED_SETTING_KEYS.indexOf(key) === -1) return;
    if (!game.pendingSettings) game.pendingSettings = { changes: {} };
    game.pendingSettings.changes[key] = value;
  }

  // Called after advanceTurn() on every turn resolution. A pending
  // lap-anchored change applies the moment the rotation lands back on the
  // start of a lap (the earliest active seat) - i.e. everyone who was mid-
  // lap plays out that lap under the old ruleset first, seat order P1..Pn,
  // regardless of which seat requested the change.
  function applyPendingSettingsAtLapStart() {
    if (!game.pendingSettings) return;
    if (game.turnIndex !== firstActiveSeatIndex()) return;
    Object.assign(game, game.pendingSettings.changes);
    game.pendingSettings = null;
  }

  function startNewGame() {
    var players = roster.map(function (p) {
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        rack: RULES.createRack(settings.rackSize),
        finished: false,
        place: null,
        diceCount: 1, // §3.3 default - one die, changeable per turn (see onChooseDice)
        // Boost mode (§3.6/§3.6b, M6+M7) - typed holding, both types live.
        boosts: { overpay: 0, oneForTwo: 0 },
        pendingBoostCredits: { overpay: 0, oneForTwo: 0 }, // earned, not yet delivered - see deliverPendingBoost
        rollHistory: [], // last N clean/not-clean rolls while boost mode is active
        pendingBoostAnnouncement: false
      };
    });
    game = {
      players: players,
      turnIndex: 0,
      placementMode: settings.placementMode,
      overpayMode: settings.overpayMode,
      boostEnabled: settings.boostEnabled,
      devTwoDiceForce: settings.devTwoDiceForce, // M8 - dev instrument, not a rule
      // Time challenge (M9) - null when off. Only the configured duration
      // (settings.timeChallengeSeconds) is a setting; remainingMs is
      // game-in-progress state, never persisted, like the rest of `game`.
      timeChallenge: settings.timeChallengeSeconds > 0
        ? { remainingMs: settings.timeChallengeSeconds * 1000 }
        : null,
      motionEnabled: settings.motionEnabled,
      tapToProceed: settings.tapToProceed,
      pendingSettings: null,
      finishedOrder: [],
      currentRoll: null,
      selected: new Set()
    };
    beginTurn();
  }

  function currentPlayer() {
    return game.players[game.turnIndex];
  }

  function showTurnCardFor(p) {
    turncardScreenEl.style.background = p.color;
    turncardNameEl.textContent = p.name;
    showScreen('turncard');
  }

  // Called whenever a new turn starts (game start, or after a turn resolves).
  // Resets the per-turn transient state - this is what distinguishes a fresh
  // handoff from a mid-turn pickup pause (see onFlatChange below), which
  // shows the same turn card without touching currentRoll/selected.
  function beginTurn() {
    deliverPendingBoost(currentPlayer());
    game.currentRoll = null;
    game.selected = new Set();
    showTurnCardFor(currentPlayer());
  }

  // The single path for leaving the turn card and returning to the rack.
  // A tap on the turn card and the phone becoming flat-and-still both call
  // this same function - per the architecture in the plan, there must be
  // exactly one way to advance past the turn card, so motion is purely an
  // accelerator on top of the tap path rather than a separate mechanism.
  function goToRack() {
    showScreen('play');
    renderPlay();
  }

  // ---- Motion / tap-to-proceed invariant (§3.9) ----
  // motionPermissionGranted and lastMotionSampleAt are set from the launch
  // handler's MOTION.startListening(onFlatChange, onMotionSample) call
  // further down. A game must always have at least one live way to advance
  // a turn, so tap becomes effective whenever motion is not actually
  // delivering - toggled off, denied, or gone silent mid-game - even if the
  // user's tap-to-proceed preference is OFF.
  var motionPermissionGranted = false;
  var lastMotionSampleAt = null;
  var MOTION_WATCHDOG_MS = 2000;

  function isMotionEffectivelyEnabled() {
    return game ? game.motionEnabled : settings.motionEnabled;
  }

  function isTapPreferenceOn() {
    return game ? game.tapToProceed : settings.tapToProceed;
  }

  function motionCurrentlyWorking() {
    return isMotionEffectivelyEnabled() && motionPermissionGranted &&
      lastMotionSampleAt !== null && (Date.now() - lastMotionSampleAt) < MOTION_WATCHDOG_MS;
  }

  function effectiveTap() {
    return isTapPreferenceOn() || !motionCurrentlyWorking();
  }

  turncardScreenEl.addEventListener('click', function (e) {
    if (e.target === settingsFromTurncardBtn) return;
    if (!effectiveTap()) return;
    goToRack();
  });

  // While on the rack mid-turn, picking the phone up shows the turn card
  // (without resetting any state) instead of advancing a turn; setting it
  // back down flat returns to the same rack via the same goToRack() path
  // used for a genuine handoff. Motion only ever acts while a game screen
  // (turn card or rack) is showing - on setup/launch/end screens it is a
  // no-op, so it never interferes outside of active play. Gated on the
  // *effective* motion setting (game.motionEnabled when a lap-boundary
  // change is pending, else the persisted preference) so a mid-game toggle
  // takes hold exactly when §3.10 says it should.
  function onFlatChange(isFlat) {
    if (!isMotionEffectivelyEnabled()) return;
    if (isFlat) {
      if (activeScreen === 'turncard') goToRack();
    } else {
      if (activeScreen === 'play') showTurnCardFor(currentPlayer());
    }
  }

  // Settings are reachable mid-game without ending the match (§3.10) - this
  // just navigates to the settings screen; nothing here mutates game state.
  settingsFromTurncardBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    renderSetup();
    showScreen('setup');
  });

  // ---- Play screen ----

  function selectedSum() {
    var total = 0;
    game.selected.forEach(function (v) { total += v; });
    return total;
  }

  // The single validity check for the current selection, covering all
  // three move shapes: a spent 1-for-2 (exact match to one die face,
  // RULES.isValidOneForTwoSelection), a spent overpay or native D mode
  // (RULES.isValidSelection under 'D'), or plain strict play (same
  // function under the game's own overpayMode). Centralised here so
  // onConfirm and the Confirm-button enablement can never disagree.
  function currentSelectionValid(p) {
    if (!game.currentRoll) return false;
    var selectedVals = Array.from(game.selected);
    if (game.currentRoll.boostSpentType === 'oneForTwo') {
      return RULES.isValidOneForTwoSelection(selectedVals, game.currentRoll.dice);
    }
    var openVals = RULES.openValues(p.rack);
    var effectiveMode = game.currentRoll.boostSpentType === 'overpay' ? 'D' : game.overpayMode;
    return RULES.isValidSelection(openVals, selectedVals, game.currentRoll.total, effectiveMode);
  }

  // Whether the current selection is the specific case isValidSelection
  // blocks under overpay: every open tile selected (shutting the whole
  // rack) with an inexact sum. With only one tile open there's nothing to
  // exclude - that case is just a plain mismatch, same as strict play, so
  // it's not called out here. A spent 1-for-2 is never this case - it's
  // always an exact match to a die face, so it can never "overpay".
  function wholeRackOverpayBlocked() {
    if (!game.currentRoll || game.currentRoll.stalled || game.currentRoll.boostOfferPending) return false;
    if (game.currentRoll.boostSpentType === 'oneForTwo') return false;
    var effectiveMode = game.currentRoll.boostSpentType === 'overpay' ? 'D' : game.overpayMode;
    if (effectiveMode !== 'D') return false;
    var openVals = RULES.openValues(currentPlayer().rack);
    if (openVals.length <= 1 || game.selected.size !== openVals.length) return false;
    return selectedSum() !== game.currentRoll.total;
  }

  function onTileClick(tile) {
    if (!game.currentRoll || game.currentRoll.stalled) return;
    if (!tile.open) return;
    if (game.selected.has(tile.value)) {
      game.selected.delete(tile.value);
    } else {
      game.selected.add(tile.value);
    }
    renderPlay();
  }

  // ---- Boost mode (§3.6/§3.6b, M6+M7) ----
  // Reached via overpayMode 'A' + boostEnabled (§3.5) - never touches D's
  // rules. Base play stays strict (mode 'A'); a spent boost relaxes only
  // the current roll - overpay to D-style validity (RULES already encodes
  // the whole-rack-exact-match exception, reused rather than duplicated),
  // 1-for-2 to a single-die-equivalent exact match (RULES.isValidOneForTwoSelection).

  var BOOST_TYPES = ['overpay', 'oneForTwo'];
  var BOOST_TYPE_LABELS = { overpay: 'Overpay', oneForTwo: '1-for-2' };

  function boostModeActive() {
    return game.overpayMode === 'A' && game.boostEnabled;
  }

  // Awards land as a credit, not immediately in boosts[type] - crediting a
  // boost the instant a player's own turn ends left them told "you earned
  // one" with no way to actually spend it until their next turn anyway, so
  // the credit is banked here and only delivered (see deliverPendingBoost)
  // at the start of the turn where it can first be used. Multiple credits
  // can stack before delivery (e.g. a dry streak plus a trailing award) -
  // that's fine, better than a boost nobody could act on.
  //
  // The reward model (§3.6b): both criteria currently share the same
  // criteria pool, so the TYPE is decided right here by a single
  // configurable roll (CONFIG.boostTypeDistribution, default 50/50) - once
  // the pools diverge later, this is where that would branch per criterion.
  function awardBoost(p) {
    var type = Math.random() < CONFIG.boostTypeDistribution ? 'overpay' : 'oneForTwo';
    p.pendingBoostCredits[type]++;
  }

  // Called at the top of every turn (see beginTurn). Turns banked credits
  // into spendable boosts, capped at boostMaxHeld (D-20) **combined across
  // both types** (not 3 of each) - excess is simply discarded, same as the
  // old at-award cap. Room is computed fresh per type in BOOST_TYPES order,
  // so if a rare simultaneous double-award would overflow the cap, overpay
  // credits are applied first and 1-for-2 gets whatever room is left - an
  // implementation choice for an edge case the spec doesn't otherwise
  // resolve. If the game has moved on to a mode where boosts aren't offered
  // (overpayMode flipped to 'D' since the credit was earned), the credit is
  // moot - drop it quietly rather than resurrecting it if the mode flips
  // back.
  function deliverPendingBoost(p) {
    var credits = p.pendingBoostCredits;
    p.pendingBoostCredits = { overpay: 0, oneForTwo: 0 };
    if (!(credits.overpay || credits.oneForTwo) || !boostModeActive()) return;
    var delivered = [];
    BOOST_TYPES.forEach(function (type) {
      var held = p.boosts.overpay + p.boosts.oneForTwo;
      var room = Math.max(0, CONFIG.boostMaxHeld - held);
      var toAdd = Math.min(room, credits[type]);
      if (toAdd > 0) {
        p.boosts[type] += toAdd;
        delivered.push(type);
      }
    });
    if (delivered.length) p.pendingBoostAnnouncement = delivered;
  }

  // Dry streak (§3.6): fewer than boostDryStreakThreshold clean (exact-move-
  // possible) rolls in the player's last boostDryStreakWindow rolls. Skipped
  // on a turn where this same player just spent a boost (no re-earn).
  function maybeAwardDryStreakBoost(p) {
    var recent = p.rollHistory.slice(-CONFIG.boostDryStreakWindow);
    var cleanCount = recent.filter(Boolean).length;
    if (cleanCount < CONFIG.boostDryStreakThreshold) awardBoost(p);
  }

  // Trailing-at-finish (§3.6): the moment any player shuts, whichever
  // remaining (not-yet-finished) player(s) have the most open tiles are
  // awarded a boost each - ties all awarded.
  function awardTrailingBoosts() {
    var remaining = game.players.filter(function (pl) { return !pl.finished; });
    if (remaining.length === 0) return;
    var maxOpen = Math.max.apply(null, remaining.map(function (pl) { return RULES.openValues(pl.rack).length; }));
    remaining.forEach(function (pl) {
      if (RULES.openValues(pl.rack).length === maxOpen) awardBoost(pl);
    });
  }

  // Auto-select spend (§3.6b/D-36-D-37): never a which-boost picker. Compute
  // which held types would actually resolve THIS stall; 1-for-2 is checked
  // first and preferred when both would, conserving the strictly-more-
  // versatile overpay for a stall only it can rescue (overpay's reachable
  // set is a proven superset of 1-for-2's, so this ordering alone is
  // enough - no need to separately confirm overpay also resolves before
  // falling back to it). Returns the type to offer, or null for no offer.
  function selectBoostTypeToOffer(p, openVals, dice, total) {
    if (p.boosts.oneForTwo >= 1 && RULES.oneForTwoResolvable(openVals, dice)) return 'oneForTwo';
    if (p.boosts.overpay >= 1 && RULES.anyLegalMoveExists(openVals, total, 'D')) return 'overpay';
    return null;
  }

  // ---- Dice count (once unlocked) ----
  // §3.3: once every open tile is <= 6, the player chooses one die or two
  // before EACH roll, defaulting to one die, changeable with a single tap -
  // mandatory, not a settings toggle (D-03/D-42). p.diceCount is per-player,
  // per-turn preference, not a persisted setting.
  //
  // Regardless of that choice, a rack down to only the "1" tile is a
  // guaranteed dead end under 2 dice (minimum roll is 2, and the last tile
  // is always exact-only) - always force 1 die there; this safety rule
  // holds unconditionally, even under the dev-mode force below.
  function lastTileIsOne(p) {
    var openVals = RULES.openValues(p.rack);
    return openVals.length === 1 && openVals[0] === 1;
  }

  // Dev mode only (M8, D-42): a testing instrument that forces two dice at
  // the single-die endgame, to exercise that path on demand. Not a rule,
  // not shown on the production settings surface, and never overrides the
  // last-tile-is-1 safety rule above.
  function effectiveDiceCount(p) {
    if (!RULES.singleDieUnlocked(p.rack)) return 2;
    if (lastTileIsOne(p)) return 1;
    if (game.devTwoDiceForce) return 2;
    return p.diceCount;
  }

  function onRoll() {
    var p = currentPlayer();
    var dice = RULES.rollDice(effectiveDiceCount(p));
    var total = RULES.sum(dice);
    var openVals = RULES.openValues(p.rack);
    var stalled = !RULES.anyLegalMoveExists(openVals, total, game.overpayMode);

    if (boostModeActive()) {
      var strictlyLegal = RULES.anyLegalMoveExists(openVals, total, 'A');
      p.rollHistory.push(strictlyLegal);
      if (p.rollHistory.length > CONFIG.boostDryStreakWindow) p.rollHistory.shift();
    }

    // Auto-select which type (if any) to offer - never offer one that
    // wouldn't actually resolve this stall (§3.6b/D-36).
    var offeredBoostType = (stalled && boostModeActive()) ? selectBoostTypeToOffer(p, openVals, dice, total) : null;

    game.currentRoll = {
      dice: dice,
      total: total,
      stalled: stalled,
      boostOfferPending: !!offeredBoostType,
      offeredBoostType: offeredBoostType,
      boostSpentType: null // set on spend - null | 'overpay' | 'oneForTwo'
    };
    game.selected = new Set();
    renderPlay();
    // Cosmetic only (M10) - `dice` above is already the final, decided
    // result; this just flashes the display before settling on it.
    animateDiceRoll(dice);
  }

  // §3.3's "changeable with a single tap" - a per-turn, per-player
  // preference, not persisted to settings or deferred in any way.
  function onChooseDice(count) {
    currentPlayer().diceCount = count;
    renderPlay();
  }

  function onBoostSpend() {
    if (!game.currentRoll || !game.currentRoll.boostOfferPending) return;
    var p = currentPlayer();
    var type = game.currentRoll.offeredBoostType;
    if (!type || p.boosts[type] < 1) return;
    p.boosts[type]--;
    game.currentRoll.boostSpentType = type;
    game.currentRoll.boostOfferPending = false;
    game.currentRoll.stalled = false;
    renderPlay();
  }

  function onBoostDecline() {
    if (!game.currentRoll || !game.currentRoll.boostOfferPending) return;
    game.currentRoll.boostOfferPending = false;
    // Falls back to a normal stall - rack unchanged, boost retained.
    renderPlay();
  }

  function onConfirm() {
    var p = currentPlayer();
    if (!game.currentRoll || game.currentRoll.stalled || game.currentRoll.boostOfferPending) return;
    if (!currentSelectionValid(p)) return;

    var boostSpentThisTurn = !!game.currentRoll.boostSpentType;

    game.selected.forEach(function (v) {
      var tile = p.rack.find(function (t) { return t.value === v; });
      if (tile) tile.open = false;
    });
    game.selected = new Set();
    game.currentRoll = null;

    if (RULES.isRackShut(p.rack)) {
      p.finished = true;
      p.place = game.finishedOrder.length + 1;
      game.finishedOrder.push(p.id);
      if (boostModeActive()) awardTrailingBoosts();
    }

    if (boostModeActive() && !boostSpentThisTurn) maybeAwardDryStreakBoost(p);

    proceedAfterTurn();
  }

  function onPass() {
    var p = currentPlayer();
    game.currentRoll = null;
    game.selected = new Set();
    if (boostModeActive()) maybeAwardDryStreakBoost(p);
    proceedAfterTurn();
  }

  // Whether the placement-mode threshold for ending the game has been met.
  // If all-places just reached its threshold, the single remaining player is
  // auto-placed last without needing to finish (per the rules: don't make the
  // last player grind out a solo rack).
  function checkGameEnd() {
    var total = game.players.length;
    var finishedCount = game.finishedOrder.length;
    if (finishedCount === 0) return false;

    var threshold;
    if (game.placementMode === 'winner-only') threshold = 1;
    else if (game.placementMode === 'top-two') threshold = 2;
    else threshold = total - 1; // all-places

    if (finishedCount < threshold) return false;

    if (game.placementMode === 'all-places' && finishedCount === total - 1) {
      var remaining = game.players.find(function (pl) { return !pl.finished; });
      if (remaining) {
        remaining.place = game.finishedOrder.length + 1;
        game.finishedOrder.push(remaining.id);
      }
    }
    return true;
  }

  function advanceTurn() {
    var n = game.players.length;
    for (var i = 1; i <= n; i++) {
      var idx = (game.turnIndex + i) % n;
      if (!game.players[idx].finished) {
        game.turnIndex = idx;
        return;
      }
    }
    // The game should always have ended (checkGameEnd) before rotation could
    // run out of active players. Surface this loudly rather than guarding it.
    throw new Error('Turn rotation produced no active player while the game is still running.');
  }

  function proceedAfterTurn() {
    if (checkGameEnd()) {
      endGame();
      return;
    }
    advanceTurn();
    applyPendingSettingsAtLapStart();
    beginTurn();
  }

  function renderPlayRack() {
    var p = currentPlayer();
    playRackEl.innerHTML = '';
    p.rack.forEach(function (tile) {
      var btn = document.createElement('button');
      btn.className = 'tile' + (game.selected.has(tile.value) ? ' selected' : '');
      btn.textContent = tile.value;
      btn.disabled = !tile.open || !game.currentRoll || game.currentRoll.stalled;
      if (tile.open) {
        btn.style.background = THEME.tileColors[tile.value];
        btn.style.color = THEME.tileTextColor;
      } else {
        btn.style.background = THEME.closedTileColor;
        btn.style.color = THEME.closedTileTextColor;
      }
      btn.addEventListener('click', function () { onTileClick(tile); });
      playRackEl.appendChild(btn);
    });
  }

  function renderPlayDice() {
    if (!game.currentRoll) {
      playDiceAreaEl.innerHTML = '';
      return;
    }
    var html = game.currentRoll.dice.map(function (d) {
      return '<span class="die">' + d + '</span>';
    }).join('');
    html += '<div id="total">Total: ' + game.currentRoll.total + '</div>';
    playDiceAreaEl.innerHTML = html;
  }

  // ---- Dice roll animation (M10, D-47) ----
  // The load-bearing rule: `finalDice` is already the real, fully-decided
  // roll result by the time this is ever called (onRoll computes it via
  // RULES.rollDice() first, stores it in game.currentRoll, and renderPlay()
  // has already drawn it before this runs) - everything below is a purely
  // cosmetic overlay on top of that. The random faces flashed here are
  // never read, never stored, never compared against anything; they cannot
  // influence the outcome even in principle.
  var diceAnimationIntervalId = null;

  function animateDiceRoll(finalDice) {
    var dieEls = Array.prototype.slice.call(playDiceAreaEl.querySelectorAll('.die'));
    var totalEl = document.getElementById('total');
    if (!dieEls.length) return;
    if (diceAnimationIntervalId !== null) clearInterval(diceAnimationIntervalId);

    dieEls.forEach(function (el) { el.classList.add('rolling'); });
    if (totalEl) totalEl.hidden = true;

    var elapsed = 0;
    diceAnimationIntervalId = setInterval(function () {
      elapsed += CONFIG.diceAnimationFrameMs;
      dieEls.forEach(function (el) {
        el.textContent = 1 + Math.floor(Math.random() * 6); // cosmetic flash only
      });
      if (elapsed >= CONFIG.diceAnimationDurationMs) {
        clearInterval(diceAnimationIntervalId);
        diceAnimationIntervalId = null;
        dieEls.forEach(function (el, i) {
          el.classList.remove('rolling');
          el.textContent = finalDice[i]; // settle on the predetermined result
        });
        if (totalEl) totalEl.hidden = false;
      }
    }, CONFIG.diceAnimationFrameMs);
  }

  function renderPlayMessage() {
    playMessageEl.className = '';
    if (game.currentRoll && game.currentRoll.stalled && !game.currentRoll.boostOfferPending) {
      playMessageEl.textContent = 'Stalled — no legal move for this roll.';
      playMessageEl.className = 'stalled';
    } else if (wholeRackOverpayBlocked()) {
      playMessageEl.textContent = 'Closing the whole rack needs an exact match — exclude a tile to overpay instead.';
      playMessageEl.className = 'notice';
    } else {
      playMessageEl.textContent = '';
    }
  }

  // "3" if both dice show the same face, "3 or 5" otherwise - the single
  // value (or either-of-two) a 1-for-2 boost lets the player play against.
  function oneForTwoTargetLabel(dice) {
    return dice[0] === dice[1] ? '' + dice[0] : dice[0] + ' or ' + dice[1];
  }

  function renderPlayBoostCount() {
    var p = currentPlayer();
    if (!boostModeActive()) {
      playBoostCountEl.hidden = true;
      return;
    }
    playBoostCountEl.hidden = false;
    // The last remaining tile is always exact-only (never boostable, even
    // holding a boost) - say so plainly instead of showing a count that
    // implies a boost could help here.
    if (RULES.openValues(p.rack).length === 1) {
      playBoostCountEl.textContent = 'No boosts for the last number';
    } else {
      playBoostCountEl.textContent = 'Overpay: ' + p.boosts.overpay + ' · 1-for-2: ' + p.boosts.oneForTwo;
    }
  }

  function renderPlayBoostAnnouncement() {
    var p = currentPlayer();
    if (!p.pendingBoostAnnouncement || !p.pendingBoostAnnouncement.length) {
      playBoostAnnouncementEl.hidden = true;
      return;
    }
    playBoostAnnouncementEl.hidden = false;
    var labels = p.pendingBoostAnnouncement.map(function (type) { return BOOST_TYPE_LABELS[type]; });
    playBoostAnnouncementEl.textContent = 'Boost earned: ' + labels.join(' + ') + '!';
    p.pendingBoostAnnouncement = false;
  }

  function renderPlayBoostOffer() {
    var show = !!(game.currentRoll && game.currentRoll.boostOfferPending);
    playBoostOfferEl.hidden = !show;
    if (!show) return;
    if (game.currentRoll.offeredBoostType === 'oneForTwo') {
      playBoostOfferTextEl.textContent = 'Stalled — spend a 1-for-2 boost to play a single ' +
        oneForTwoTargetLabel(game.currentRoll.dice) + '?';
    } else {
      playBoostOfferTextEl.textContent = 'Stalled — spend an overpay boost to flip tiles summing to at most ' +
        game.currentRoll.total + '?';
    }
  }

  function renderPlaySelectionSum() {
    if (!game.currentRoll || game.currentRoll.stalled) {
      playSelectionSumEl.textContent = '';
      return;
    }
    if (game.currentRoll.boostSpentType === 'oneForTwo') {
      playSelectionSumEl.textContent = 'Selected: ' + selectedSum() + ' (needs ' +
        oneForTwoTargetLabel(game.currentRoll.dice) + ')';
      return;
    }
    playSelectionSumEl.textContent = 'Selected: ' + selectedSum() + ' / ' + game.currentRoll.total;
  }

  // §3.3: shown every turn once unlocked, defaulting to whichever the
  // player last chose (or one die, per p.diceCount's default) - a live
  // toggle, not a one-time question, so the current choice is pre-marked
  // "active" and remains changeable with a single tap right up to Roll.
  // Hidden at the last-tile-is-1 safety case (nothing to choose - see
  // effectiveDiceCount) and while the M8 dev force is on (it would only
  // contradict a choice that no longer has any effect).
  function renderPlayDiceChoice() {
    var p = currentPlayer();
    var show = RULES.singleDieUnlocked(p.rack) && !lastTileIsOne(p) && !game.devTwoDiceForce && !game.currentRoll;
    if (!show) {
      playDiceChoiceEl.classList.remove('visible');
      playDiceChoiceEl.innerHTML = '';
      return;
    }
    playDiceChoiceEl.classList.add('visible');
    playDiceChoiceEl.innerHTML =
      '<button type="button" id="choice-one" class="' + (p.diceCount === 1 ? 'active' : '') + '">1 die</button>' +
      '<button type="button" id="choice-two" class="' + (p.diceCount === 2 ? 'active' : '') + '">2 dice</button>';
    document.getElementById('choice-one').addEventListener('click', function () { onChooseDice(1); });
    document.getElementById('choice-two').addEventListener('click', function () { onChooseDice(2); });
  }

  function renderPlayButtons() {
    var boostOfferPending = !!(game.currentRoll && game.currentRoll.boostOfferPending);
    var stalled = !!(game.currentRoll && game.currentRoll.stalled) && !boostOfferPending;

    playRollBtn.hidden = stalled || boostOfferPending;
    playPassBtn.hidden = !stalled;
    playConfirmBtn.hidden = stalled || boostOfferPending;

    playRollBtn.disabled = game.currentRoll !== null;

    if (!game.currentRoll || game.currentRoll.stalled || boostOfferPending) {
      playConfirmBtn.disabled = true;
    } else {
      playConfirmBtn.disabled = !currentSelectionValid(currentPlayer());
    }
  }

  function renderPlay() {
    var p = currentPlayer();
    playPlayerNameEl.textContent = p.name;
    playPlayerNameEl.style.color = p.color;
    renderPlayBoostCount();
    renderPlayBoostAnnouncement();
    renderPlayRack();
    renderPlayDice();
    renderPlayMessage();
    renderPlaySelectionSum();
    renderPlayDiceChoice();
    renderPlayBoostOffer();
    renderPlayButtons();
    applyTheme();
  }

  playRollBtn.addEventListener('click', onRoll);
  playConfirmBtn.addEventListener('click', onConfirm);
  playPassBtn.addEventListener('click', onPass);
  playBoostSpendBtn.addEventListener('click', onBoostSpend);
  playBoostDeclineBtn.addEventListener('click', onBoostDecline);

  // ---- End screen ----

  function renderEnd() {
    finishListEl.innerHTML = '';
    game.finishedOrder.forEach(function (id, index) {
      var p = game.players.find(function (pl) { return pl.id === id; });
      var li = document.createElement('li');
      li.textContent = p.name;
      li.style.color = p.color;
      finishListEl.appendChild(li);
    });
  }

  function endGame() {
    renderEnd();
    showScreen('end');
    applyTheme();
  }

  endNewGameBtn.addEventListener('click', function () {
    game = null;
    renderSetup();
    showScreen('setup');
  });

  // ---- Time challenge (M9, dev mode) ----
  // An anti-drag circuit-breaker, not a rule: ends a game that won't end,
  // without declaring a false winner. Pure overlay on top of the existing
  // turn loop - ticks independently on a fixed interval and only ever reads
  // `activeScreen`/`game.timeChallenge`, never touches turn/rack state. Per
  // §5/M9: pauses while a turn/player screen shows, runs on the active rack.

  function formatSecondsLabel(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function formatChallengeTime(ms) {
    return formatSecondsLabel(Math.ceil(ms / 1000));
  }

  // Called on every screen transition (see showScreen) and every tick while
  // running (see tickChallenge) - the single place that keeps both HUD
  // elements in sync with game.timeChallenge. Hidden entirely when no
  // challenge is active for this game.
  function renderChallengeTimer() {
    var active = !!(game && game.timeChallenge);
    turncardTimerEl.hidden = !active;
    playTimerEl.hidden = !active;
    if (!active) return;
    var label = formatChallengeTime(game.timeChallenge.remainingMs);
    turncardTimerEl.textContent = 'Time challenge (paused): ' + label;
    playTimerEl.textContent = 'Time challenge: ' + label;
  }

  // Deliberately no ranking (§5/M9) - nobody shut their box, so there is no
  // winner, and a placeholder table would undercut the very tension being
  // tested. Do not add one here.
  function timeoutGame() {
    showScreen('timeout');
    applyTheme();
  }

  var CHALLENGE_TICK_MS = 250;
  var lastChallengeTickAt = null;

  // Delta-time based, not a fixed decrement per tick, so a long pause (the
  // turn card showing for a while) never produces a jump once it resumes -
  // the elapsed gap is only ever measured across two ticks that were both
  // actually running.
  function tickChallenge() {
    var now = Date.now();
    if (!game || !game.timeChallenge || activeScreen !== 'play') {
      lastChallengeTickAt = now;
      return;
    }
    if (lastChallengeTickAt === null) lastChallengeTickAt = now;
    var delta = now - lastChallengeTickAt;
    lastChallengeTickAt = now;
    game.timeChallenge.remainingMs = Math.max(0, game.timeChallenge.remainingMs - delta);
    renderChallengeTimer();
    if (game.timeChallenge.remainingMs <= 0) timeoutGame();
  }

  setInterval(tickChallenge, CHALLENGE_TICK_MS);

  timeoutNewGameBtn.addEventListener('click', function () {
    game = null;
    renderSetup();
    showScreen('setup');
  });

  // ---- Launch screen (motion permission gate) ----

  function beginMotionListening() {
    MOTION.startListening(onFlatChange, function () {
      lastMotionSampleAt = Date.now();
    });
  }

  screens.launch.addEventListener('click', function () {
    // §3.8: when the persisted preference is already OFF (e.g. from a prior
    // session), no permission is requested at all - not just ignored once
    // granted.
    if (!settings.motionEnabled) {
      renderSetup();
      showScreen('setup');
      return;
    }
    MOTION.requestPermission().then(function (granted) {
      motionPermissionGranted = granted;
      if (granted) beginMotionListening();
      renderSetup();
      showScreen('setup');
    });
  });

  // ---- Boot ----
  applyTheme();
  showScreen('launch');
})();
