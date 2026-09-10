// Motion sensing only. No knowledge of screens or game state - reports
// permission outcome and debounced flat/not-flat transitions to a callback.
// Same flat-detection algorithm as the M0 harness (app/harness.html), now
// driven by the measured constants in config.js instead of live sliders.
//
// No orientation lock (D-08 superseded by D-26): M4 hand-testing found
// portrait plays fine and the shove/lift handoff never depended on reading
// orientation while flat, so the earlier defensive screen.orientation.lock()
// call was removed rather than kept as unreachable code.
(function () {
  'use strict';

  function requestPermission() {
    var needsMotion = typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function';
    var needsOrientation = typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function';

    if (!needsMotion && !needsOrientation) {
      // No permission gate on this platform (Android, desktop). Motion may
      // still be genuinely unavailable - that's fine, startListening simply
      // won't see any events and the game stays fully tap-driven.
      return Promise.resolve(typeof DeviceMotionEvent !== 'undefined');
    }

    var motionPromise = needsMotion ? DeviceMotionEvent.requestPermission() : Promise.resolve('granted');
    var orientationPromise = needsOrientation ? DeviceOrientationEvent.requestPermission() : Promise.resolve('granted');

    return Promise.all([motionPromise, orientationPromise])
      .then(function (results) {
        return results[0] === 'granted' && results[1] === 'granted';
      })
      .catch(function () {
        return false;
      });
  }

  // Calls onFlatChange(true|false) on debounced flat/not-flat transitions.
  // onSample, if given, fires on every raw devicemotion event regardless of
  // debounce state - a liveness heartbeat so callers can tell "motion is
  // enabled but genuinely not delivering events" from "nothing has changed
  // in a while" (see the tap-to-proceed invariant, §3.9).
  function startListening(onFlatChange, onSample) {
    var lastGravity = null;
    var candidateFlat = null;
    var stableSince = null;
    var currentFlat = null;

    function onMotion(event) {
      var g = event.accelerationIncludingGravity;
      if (!g || g.x === null) return;
      if (onSample) onSample();

      var magnitude = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z);
      var angleFromFlat = magnitude > 0
        ? Math.acos(Math.min(1, Math.abs(g.z) / magnitude)) * (180 / Math.PI)
        : 90;

      var motionMagnitude;
      var a = event.acceleration;
      if (a && a.x !== null) {
        motionMagnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      } else if (lastGravity) {
        motionMagnitude = Math.sqrt(
          Math.pow(g.x - lastGravity.x, 2) +
          Math.pow(g.y - lastGravity.y, 2) +
          Math.pow(g.z - lastGravity.z, 2)
        );
      } else {
        motionMagnitude = 0;
      }
      lastGravity = g;

      var meetsFlat = angleFromFlat <= window.CONFIG.flatAngleThresholdDegrees &&
        motionMagnitude <= window.CONFIG.stillMagnitudeThreshold;
      var now = performance.now();

      if (meetsFlat !== candidateFlat) {
        candidateFlat = meetsFlat;
        stableSince = now;
      }

      if (candidateFlat !== null && (now - stableSince) >= window.CONFIG.restToFlipDelayMs) {
        if (currentFlat !== candidateFlat) {
          currentFlat = candidateFlat;
          onFlatChange(currentFlat);
        }
      }
    }

    window.addEventListener('devicemotion', onMotion);
  }

  window.MOTION = {
    requestPermission: requestPermission,
    startListening: startListening
  };
})();
