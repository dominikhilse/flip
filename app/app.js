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

  // M12: tab bar + per-tab panels. Elements inside the panels (roster list,
  // rack size, etc.) keep their pre-M12 ids unchanged - this is a container
  // reorganisation, not a rebuild of the controls themselves.
  var setupMidgameBannerEl = document.getElementById('setup-midgame-banner');
  var setupTabbarEl = document.getElementById('setup-tabbar');
  var setupTabPanels = {
    players: document.getElementById('setup-tab-players'),
    rules: document.getElementById('setup-tab-rules'),
    app: document.getElementById('setup-tab-app'),
    dev: document.getElementById('setup-tab-dev')
  };
  var activeSetupTab = 'players';

  var rosterListEl = document.getElementById('roster-list');
  var addPlayerForm = document.getElementById('add-player-form');
  var playerNameInput = document.getElementById('player-name-input');
  var colorSwatchesEl = document.getElementById('color-swatches');
  var rosterNoteEl = document.getElementById('roster-note');
  var rackSizeToggleEl = document.getElementById('rack-size-toggle');
  var placementModeEl = document.getElementById('placement-mode');
  var overpayToggleEl = document.getElementById('overpay-toggle');
  var boostCheckboxEl = document.getElementById('boost-checkbox');
  var devDiceTestEnabledEl = document.getElementById('dev-dice-test-enabled');
  var devDiceChoiceRowEl = document.getElementById('dev-dice-choice-row');
  var devDiceChoiceToggleEl = document.getElementById('dev-dice-choice-toggle');
  var devTimeChallengeInputEl = document.getElementById('dev-time-challenge-input');
  var devTimeChallengeSetBtn = document.getElementById('dev-time-challenge-set');
  var devTimeChallengeStatusEl = document.getElementById('dev-time-challenge-status');
  var motionToggleEl = document.getElementById('motion-toggle');
  var tapToggleEl = document.getElementById('tap-toggle');
  var themeToggleGroupEl = document.getElementById('theme-toggle-group');
  var startGameBtn = document.getElementById('start-game');
  var backToGameBtn = document.getElementById('back-to-game');
  var restartMatchBtn = document.getElementById('restart-match');
  var endGameBtn = document.getElementById('end-game');

  var confirmDialogEl = document.getElementById('confirm-dialog');
  var confirmDialogTextEl = document.getElementById('confirm-dialog-text');
  var confirmDialogOkBtn = document.getElementById('confirm-dialog-ok');
  var confirmDialogCancelBtn = document.getElementById('confirm-dialog-cancel');

  var turncardNameEl = document.getElementById('turncard-name');
  var turncardScreenEl = screens.turncard;
  var settingsFromTurncardBtn = document.getElementById('settings-from-turncard');
  var turncardTimerEl = document.getElementById('turncard-timer');
  var turncardAvatarBtn = document.getElementById('turncard-avatar-btn');
  var turncardAvatarImgEl = document.getElementById('turncard-avatar-img');

  var playPlayerNameEl = document.getElementById('play-player-name');
  var playAvatarBtn = document.getElementById('play-avatar-btn');
  var playAvatarImgEl = document.getElementById('play-avatar-img');
  var playTimerEl = document.getElementById('play-timer');
  var playBoostCountEl = document.getElementById('play-boost-count');
  var playBoostAnnouncementEl = document.getElementById('play-boost-announcement');
  var playMessageEl = document.getElementById('play-message');
  var playSelectionSumEl = document.getElementById('play-selection-sum');
  var playRackEl = document.getElementById('play-rack');
  var playDiceAreaEl = document.getElementById('play-dice-area');
  var playBoostOfferEl = document.getElementById('play-boost-offer');
  var playBoostOfferTextEl = document.getElementById('play-boost-offer-text');
  var playBoostSpendBtn = document.getElementById('play-boost-spend');
  var playBoostDeclineBtn = document.getElementById('play-boost-decline');
  var playRollBtn = document.getElementById('play-roll');
  var playConfirmBtn = document.getElementById('play-confirm');
  var playPassBtn = document.getElementById('play-pass');
  var settingsFromPlayBtn = document.getElementById('settings-from-play');

  var finishListEl = document.getElementById('finish-list');
  var endNewGameBtn = document.getElementById('end-new-game');
  var endRematchBtn = document.getElementById('end-rematch');
  var timeoutNewGameBtn = document.getElementById('timeout-new-game');
  var timeoutRematchBtn = document.getElementById('timeout-rematch');

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

  // ---- Confirm dialog (M11, D-51) ----
  // One generic native <dialog>, reused for every destructive mid-game
  // exit (End match, Restart) rather than a bespoke dialog per action.
  // Listeners are attached/removed per call instead of once at boot, since
  // each call needs its own onConfirm closure. Cleanup hangs off the
  // dialog's own `close` event (fires however it closed - Cancel, OK, or a
  // desktop Escape key) rather than off Cancel/OK directly, so an
  // Escape-dismiss can't leak listeners or skip cleanup.
  function confirmAction(message, onConfirm) {
    confirmDialogTextEl.textContent = message;
    var confirmed = false;
    function onOk() { confirmed = true; confirmDialogEl.close(); }
    function onCancel() { confirmDialogEl.close(); }
    function onClose() {
      confirmDialogOkBtn.removeEventListener('click', onOk);
      confirmDialogCancelBtn.removeEventListener('click', onCancel);
      confirmDialogEl.removeEventListener('close', onClose);
      if (confirmed) onConfirm();
    }
    confirmDialogOkBtn.addEventListener('click', onOk);
    confirmDialogCancelBtn.addEventListener('click', onCancel);
    confirmDialogEl.addEventListener('close', onClose);
    confirmDialogEl.showModal();
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

  var DRAG_HANDLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<line x1="4" y1="9" x2="20" y2="9"></line>' +
    '<line x1="4" y1="15" x2="20" y2="15"></line></svg>';

  function renderRosterList() {
    var blocked = game !== null;
    rosterListEl.innerHTML = '';
    roster.forEach(function (p) {
      var li = document.createElement('li');
      li.dataset.playerId = p.id;

      var handle = document.createElement('span');
      handle.className = 'drag-handle' + (blocked ? ' disabled' : '');
      handle.innerHTML = DRAG_HANDLE_SVG;
      if (!blocked) handle.addEventListener('pointerdown', onRosterDragStart);

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

      li.appendChild(handle);
      li.appendChild(swatch);
      li.appendChild(name);
      li.appendChild(removeBtn);
      rosterListEl.appendChild(li);
    });
  }

  // ---- Roster drag-to-reorder (manual pick-and-drag) ----
  // Pointer Events (not HTML5 drag-and-drop, which has no reliable touch
  // support) so this works on the phone this game is actually played on.
  // See repositionRosterDrag for how the dragged row tracks the pointer and
  // swaps with neighbours. On release the DOM's final order (read back via
  // each li's data-player-id) becomes the new `roster` order and is
  // persisted.
  var rosterDrag = null;

  function onRosterDragStart(e) {
    if (game !== null) return;
    var li = e.target.closest('li');
    if (!li) return;
    e.target.setPointerCapture(e.pointerId);
    li.classList.add('dragging');
    rosterDrag = { li: li, pointerId: e.pointerId, handle: e.target };
    e.target.addEventListener('pointermove', onRosterDragMove);
    e.target.addEventListener('pointerup', onRosterDragEnd);
    e.target.addEventListener('pointercancel', onRosterDragEnd);
  }

  // Keeps the dragged row's visual centre pinned exactly to the pointer's Y
  // and cascades as many neighbour swaps as the jump warrants. Each pass
  // clears the transform to read the row's current NATURAL (untransformed)
  // slot, derives the transform that would pin it to pointerY from there,
  // and only then checks whether that still overshoots the next neighbour -
  // recomputing from the natural position each time (rather than
  // compounding an old transform) is what lets one big jump - a fast flick,
  // or a coarse test drag with few move events - cascade through more than
  // one swap instead of stalling after the first.
  function repositionRosterDrag(li, pointerY) {
    var swapped = true;
    while (swapped) {
      swapped = false;
      li.style.transform = '';
      var naturalRect = li.getBoundingClientRect();
      var naturalMid = naturalRect.top + naturalRect.height / 2;
      var deltaY = pointerY - naturalMid;
      li.style.transform = 'translateY(' + deltaY + 'px)';
      var movingDown = deltaY > 0;
      var siblings = Array.prototype.slice.call(rosterListEl.children).filter(function (el) { return el !== li; });
      for (var i = 0; i < siblings.length; i++) {
        var sib = siblings[i];
        var sibRect = sib.getBoundingClientRect();
        var sibMid = sibRect.top + sibRect.height / 2;
        var sibFollows = !!(li.compareDocumentPosition(sib) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (movingDown && pointerY > sibMid && sibFollows) {
          rosterListEl.insertBefore(li, sib.nextSibling);
          swapped = true;
          break;
        }
        if (!movingDown && pointerY < sibMid && !sibFollows) {
          rosterListEl.insertBefore(li, sib);
          swapped = true;
          break;
        }
      }
    }
  }

  function onRosterDragMove(e) {
    if (!rosterDrag || e.pointerId !== rosterDrag.pointerId) return;
    repositionRosterDrag(rosterDrag.li, e.clientY);
  }

  function onRosterDragEnd(e) {
    if (!rosterDrag || e.pointerId !== rosterDrag.pointerId) return;
    var handle = rosterDrag.handle;
    handle.removeEventListener('pointermove', onRosterDragMove);
    handle.removeEventListener('pointerup', onRosterDragEnd);
    handle.removeEventListener('pointercancel', onRosterDragEnd);
    rosterDrag.li.classList.remove('dragging');
    rosterDrag.li.style.transform = '';

    var order = Array.prototype.map.call(rosterListEl.children, function (li) { return li.dataset.playerId; });
    roster = order.map(function (id) {
      return roster.find(function (p) { return p.id === id; });
    });
    STORAGE.saveRoster(roster);
    rosterDrag = null;
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
  // blocked-until-next-game (visibly disabled); placement, overpay, and the
  // boost checkbox are live-at-end-of-lap (editable mid-game, but deferred -
  // see queueSettingChange). D-30's tiering is now shown as a static "next
  // game"/"next lap" chip next to each control's label (M12) rather than a
  // conditionally-hidden note - the one dynamic, mid-game-only message is
  // the single banner at the top of the menu (see renderSetupTabs).
  function renderSettingsControls() {
    var midGame = game !== null;

    var rackSizeBtns = rackSizeToggleEl.querySelectorAll('.toggle-btn');
    rackSizeBtns.forEach(function (btn) {
      var size = parseInt(btn.getAttribute('data-rack-size'), 10);
      btn.classList.toggle('active', settings.rackSize === size);
      btn.disabled = midGame;
    });

    placementModeEl.value = settings.placementMode;

    var overpayBtns = overpayToggleEl.querySelectorAll('.toggle-btn');
    overpayBtns.forEach(function (btn) {
      btn.classList.toggle('active', settings.overpayMode === btn.getAttribute('data-overpay'));
    });

    boostCheckboxEl.checked = settings.boostEnabled;
    boostCheckboxEl.disabled = settings.overpayMode !== 'A';
    boostCheckboxEl.closest('.setting-row').classList.toggle('disabled', boostCheckboxEl.disabled);

    // Motion, tap-to-proceed, and theme are input/cosmetic preferences, not
    // rules - they apply immediately (see queueSettingChange), so unlike
    // the settings above they carry no next-game/next-lap chip.
    motionToggleEl.checked = settings.motionEnabled;
    tapToggleEl.checked = settings.tapToProceed;
    var themeBtns = themeToggleGroupEl.querySelectorAll('.toggle-btn');
    themeBtns.forEach(function (btn) {
      btn.classList.toggle('active', settings.theme === btn.getAttribute('data-theme'));
    });

    // Dev mode (M8) dice-choice test instrument - applies immediately like
    // the preferences above, carries no "applies next lap" note. The
    // nested 1/2/? toggle only shows once the checkbox is ticked.
    devDiceTestEnabledEl.checked = settings.devDiceTestEnabled;
    devDiceChoiceRowEl.hidden = !settings.devDiceTestEnabled;
    var diceChoiceBtns = devDiceChoiceToggleEl.querySelectorAll('.toggle-btn');
    diceChoiceBtns.forEach(function (btn) {
      btn.classList.toggle('active', settings.devDiceChoice === btn.getAttribute('data-dice-choice'));
    });

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
    restartMatchBtn.hidden = !midGame;
    endGameBtn.hidden = !midGame;
    startGameBtn.disabled = roster.length < 2;
  }

  function renderRosterEditability() {
    var blocked = game !== null;
    playerNameInput.disabled = blocked;
    addPlayerForm.querySelector('button[type="submit"]').disabled = blocked;
    rosterNoteEl.hidden = !blocked;
  }

  // M12: tab bar + the one standing mid-game banner (replaces the old
  // scattered per-control "applies next lap" notes - see
  // renderSettingsControls). activeSetupTab persists across renders (a
  // module-level var, not part of `game`/`settings`) so reopening the menu
  // doesn't reset the player back to Players every time.
  function renderSetupTabs() {
    var tabBtns = setupTabbarEl.querySelectorAll('.tab-btn');
    tabBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === activeSetupTab);
    });
    Object.keys(setupTabPanels).forEach(function (key) {
      setupTabPanels[key].hidden = key !== activeSetupTab;
    });
    setupMidgameBannerEl.hidden = game === null;
  }

  setupTabbarEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    activeSetupTab = btn.getAttribute('data-tab');
    renderSetupTabs();
  });

  function renderSetup() {
    renderRosterList();
    renderColorSwatches();
    renderRosterEditability();
    renderSettingsControls();
    renderPrimaryAction();
    renderSetupTabs();
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

  // Resets to 'ask' every time the checkbox is (re-)ticked, per the
  // request this was built for: a known, predictable starting point
  // rather than resuming whatever was last force-set.
  devDiceTestEnabledEl.addEventListener('change', function () {
    var enabled = devDiceTestEnabledEl.checked;
    queueSettingChange('devDiceTestEnabled', enabled);
    if (enabled) queueSettingChange('devDiceChoice', 'ask');
    renderSettingsControls();
  });

  devDiceChoiceToggleEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    queueSettingChange('devDiceChoice', btn.getAttribute('data-dice-choice'));
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

  // Guarded (M11, D-51): a match is always live whenever this button is
  // visible (see renderPrimaryAction), so it always needs the confirm.
  endGameBtn.addEventListener('click', function () {
    if (!game) return;
    confirmAction('End this match? Progress will be lost. This can\'t be undone.', function () {
      game = null;
      renderSetup();
      showScreen('setup');
    });
  });

  // Guarded (M11, D-51): same reasoning as End - a match is always live
  // whenever this button is visible.
  restartMatchBtn.addEventListener('click', function () {
    if (!game) return;
    confirmAction('Restart this match? Racks and boosts reset for everyone. This can\'t be undone.', restartMatch);
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

  themeToggleGroupEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    queueSettingChange('theme', btn.getAttribute('data-theme'));
    renderSettingsControls();
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
  // game.motionEnabled/game.tapToProceed/game.devDiceTestEnabled/
  // game.devDiceChoice) - no fairness reason to defer these, so they take
  // effect immediately, live, even mid-turn. The dev dice-test pair is a
  // testing instrument, not a rule (M8).
  var IMMEDIATE_SETTING_KEYS = ['motionEnabled', 'tapToProceed', 'devDiceTestEnabled', 'devDiceChoice'];

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

  // ---- Avatars (M13, D-55) ----
  // Files are app/avatars/01.png..NN.png where NN = CONFIG.avatarCount -
  // that count is the one place a static site (no directory listing at
  // runtime) records how many exist.
  function avatarFilename(n) {
    return String(n).padStart(2, '0') + '.png';
  }

  function avatarPool() {
    var pool = [];
    for (var i = 1; i <= CONFIG.avatarCount; i++) pool.push(avatarFilename(i));
    return pool;
  }

  // Randomly assigned without replacement at every game start (including
  // Restart, which re-racks everyone the same way) - unique per player as
  // long as the pool covers the seat count, which D-55's fixed 20 guarantees
  // against the 12-tile rack max. Player COUNT itself has no cap (§3.1)
  // though, so if a roster ever exceeds the pool size this degrades to
  // repeating the shuffled pool rather than erroring - every player still
  // gets an avatar, just not a unique one past the pool size. An edge case
  // no real pass-the-phone session will hit.
  function assignAvatars(players) {
    var pool = avatarPool();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    players.forEach(function (p, idx) {
      p.avatar = pool[idx % pool.length];
    });
  }

  // Cycling (D-55): tap an avatar (Play header or the turn card, issue #2)
  // to browse to the next one not currently held by another player THIS
  // game, wrapping around the full set - keeps every player's avatar
  // unique through cycling too, not just at initial assignment (the point
  // of "primary 9-12 distinguisher" breaks if two players can end up
  // sharing one by cycling into it). Mutates p.avatar only - callers
  // re-render whichever screen they're on, since this is reachable from
  // more than one place.
  function cycleAvatar(p) {
    var pool = avatarPool();
    var taken = new Set(game.players.filter(function (pl) { return pl !== p; }).map(function (pl) { return pl.avatar; }));
    var startIdx = pool.indexOf(p.avatar);
    for (var step = 1; step <= pool.length; step++) {
      var candidate = pool[(startIdx + step) % pool.length];
      if (!taken.has(candidate)) { p.avatar = candidate; break; }
    }
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
    assignAvatars(players);
    game = {
      players: players,
      turnIndex: 0,
      placementMode: settings.placementMode,
      overpayMode: settings.overpayMode,
      boostEnabled: settings.boostEnabled,
      // M8 dice-choice test instrument, not a rule - see effectiveDiceCount.
      devDiceTestEnabled: settings.devDiceTestEnabled,
      devDiceChoice: settings.devDiceChoice,
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

  // Restart match (M11, D-51): a same-group replay of THIS match, distinct
  // from New Game (which discards to Setup and can change roster/settings).
  // Keeps game.players (identity, seat order, color) and every setting the
  // live game was started with, but re-racks everyone fresh and - unlike
  // New Game's boost carryover (§3.6) - resets every player's boosts to
  // zero. Rationale: this is a do-over of the same match, and resetting
  // boosts incentivises actually finishing a match to keep what's earned,
  // rather than restarting mid-game to shed a bad rack while keeping
  // accumulated boosts. Rack size comes from the player's own current rack
  // length, not settings.rackSize, so this can never disagree with what
  // this particular match was actually playing (rack size is
  // blocked-until-next-game anyway, so they can't have diverged, but this
  // avoids relying on that invariant holding elsewhere).
  function restartMatch() {
    if (!game) return;
    game.players.forEach(function (p) {
      p.rack = RULES.createRack(p.rack.length);
      p.finished = false;
      p.place = null;
      p.diceCount = 1;
      p.boosts = { overpay: 0, oneForTwo: 0 };
      p.pendingBoostCredits = { overpay: 0, oneForTwo: 0 };
      p.rollHistory = [];
      p.pendingBoostAnnouncement = false;
    });
    assignAvatars(game.players); // fresh deal, same as a genuine game start
    game.turnIndex = 0;
    game.finishedOrder = [];
    game.pendingSettings = null;
    game.currentRoll = null;
    game.selected = new Set();
    game.timeChallenge = settings.timeChallengeSeconds > 0
      ? { remainingMs: settings.timeChallengeSeconds * 1000 }
      : null;
    beginTurn();
  }

  function currentPlayer() {
    return game.players[game.turnIndex];
  }

  function showTurnCardFor(p) {
    turncardScreenEl.style.background = p.color;
    turncardNameEl.textContent = p.name;
    turncardAvatarImgEl.src = 'avatars/' + p.avatar;
    turncardAvatarImgEl.alt = p.name + '’s avatar';
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
    // Issue #2: the turn card's own avatar is now tap-to-cycle, so "tap
    // anywhere to continue" must exclude it specifically - .contains(),
    // not a direct === check, since the actual click target is the <img>
    // inside the button, not the button itself.
    if (turncardAvatarBtn.contains(e.target)) return;
    if (!effectiveTap()) return;
    goToRack();
  });

  // Issue #2: cycling here is independent of effectiveTap()/tap-to-proceed
  // - it's not a turn-advance gesture, so it always works regardless of the
  // motion/tap settings that gate goToRack() above.
  turncardAvatarBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var p = currentPlayer();
    cycleAvatar(p);
    turncardAvatarImgEl.src = 'avatars/' + p.avatar;
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

  // M11/P0 (D-51): the load-bearing fix for the urgent no-recovery-path
  // flag - Play previously had no exit at all when Motion was off (the
  // only "exit," picking the phone up, is a no-op with Motion off). This
  // gives Play the same corner exit the turn card already has, into the
  // same reused Setup/Settings screen - not a new UI surface.
  settingsFromPlayBtn.addEventListener('click', function (e) {
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
    var openVals = RULES.openValues(p.rack);
    // A boost-spent move (either type) may never be the move that shuts the
    // whole rack, even on an exact match - the game must not be completed
    // with a boost (real-device report/DECISIONS.md). Checked once here,
    // ahead of the per-type shape checks below, so it applies uniformly.
    if (game.currentRoll.boostSpentType && selectedVals.length === openVals.length) return false;
    if (game.currentRoll.boostSpentType === 'oneForTwo') {
      return RULES.isValidOneForTwoSelection(selectedVals, game.currentRoll.dice);
    }
    var effectiveMode = game.currentRoll.boostSpentType === 'overpay' ? 'D' : game.overpayMode;
    return RULES.isValidSelection(openVals, selectedVals, game.currentRoll.total, effectiveMode);
  }

  // Whether the current selection is blocked specifically because it's a
  // boost-spent move covering every open tile (see currentSelectionValid) -
  // drives the explanatory message so Confirm being disabled isn't silent.
  function boostWholeRackBlocked() {
    if (!game.currentRoll || game.currentRoll.stalled || game.currentRoll.boostOfferPending) return false;
    if (!game.currentRoll.boostSpentType) return false;
    var openVals = RULES.openValues(currentPlayer().rack);
    return game.selected.size === openVals.length;
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

  // Production default (dev dice-test off): a silent, hardcoded one die -
  // no prompt, no player-facing choice at all. §3.3's "changeable with a
  // tap" only exists at all when a tester has deliberately opted in below;
  // it is never shown on the production settings surface. The last-tile-
  // is-1 safety rule always wins regardless, including over a dev force.
  function effectiveDiceCount(p) {
    if (!RULES.singleDieUnlocked(p.rack)) return 2;
    if (lastTileIsOne(p)) return 1;
    if (!game.devDiceTestEnabled) return 1;
    if (game.devDiceChoice === '2') return 2;
    if (game.devDiceChoice === '1') return 1;
    return p.diceCount; // devDiceChoice === 'ask' - the live per-turn choice
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
    // Exposed as a CSS custom property so .tile's font-size (style.css) can
    // scale against the actual row height, not just the rack container's
    // total height - cqh alone can't tell 3 short rows from 4 shorter ones,
    // since the container's own height doesn't change, only how many rows
    // divide it.
    playRackEl.style.setProperty('--rack-rows', Math.ceil(p.rack.length / 3));
    playRackEl.innerHTML = '';
    p.rack.forEach(function (tile) {
      var btn = document.createElement('button');
      btn.className = 'tile' + (tile.open ? '' : ' closed') + (game.selected.has(tile.value) ? ' selected' : '');
      btn.textContent = tile.value;
      btn.disabled = !tile.open || !game.currentRoll || game.currentRoll.stalled;
      // M13/D-53-55: fill/edge/ink per tile, not a flat colour - edge is the
      // tile's border (a non-hue identity channel), ink the numeral. Closed
      // tiles use THEME.closedTile regardless of value - the desaturated
      // fill plus the CSS inset shadow (.tile.closed) are two of the three
      // redundant closed-state cues; the dim `ink` here is the third.
      var colors = tile.open ? THEME.tileColors[tile.value] : THEME.closedTile;
      btn.style.background = colors.fill;
      btn.style.borderColor = colors.edge;
      btn.style.color = colors.ink;
      btn.addEventListener('click', function () { onTileClick(tile); });
      playRackEl.appendChild(btn);
    });
  }

  // Standard die pips, drawn as inline SVG rather than a Unicode glyph
  // (U+2680-2685) - the glyph approach rendered legibly but tiny, because
  // how much of its own em-box a symbol character actually fills is baked
  // into the font, not something font-size alone controls. An SVG with a
  // fixed viewBox scaled to 100% of .die's box sizes exactly to the
  // container instead. Tiles keep plain numerals (D-13); this is the
  // rolled dice only. fill="currentColor" so it follows .die's own color
  // token like text would.
  var DIE_PIPS = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
  };

  function dieFaceSVG(value) {
    var pips = DIE_PIPS[value] || [];
    var circles = pips.map(function (pos) {
      return '<circle cx="' + pos[0] + '" cy="' + pos[1] + '" r="11"></circle>';
    }).join('');
    return '<svg class="die-face" viewBox="0 0 100 100" aria-hidden="true">' + circles + '</svg>';
  }

  // Pre-roll (no game.currentRoll yet), this renders the SAME die-count and
  // total-line markup a real roll would, just invisible - not merely absent
  // - so the block's rendered height is identical before, during, and after
  // a roll. Rendering nothing pre-roll (the earlier approach) reserved the
  // right space only once a roll was already in flight; the rack above it
  // still grew to fill that larger gap before the very first roll of a turn
  // and visibly shrank back the moment dice appeared (GitHub issue #1, an
  // extension of the roll-animation jump fixed earlier the same way).
  // effectiveDiceCount is pure w.r.t. current state (rack/dev settings), not
  // the eventual random roll, so the placeholder count always matches what
  // a real roll would show right now.
  // Issue #3: while a 1-for-2 boost is spent, once the current selection
  // sums to exactly one die's face, highlight that die and dim the other -
  // it's the one being "ignored" per the boost's own rule (RULES.
  // isValidOneForTwoSelection). If the two dice show the same face, both
  // are the "used" die (there's no meaningful other one to dim - they're
  // visually identical anyway). Before any match, neither is marked -
  // "after selecting the number" per the request, not before.
  //
  // Issue #4 revision: on a double (both dice show the same face), still
  // mark exactly one die unused rather than marking both as used. Knowing
  // *that* a die is being ignored matters more than which physical one -
  // highlighting both as "used" reads as "both dice count," which is
  // exactly backwards for a boost whose whole point is that one doesn't.
  // Index 0 is arbitrarily, but consistently, the "used" one when equal.
  function oneForTwoDieClass(dice, index, selectedSum) {
    var matches = selectedSum === dice[0] || selectedSum === dice[1];
    if (!matches) return '';
    if (dice[0] === dice[1]) return index === 0 ? 'die-used' : 'die-unused';
    return selectedSum === dice[index] ? 'die-used' : 'die-unused';
  }

  // Issue #4: the 1/2-dice choice prompt (see the comment above
  // renderPlayDiceChoice, further down) used to be a separate element
  // above #play-dice-area, reserving its own extra space on top of the
  // dice area's - shrinking away the moment a roll happened and letting
  // the rack jump into the gap. It draws inside #play-dice-area now,
  // in the dice's own stead, sharing the one reserved box instead of
  // adding a second one.
  function diceChoicePromptShown(p) {
    return RULES.singleDieUnlocked(p.rack) && !lastTileIsOne(p) &&
      game.devDiceTestEnabled && game.devDiceChoice === 'ask' && !game.currentRoll;
  }

  function renderPlayDice() {
    var p = currentPlayer();
    if (diceChoicePromptShown(p)) {
      playDiceAreaEl.innerHTML =
        '<div id="play-dice-choice">' +
          '<button type="button" id="choice-one" class="' + (p.diceCount === 1 ? 'active' : '') + '">1 die</button>' +
          '<button type="button" id="choice-two" class="' + (p.diceCount === 2 ? 'active' : '') + '">2 dice</button>' +
        '</div>';
      document.getElementById('choice-one').addEventListener('click', function () { onChooseDice(1); });
      document.getElementById('choice-two').addEventListener('click', function () { onChooseDice(2); });
      return;
    }
    var rolled = !!game.currentRoll;
    var diceCount = rolled ? game.currentRoll.dice.length : effectiveDiceCount(p);
    var oneForTwo = rolled && diceCount === 2 && game.currentRoll.boostSpentType === 'oneForTwo';
    var sum = oneForTwo ? selectedSum() : null;
    var html = '';
    for (var i = 0; i < diceCount; i++) {
      var face = rolled ? game.currentRoll.dice[i] : 1;
      var extraClass = oneForTwo ? ' ' + oneForTwoDieClass(game.currentRoll.dice, i, sum) : '';
      html += '<span class="die' + extraClass + '"' + (rolled ? '' : ' style="visibility:hidden"') + '>' + dieFaceSVG(face) + '</span>';
    }
    var totalText = rolled ? 'Total: ' + game.currentRoll.total : 'Total: 0';
    html += '<div id="total"' + (rolled ? '' : ' style="visibility:hidden"') + '>' + totalText + '</div>';
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
    // visibility, not the `hidden` attribute: this must keep reserving its
    // box's layout space throughout the roll, or the board jumps as the
    // total line's height comes and goes (bug: real-device report).
    if (totalEl) totalEl.style.visibility = 'hidden';

    // innerHTML, not textContent, since each face is now a small SVG - the
    // .rolling wobble (a CSS transform on the .die box itself) and this
    // content swap never touch the same property, so they can't collide:
    // the box rotates while whatever's inside it gets replaced underneath.
    var elapsed = 0;
    diceAnimationIntervalId = setInterval(function () {
      elapsed += CONFIG.diceAnimationFrameMs;
      dieEls.forEach(function (el) {
        el.innerHTML = dieFaceSVG(1 + Math.floor(Math.random() * 6)); // cosmetic flash only
      });
      if (elapsed >= CONFIG.diceAnimationDurationMs) {
        clearInterval(diceAnimationIntervalId);
        diceAnimationIntervalId = null;
        dieEls.forEach(function (el, i) {
          el.classList.remove('rolling');
          el.innerHTML = dieFaceSVG(finalDice[i]); // settle on the predetermined result
        });
        if (totalEl) totalEl.style.visibility = '';
      }
    }, CONFIG.diceAnimationFrameMs);
  }

  function renderPlayMessage() {
    playMessageEl.className = '';
    if (game.currentRoll && game.currentRoll.stalled && !game.currentRoll.boostOfferPending) {
      playMessageEl.textContent = 'Stalled — no legal move for this roll.';
      playMessageEl.className = 'stalled';
    } else if (boostWholeRackBlocked()) {
      playMessageEl.textContent = 'A boost can never close the whole rack — leave a tile open, or decline and stay stalled.';
      playMessageEl.className = 'notice';
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
    if (!show) {
      // Issue #3: the text moved out of #play-boost-offer (now hidden with
      // the button row above) into the always-visible #play-message-area,
      // so it must be cleared explicitly here - it's no longer hidden for
      // free by an ancestor's `hidden` attribute.
      playBoostOfferTextEl.textContent = '';
      return;
    }
    if (game.currentRoll.offeredBoostType === 'oneForTwo') {
      // "a single N" (not "the tile numbered N") - a real playtest read this
      // as needing tile N specifically, which is often exactly the closed
      // tile that made the roll stall in the first place, and concluded
      // there was no escape. Spell out "any tiles" to head that off.
      playBoostOfferTextEl.textContent = 'Stalled — spend a 1-for-2 boost to play this roll as a single ' +
        oneForTwoTargetLabel(game.currentRoll.dice) + ' (any open tiles summing to it)?';
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
      // "any tiles summing to" - not "needs N", which reads as needing the
      // single tile numbered N (often exactly the closed tile that caused
      // the stall). See the boost-offer text above for the same fix.
      playSelectionSumEl.textContent = 'Selected: ' + selectedSum() + ' — any tiles summing to ' +
        oneForTwoTargetLabel(game.currentRoll.dice);
      return;
    }
    playSelectionSumEl.textContent = 'Selected: ' + selectedSum() + ' / ' + game.currentRoll.total;
  }

  // §3.3's per-turn choice, but only ever surfaced at all when dev dice-
  // testing is on and set to "?" (devDiceChoice === 'ask') - the production
  // default (test mode off) is silently one die, no prompt whatsoever, per
  // explicit request. When shown: defaults to whichever the player last
  // chose (or one die, per p.diceCount's default), pre-marked "active",
  // changeable with a single tap right up to Roll. Hidden at the last-
  // tile-is-1 safety case (nothing to choose - see effectiveDiceCount) and
  // whenever devDiceChoice is hard-forced to '1' or '2' (nothing to choose
  // there either). Issue #4: now rendered inside #play-dice-area itself -
  // see diceChoicePromptShown/renderPlayDice above - not a separate element
  // here any more.

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
    playAvatarImgEl.src = 'avatars/' + p.avatar;
    playAvatarImgEl.alt = p.name + '’s avatar';
    renderPlayBoostCount();
    renderPlayBoostAnnouncement();
    renderPlayRack();
    renderPlayDice();
    renderPlayMessage();
    renderPlaySelectionSum();
    renderPlayBoostOffer();
    renderPlayButtons();
    applyTheme();
  }

  playRollBtn.addEventListener('click', onRoll);
  playConfirmBtn.addEventListener('click', onConfirm);
  playPassBtn.addEventListener('click', onPass);
  playBoostSpendBtn.addEventListener('click', onBoostSpend);
  playBoostDeclineBtn.addEventListener('click', onBoostDecline);
  playAvatarBtn.addEventListener('click', function () { cycleAvatar(currentPlayer()); renderPlay(); });

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

  // After a completed game, a different player should start the next one
  // by default (real-device request) - move whoever went first to the back
  // of the roster, so roster[0] (startNewGame's turnIndex 0) is now the
  // player who went second last time. Scoped to the normal win flow only;
  // a time-challenge timeout has no winner and isn't "a completed round" in
  // this sense (see the deliberate no-ranking rule on #screen-timeout), so
  // that New game button leaves roster order untouched.
  function rotateRosterAfterGame() {
    if (roster.length < 2) return;
    roster.push(roster.shift());
    STORAGE.saveRoster(roster);
  }

  endNewGameBtn.addEventListener('click', function () {
    rotateRosterAfterGame();
    game = null;
    renderSetup();
    showScreen('setup');
  });

  // Rematch (M11, D-51): no confirm needed here - the match is already
  // over, nothing live to lose. Unlike New Game, does not rotate the
  // roster (D-50's rotation is specifically tied to New Game's "go back to
  // Setup" flow) - same seats, same order, straight back into play.
  endRematchBtn.addEventListener('click', restartMatch);

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
    // Issue #3: just the counter, no "Time challenge"/"(paused)" label -
    // the turn card's strikethrough (.corner-timer, CSS) is what signals
    // "paused" now, not text.
    var label = formatChallengeTime(game.timeChallenge.remainingMs);
    turncardTimerEl.textContent = label;
    playTimerEl.textContent = label;
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

  // Rematch (M11, D-51): same reasoning as the End screen's - no confirm,
  // no roster rotation (a timeout isn't a completed round either way).
  timeoutRematchBtn.addEventListener('click', restartMatch);

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
