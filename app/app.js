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
  var rackSizeToggleEl = document.getElementById('rack-size-toggle');
  var placementModeEl = document.getElementById('placement-mode');
  var startGameBtn = document.getElementById('start-game');

  var turncardNameEl = document.getElementById('turncard-name');
  var turncardScreenEl = screens.turncard;
  var settingsFromTurncardBtn = document.getElementById('settings-from-turncard');

  var playPlayerNameEl = document.getElementById('play-player-name');
  var playMessageEl = document.getElementById('play-message');
  var playSelectionSumEl = document.getElementById('play-selection-sum');
  var playRackEl = document.getElementById('play-rack');
  var playDiceChoiceEl = document.getElementById('play-dice-choice');
  var playDiceAreaEl = document.getElementById('play-dice-area');
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

  // ---- Setup screen ----

  function makePlayerId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function renderRosterList() {
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

  function renderSettingsControls() {
    var toggleBtns = rackSizeToggleEl.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(function (btn) {
      var size = parseInt(btn.getAttribute('data-rack-size'), 10);
      btn.classList.toggle('active', settings.rackSize === size);
    });
    placementModeEl.value = settings.placementMode;
  }

  function renderStartButton() {
    startGameBtn.disabled = roster.length < 2;
  }

  function renderSetup() {
    renderRosterList();
    renderColorSwatches();
    renderSettingsControls();
    renderStartButton();
  }

  addPlayerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = playerNameInput.value.trim();
    if (!name) return;
    roster.push({ id: makePlayerId(), name: name, color: selectedColor });
    STORAGE.saveRoster(roster);
    playerNameInput.value = '';
    selectedColor = null;
    renderSetup();
  });

  rackSizeToggleEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    settings.rackSize = parseInt(btn.getAttribute('data-rack-size'), 10);
    STORAGE.saveSettings(settings);
    renderSettingsControls();
  });

  placementModeEl.addEventListener('change', function () {
    settings.placementMode = placementModeEl.value;
    STORAGE.saveSettings(settings);
  });

  startGameBtn.addEventListener('click', function () {
    if (roster.length < 2) return;
    startNewGame();
  });

  // ---- Game orchestration ----

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
        diceCountChosenByPlayer: false
      };
    });
    game = {
      players: players,
      turnIndex: 0,
      placementMode: settings.placementMode,
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

  turncardScreenEl.addEventListener('click', function (e) {
    if (e.target === settingsFromTurncardBtn) return;
    goToRack();
  });

  // While on the rack mid-turn, picking the phone up shows the turn card
  // (without resetting any state) instead of advancing a turn; setting it
  // back down flat returns to the same rack via the same goToRack() path
  // used for a genuine handoff. Motion only ever acts while a game screen
  // (turn card or rack) is showing - on setup/launch/end screens it is a
  // no-op, so it never interferes outside of active play.
  function onFlatChange(isFlat) {
    if (isFlat) {
      if (activeScreen === 'turncard') goToRack();
    } else {
      if (activeScreen === 'play') showTurnCardFor(currentPlayer());
    }
  }

  settingsFromTurncardBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var proceed = window.confirm('Leave the current game and edit settings? This ends the game in progress.');
    if (!proceed) return;
    game = null;
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

  function onRoll() {
    var p = currentPlayer();
    var unlocked = RULES.singleDieUnlocked(p.rack);
    var countToUse = unlocked ? p.diceCount : 2;
    var dice = RULES.rollDice(countToUse);
    var total = RULES.sum(dice);
    var stalled = !RULES.subsetSumExists(RULES.openValues(p.rack), total);
    game.currentRoll = { dice: dice, total: total, stalled: stalled };
    game.selected = new Set();
    renderPlay();
  }

  function onChooseDice(count) {
    var p = currentPlayer();
    p.diceCount = count;
    p.diceCountChosenByPlayer = true;
    renderPlay();
  }

  function onConfirm() {
    var p = currentPlayer();
    if (!game.currentRoll || game.currentRoll.stalled) return;
    if (selectedSum() !== game.currentRoll.total || game.selected.size === 0) return;

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
    } else if (RULES.singleDieUnlocked(p.rack) && !p.diceCountChosenByPlayer) {
      p.diceCount = 1;
    }

    proceedAfterTurn();
  }

  function onPass() {
    game.currentRoll = null;
    game.selected = new Set();
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
    if (game.currentRoll && game.currentRoll.stalled) {
      playMessageEl.textContent = 'Stalled — no legal move for this roll.';
      playMessageEl.className = 'stalled';
    } else {
      playMessageEl.textContent = '';
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
    var stalled = !!(game.currentRoll && game.currentRoll.stalled);
    playRollBtn.hidden = stalled;
    playPassBtn.hidden = !stalled;
    playConfirmBtn.hidden = stalled;

    playRollBtn.disabled = game.currentRoll !== null;
    playConfirmBtn.disabled = !game.currentRoll || game.currentRoll.stalled ||
      selectedSum() !== game.currentRoll.total || game.selected.size === 0;
  }

  function renderPlay() {
    var p = currentPlayer();
    playPlayerNameEl.textContent = p.name;
    playPlayerNameEl.style.color = p.color;
    renderPlayRack();
    renderPlayDice();
    renderPlayMessage();
    renderPlaySelectionSum();
    renderPlayDiceChoice();
    renderPlayButtons();
  }

  playRollBtn.addEventListener('click', onRoll);
  playConfirmBtn.addEventListener('click', onConfirm);
  playPassBtn.addEventListener('click', onPass);

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
  }

  endNewGameBtn.addEventListener('click', function () {
    game = null;
    renderSetup();
    showScreen('setup');
  });

  // ---- Launch screen (motion permission gate) ----

  screens.launch.addEventListener('click', function () {
    MOTION.requestPermission().then(function (granted) {
      if (granted) {
        MOTION.startListening(onFlatChange);
      }
      // Attempted regardless of motion permission - orientation lock is a
      // separate API. Expected to silently no-op on iOS Safari outside an
      // installed PWA; see motion.js.
      MOTION.lockLandscape();
      renderSetup();
      showScreen('setup');
    });
  });

  // ---- Boot ----
  showScreen('launch');
})();
