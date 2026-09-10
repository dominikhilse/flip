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
    end: document.getElementById('screen-end')
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
  var motionToggleEl = document.getElementById('motion-toggle');
  var tapToggleEl = document.getElementById('tap-toggle');
  var themeToggleEl = document.getElementById('theme-toggle');
  var startGameBtn = document.getElementById('start-game');
  var backToGameBtn = document.getElementById('back-to-game');

  var turncardNameEl = document.getElementById('turncard-name');
  var turncardScreenEl = screens.turncard;
  var settingsFromTurncardBtn = document.getElementById('settings-from-turncard');

  var playPlayerNameEl = document.getElementById('play-player-name');
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

  function showScreen(name) {
    activeScreen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].hidden = key !== name;
    });
  }

  // Whether the CURRENT roll is being resolved under overpay-relaxed rules
  // right now - either overpayMode is 'D', or this roll's boost was spent.
  // Deliberately excludes the stalled/offer-pending states: the flip is
  // meant to mark "you can make a loose move right now", not "you might".
  function overpayFlipActive() {
    if (!game || !game.currentRoll) return false;
    var r = game.currentRoll;
    if (r.stalled || r.boostOfferPending) return false;
    return r.boostSpent || game.overpayMode === 'D';
  }

  // Theme is purely cosmetic (never stored on `game`) but doubles as the
  // overpay "visual highlight" the design track hasn't nailed down yet: the
  // effective theme is the user's preference XORed with overpayFlipActive,
  // so the whole page inverts for the moment an overpay move is available.
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
  }

  function renderPrimaryAction() {
    var midGame = game !== null;
    startGameBtn.hidden = midGame;
    backToGameBtn.hidden = !midGame;
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
  // game.motionEnabled/game.tapToProceed) - no fairness reason to defer
  // these, so they take effect immediately, live, even mid-turn.
  var IMMEDIATE_SETTING_KEYS = ['motionEnabled', 'tapToProceed'];

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
        diceCount: 2,
        diceCountChosenByPlayer: false,
        // Boost mode (§3.6, M6) - typed holding, never a bare integer, so a
        // future boost type is additive rather than a schema change.
        boosts: { overpay: 0 },
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

  // ---- Boost mode (§3.6, M6) ----
  // Reached via overpayMode 'A' + boostEnabled (§3.5) - never touches D's
  // rules. Base play stays strict (mode 'A'); a spent boost relaxes only
  // the current roll to D-style validity (RULES already encodes the
  // last-tile-exact exception, so it's reused rather than duplicated).

  function boostModeActive() {
    return game.overpayMode === 'A' && game.boostEnabled;
  }

  function awardBoost(p) {
    if (p.boosts.overpay >= CONFIG.boostMaxHeld) return; // discarded past the cap (D-20)
    p.boosts.overpay++;
    p.pendingBoostAnnouncement = true;
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

  function onRoll() {
    var p = currentPlayer();
    var unlocked = RULES.singleDieUnlocked(p.rack);
    var countToUse = unlocked ? p.diceCount : 2;
    var dice = RULES.rollDice(countToUse);
    var total = RULES.sum(dice);
    var openVals = RULES.openValues(p.rack);
    var stalled = !RULES.anyLegalMoveExists(openVals, total, game.overpayMode);

    if (boostModeActive()) {
      var strictlyLegal = RULES.anyLegalMoveExists(openVals, total, 'A');
      p.rollHistory.push(strictlyLegal);
      if (p.rollHistory.length > CONFIG.boostDryStreakWindow) p.rollHistory.shift();
    }

    // Only offer a boost if spending it would actually produce a legal
    // move - never offer one that the last-tile-exact rule would make
    // pointless to spend.
    var boostOfferPending = stalled && boostModeActive() && p.boosts.overpay >= 1 &&
      RULES.anyLegalMoveExists(openVals, total, 'D');

    game.currentRoll = { dice: dice, total: total, stalled: stalled, boostOfferPending: boostOfferPending, boostSpent: false };
    game.selected = new Set();
    renderPlay();
  }

  function onChooseDice(count) {
    var p = currentPlayer();
    p.diceCount = count;
    p.diceCountChosenByPlayer = true;
    renderPlay();
  }

  function onBoostSpend() {
    if (!game.currentRoll || !game.currentRoll.boostOfferPending) return;
    var p = currentPlayer();
    if (p.boosts.overpay < 1) return;
    p.boosts.overpay--;
    game.currentRoll.boostSpent = true;
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
    var openVals = RULES.openValues(p.rack);
    var selectedVals = Array.from(game.selected);
    var effectiveMode = game.currentRoll.boostSpent ? 'D' : game.overpayMode;
    if (!RULES.isValidSelection(openVals, selectedVals, game.currentRoll.total, effectiveMode)) return;

    var boostSpentThisTurn = game.currentRoll.boostSpent;

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
    } else if (RULES.singleDieUnlocked(p.rack) && !p.diceCountChosenByPlayer) {
      p.diceCount = 1;
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

  function renderPlayMessage() {
    playMessageEl.className = '';
    if (game.currentRoll && game.currentRoll.stalled && !game.currentRoll.boostOfferPending) {
      playMessageEl.textContent = 'Stalled — no legal move for this roll.';
      playMessageEl.className = 'stalled';
    } else {
      playMessageEl.textContent = '';
    }
  }

  function renderPlayBoostCount() {
    var p = currentPlayer();
    if (!boostModeActive()) {
      playBoostCountEl.hidden = true;
      return;
    }
    playBoostCountEl.hidden = false;
    playBoostCountEl.textContent = 'Overpay boosts: ' + p.boosts.overpay;
  }

  function renderPlayBoostAnnouncement() {
    var p = currentPlayer();
    if (!p.pendingBoostAnnouncement) {
      playBoostAnnouncementEl.hidden = true;
      return;
    }
    playBoostAnnouncementEl.hidden = false;
    playBoostAnnouncementEl.textContent = 'Boost earned! Overpay boosts: ' + p.boosts.overpay;
    p.pendingBoostAnnouncement = false;
  }

  function renderPlayBoostOffer() {
    var show = !!(game.currentRoll && game.currentRoll.boostOfferPending);
    playBoostOfferEl.hidden = !show;
    if (show) {
      playBoostOfferTextEl.textContent = 'Stalled — spend an overpay boost to flip tiles summing to at most ' +
        game.currentRoll.total + '?';
    }
  }

  function renderPlaySelectionSum() {
    if (!game.currentRoll || game.currentRoll.stalled) {
      playSelectionSumEl.textContent = '';
      return;
    }
    playSelectionSumEl.textContent = 'Selected: ' + selectedSum() + ' / ' + game.currentRoll.total;
  }

  function renderPlayDiceChoice() {
    var p = currentPlayer();
    var unlocked = RULES.singleDieUnlocked(p.rack);
    var show = unlocked && !game.currentRoll;
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
      var p = currentPlayer();
      var openVals = RULES.openValues(p.rack);
      var selectedVals = Array.from(game.selected);
      var effectiveMode = game.currentRoll.boostSpent ? 'D' : game.overpayMode;
      playConfirmBtn.disabled = !RULES.isValidSelection(openVals, selectedVals, game.currentRoll.total, effectiveMode);
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
