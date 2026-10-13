// Motion thresholds measured in the M0 sensor spike. Do not hand-tune these
// by feel in game code - if they turn out insufficient, re-measure using the
// harness (app/harness.html) and update this file. See ../docs/FINDINGS.md for
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
  restToFlipDelayMs: 300, // PENDING RETUNE - see comment above

  // M22/D-65: the one switch that decides whether the Dev tab renders at
  // all. Source-level, not a user setting - no runtime reveal gesture, no
  // build step to strip the Dev code either; flip this and redeploy to get
  // it back. Default for the shipped product is false. Hiding it also
  // forces every Dev-controlled setting to its production default (see
  // app.js, right after `settings` loads) - a hidden Dev tab can never
  // leave the game stuck in an experimental state with no visible control
  // to undo it.
  // TEMP (D-72): re-enabled for the avatar-long-press retune below - flip
  // back to false once that value is measured and locked, same re-hide
  // step this comment already describes.
  showDevTab: true,

  // D-72: kids are having real difficulty triggering the avatar tap-and-
  // hold gesture (M20) at the current 500ms. Live-tunable via the Dev tab
  // (same "type a number to test, no Set button" pattern as
  // diceAnimationDurationMs below) so shorter values (try 300-350ms) can
  // be tested with real small fingers on a real device. Two-sided bound
  // once measured, same as restToFlipDelayMs/diceAnimationDurationMs:
  // short enough that kids can trigger it, long enough that an ordinary
  // tap doesn't accidentally open the grid. PENDING RETUNE - do not guess
  // a new number here; re-measure on-device and update this file, then
  // flip showDevTab back to false.
  avatarLongPressMs: 500,

  // Boost mode (§3.6, M6). boostDryStreakWindow/Threshold are the starting
  // values from the spec, explicitly flagged there as tunable after real
  // play - change in place if the feel is off, no need to re-derive them.
  // boostMaxHeld is a locked decision (D-20), not a tuning knob.
  boostDryStreakWindow: 5,
  boostDryStreakThreshold: 3, // fewer than this many clean rolls in the window awards a boost
  boostMaxHeld: 3, // total across BOTH types (M7, §3.6b) - not 3 of each

  // Two-type reward model (§3.6b, M7). Both types currently share the same
  // award criteria (dry streak + trailing-at-finish), so every award rolls
  // a type: Math.random() < this value grants overpay, otherwise 1-for-2.
  // Starting value per spec (50/50); tune after playtest, e.g. weight
  // toward 1-for-2 to keep overpay scarce.
  boostTypeDistribution: 0.5,

  // Dice roll animation (M10, D-47). Purely cosmetic - the actual roll
  // result is decided by RULES.rollDice() before the animation ever runs
  // (see onRoll/animateDiceRoll); these two values only control how long
  // and how fast the face-cycle flashes before settling.
  // diceAnimationDurationMs is LOCKED (M22/D-66): both 400 and 600 tested
  // good, 500 is the chosen midpoint. The Dev tab's live-tunable control
  // still exists behind showDevTab for re-tuning if the animation itself
  // ever changes - re-test there and update this constant, don't guess.
  diceAnimationDurationMs: 500,
  diceAnimationFrameMs: 60,

  // Avatars (M13, D-55). Files live at app/avatars/01.png..NN.png - this is
  // the one place the actual count is recorded, since a static site can't
  // list its own directory at runtime. D-55 originally locked 20; the set
  // has since grown (see app/avatars/README.md and DECISIONS.md) - update
  // this whenever a file is added or removed, nothing else needs to change.
  avatarCount: 36,

  // Winner confetti (M26/D-74). Purely cosmetic "tune by feel" values, same
  // category as diceAnimationDurationMs above - live-tunable via the Dev
  // tab (see fireConfetti in app.js, which reads these fresh on every
  // fire, nothing cached). confettiParticleCount is the TOTAL spawned
  // (split ~60/40 burst/rain, same ratio as the original 36/24 split);
  // hard-capped at 150 regardless of what's typed into the Dev input
  // (M26's own spec calls for "phone-sane", not hundreds). confettiSpeed
  // Min/MaxPxPerSec is the per-particle velocity range (px/s) each piece's
  // own travel distance is divided by to get its animation duration - a
  // real speed, not a fixed duration, so a piece that travels further
  // takes proportionally longer rather than visually "teleporting" faster.
  // PENDING RETUNE: first real-device test (2026-10-13) found the
  // original fixed-1100-1700ms-duration version "way too fast" - these
  // starting values are a deliberately slower guess, not a measured
  // result; re-test on-device via the Dev tab and update here once a good
  // feel is found, same as every other Dev-tunable constant in this file.
  confettiParticleCount: 40,
  confettiParticleCountMax: 200,
  confettiSpeedMinPxPerSec: 60,
  confettiSpeedMaxPxPerSec: 120
};
