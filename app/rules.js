// Pure Shut the Box rules engine. No DOM, no state beyond what is passed in.
(function () {
  'use strict';

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

  function createRack(size) {
    var tiles = [];
    for (var v = 1; v <= size; v++) tiles.push({ value: v, open: true });
    return tiles;
  }

  function openValues(rack) {
    return rack.filter(function (t) { return t.open; }).map(function (t) { return t.value; });
  }

  function singleDieUnlocked(rack) {
    return rack.filter(function (t) { return t.open; }).every(function (t) { return t.value <= 6; });
  }

  function isRackShut(rack) {
    return rack.every(function (t) { return !t.open; });
  }

  // Whether a selection of open-tile values is a legal move under the given
  // overpay mode (§3.5). openValues are the player's open tiles BEFORE this
  // move, used only to detect a selection that would shut the whole rack.
  function isValidSelection(openValues, selectedValues, total, overpayMode) {
    if (selectedValues.length === 0) return false;
    var selectedSum = sum(selectedValues);
    if (overpayMode !== 'D') return selectedSum === total;
    // D: any subset summing to <= total is legal, except a selection that
    // shuts the whole rack (selects every currently open tile), which must
    // still be paid exactly (mandatory exception established in testing -
    // overpay may not finish the game, or the endgame loses all tension).
    // This is a property of the MOVE, not of the rack size: closing the
    // last two tiles at once via a big overpaid roll is exactly as
    // tension-free as closing a literal last single tile would be.
    if (selectedValues.length === openValues.length) return selectedSum === total;
    return selectedSum <= total;
  }

  // Whether any legal move exists for this roll, under the given overpay
  // mode - drives stall detection.
  function anyLegalMoveExists(openValues, total, overpayMode) {
    if (overpayMode !== 'D') return subsetSumExists(openValues, total);
    if (openValues.length === 0) return true;
    if (openValues.length === 1) return openValues[0] === total;
    // With more than one tile open, a single open tile is the smallest
    // possible non-empty selection; if even that clears <= total, a legal
    // (non-rack-closing) move exists.
    return openValues.some(function (v) { return v <= total; });
  }

  window.RULES = {
    rollDice: rollDice,
    sum: sum,
    subsetSumExists: subsetSumExists,
    createRack: createRack,
    openValues: openValues,
    singleDieUnlocked: singleDieUnlocked,
    isRackShut: isRackShut,
    isValidSelection: isValidSelection,
    anyLegalMoveExists: anyLegalMoveExists
  };
})();
