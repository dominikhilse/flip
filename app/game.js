(function () {
  'use strict';

  var RACK_SIZE = 9;

  var rack = [];
  var diceCount = 2;
  var diceCountChosenByPlayer = false;
  var lastRoll = null; // { dice: [..], total, stalled }
  var selected = new Set();
  var won = false;

  var rackEl = document.getElementById('rack');
  var diceAreaEl = document.getElementById('dice-area');
  var messageEl = document.getElementById('message');
  var selectionSumEl = document.getElementById('selection-sum');
  var diceChoiceEl = document.getElementById('dice-choice');
  var choiceOneEl = document.getElementById('choice-one');
  var choiceTwoEl = document.getElementById('choice-two');
  var rollBtn = document.getElementById('roll');
  var confirmBtn = document.getElementById('confirm');
  var newGameBtn = document.getElementById('new-game');

  function randomDie() {
    return 1 + Math.floor(Math.random() * 6);
  }

  function rollDice(count) {
    var dice = [];
    for (var i = 0; i < count; i++) dice.push(randomDie());
    return dice;
  }

  function sum(values) {
    return values.reduce(function (a, b) { return a + b; }, 0);
  }

  // Whether any subset of openValues sums exactly to target.
  function subsetSumExists(openValues, target) {
    if (target === 0) return true;
    if (openValues.length === 0) return false;
    var reachable = new Set([0]);
    for (var i = 0; i < openValues.length; i++) {
      var v = openValues[i];
      var next = new Set(reachable);
      reachable.forEach(function (r) {
        var candidate = r + v;
        if (candidate <= target) next.add(candidate);
      });
      reachable = next;
    }
    return reachable.has(target);
  }

  function openTiles() {
    return rack.filter(function (t) { return t.open; });
  }

  function singleDieUnlocked() {
    return openTiles().every(function (t) { return t.value <= 6; });
  }

  function newGame() {
    rack = [];
    for (var v = 1; v <= RACK_SIZE; v++) rack.push({ value: v, open: true });
    diceCount = 2;
    diceCountChosenByPlayer = false;
    lastRoll = null;
    selected = new Set();
    won = false;
    render();
  }

  function selectedSum() {
    var total = 0;
    selected.forEach(function (v) { total += v; });
    return total;
  }

  function onTileClick(tile) {
    if (won || !lastRoll || lastRoll.stalled) return;
    if (!tile.open) return;
    if (selected.has(tile.value)) {
      selected.delete(tile.value);
    } else {
      selected.add(tile.value);
    }
    render();
  }

  function onRoll() {
    var unlocked = singleDieUnlocked();
    var countToUse = unlocked ? diceCount : 2;
    var dice = rollDice(countToUse);
    var total = sum(dice);
    var openValues = openTiles().map(function (t) { return t.value; });
    var stalled = !subsetSumExists(openValues, total);
    lastRoll = { dice: dice, total: total, stalled: stalled };
    selected = new Set();
    render();
  }

  function onConfirm() {
    if (!lastRoll || lastRoll.stalled || won) return;
    if (selectedSum() !== lastRoll.total || selected.size === 0) return;
    selected.forEach(function (v) {
      var tile = rack.find(function (t) { return t.value === v; });
      if (tile) tile.open = false;
    });
    selected = new Set();
    lastRoll = null;
    if (openTiles().length === 0) {
      won = true;
    } else if (singleDieUnlocked() && !diceCountChosenByPlayer) {
      diceCount = 1;
    }
    render();
  }

  function onChooseDice(count) {
    diceCount = count;
    diceCountChosenByPlayer = true;
    render();
  }

  function renderRack() {
    rackEl.innerHTML = '';
    rack.forEach(function (tile) {
      var btn = document.createElement('button');
      btn.className = 'tile' + (selected.has(tile.value) ? ' selected' : '');
      btn.textContent = tile.value;
      btn.disabled = !tile.open || won || !lastRoll || lastRoll.stalled;
      if (tile.open) {
        btn.style.background = window.THEME.tileColors[tile.value];
        btn.style.color = window.THEME.tileTextColor;
      } else {
        btn.style.background = window.THEME.closedTileColor;
        btn.style.color = window.THEME.closedTileTextColor;
      }
      btn.addEventListener('click', function () { onTileClick(tile); });
      rackEl.appendChild(btn);
    });
  }

  function renderDice() {
    if (!lastRoll) {
      diceAreaEl.innerHTML = '';
      return;
    }
    var html = lastRoll.dice.map(function (d) {
      return '<span class="die">' + d + '</span>';
    }).join('');
    html += '<div id="total">Total: ' + lastRoll.total + '</div>';
    diceAreaEl.innerHTML = html;
  }

  function renderMessage() {
    messageEl.className = '';
    if (won) {
      messageEl.textContent = 'Box shut!';
      messageEl.className = 'win';
    } else if (lastRoll && lastRoll.stalled) {
      messageEl.textContent = 'Stalled — no legal move for this roll.';
      messageEl.className = 'stalled';
    } else {
      messageEl.textContent = '';
    }
  }

  function renderSelectionSum() {
    if (!lastRoll || lastRoll.stalled || won) {
      selectionSumEl.textContent = '';
      return;
    }
    selectionSumEl.textContent = 'Selected: ' + selectedSum() + ' / ' + lastRoll.total;
  }

  function renderDiceChoice() {
    var unlocked = singleDieUnlocked();
    var show = unlocked && !won && !lastRoll;
    diceChoiceEl.classList.toggle('visible', show);
    choiceOneEl.classList.toggle('active', diceCount === 1);
    choiceTwoEl.classList.toggle('active', diceCount === 2);
  }

  function renderButtons() {
    rollBtn.disabled = won || (lastRoll !== null && !lastRoll.stalled);
    rollBtn.textContent = (lastRoll && lastRoll.stalled) ? 'Roll again' : 'Roll';
    confirmBtn.disabled = won || !lastRoll || lastRoll.stalled || selectedSum() !== lastRoll.total || selected.size === 0;
  }

  function render() {
    renderRack();
    renderDice();
    renderMessage();
    renderSelectionSum();
    renderDiceChoice();
    renderButtons();
  }

  rollBtn.addEventListener('click', onRoll);
  confirmBtn.addEventListener('click', onConfirm);
  choiceOneEl.addEventListener('click', function () { onChooseDice(1); });
  choiceTwoEl.addEventListener('click', function () { onChooseDice(2); });
  newGameBtn.addEventListener('click', newGame);

  newGame();
})();
