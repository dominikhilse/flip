// Motion thresholds measured in the M0 sensor spike. Do not hand-tune these
// by feel in game code - if they turn out insufficient, re-measure using the
// harness (app/harness.html) and update this file. See ../FINDINGS.md for
// the full measurement record and acceptance-criteria results.
//
// Device: iPhone 15, iOS 26.5. Measured: 2026-09-09, on the real GitHub
// Pages play origin (https://dominikhilse.github.io/flip/app/).
//
// restToFlipDelayMs (D-31): M4 hand-testing found the original 300ms value
// too slow - a child could tap the screen before the view flipped. Flagged
// for retune with the harness's "Rest-to-flip delay" slider per the updated
// M0 acceptance criterion 8 (must beat a fast tap while staying bump-safe).
// Kept at the last measured value until re-measured; do not guess a new
// number here.
window.CONFIG = {
  flatAngleThresholdDegrees: 7,
  stillMagnitudeThreshold: 0.3, // m/s^2
  restToFlipDelayMs: 300 // PENDING RETUNE - see comment above
};
