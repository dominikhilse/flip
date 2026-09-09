// Motion thresholds measured in the M0 sensor spike. Do not hand-tune these
// by feel in game code - if they turn out insufficient, re-measure using the
// harness (app/harness.html) and update this file. See ../FINDINGS.md for
// the full measurement record and acceptance-criteria results.
//
// Device: iPhone 15, iOS 26.5. Measured: 2026-09-09, on the real GitHub
// Pages play origin (https://dominikhilse.github.io/flip/app/).
window.CONFIG = {
  flatAngleThresholdDegrees: 7,
  stillMagnitudeThreshold: 0.3, // m/s^2
  debounceMs: 300
};
