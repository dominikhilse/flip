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

  window.RULES = {
    rollDice: rollDice,
    sum: sum,
    subsetSumExists: subsetSumExists,
    createRack: createRack,
    openValues: openValues,
    singleDieUnlocked: singleDieUnlocked,
    isRackShut: isRackShut
  };
})();
