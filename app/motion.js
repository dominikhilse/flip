// Motion sensing only. No knowledge of screens or game state - reports
// permission outcome and debounced flat/not-flat transitions to a callback.
// Same flat-detection algorithm as the M0 harness (app/harness.html), now
// driven by the measured constants in config.js instead of live sliders.
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
  function startListening(onFlatChange) {
    var lastGravity = null;
    var candidateFlat = null;
    var stableSince = null;
    var currentFlat = null;

    function onMotion(event) {
      var g = event.accelerationIncludingGravity;
      if (!g || g.x === null) return;

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

      if (candidateFlat !== null && (now - stableSince) >= window.CONFIG.debounceMs) {
        if (currentFlat !== candidateFlat) {
          currentFlat = candidateFlat;
          onFlatChange(currentFlat);
        }
      }
    }

    window.addEventListener('devicemotion', onMotion);
  }

  // Best-effort only: iOS Safari does not support the Screen Orientation
  // Lock API outside an installed, fullscreen PWA. Failure here is silent
  // and expected on the target devices - the game is still fully playable,
  // just without an OS-enforced lock.
  function lockLandscape() {
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        screen.orientation.lock('landscape').catch(function () {});
      }
    } catch (e) {
      // Ignore - see comment above.
    }
  }

  window.MOTION = {
    requestPermission: requestPermission,
    startListening: startListening,
    lockLandscape: lockLandscape
  };
})();
