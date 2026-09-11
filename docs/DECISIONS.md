# DECISIONS.md — Flip the Number

Append-only log. Date, decision, alternatives rejected, reason. Exists to keep the Code
session and the orchestrator/design session in sync when they work in parallel — the
milestone plan's own decision log (§8, D-01…D-39) is the locked, canonical record, but it
only gets updated when someone deliberately revises the plan document. This file is where a
Code session records a finding or a live-playtest decision **the moment it happens**, so the
orchestrator can fold it into the next plan revision instead of the two drifting out of sync
for a stretch, as happened between the M6 boost/theme playtest fixes and the plan's last
revision pass.

Entries here are never edited after the fact — a later change supersedes an earlier entry by
saying so explicitly in a new dated entry, the same convention `FlipTheNumber_MilestonePlan.md`
§8 already uses for its own D-## rows.

---

## Locked decisions

See `FlipTheNumber_MilestonePlan.md` §8 (D-01…D-39) — the canonical decision log. Not
duplicated here.

---

## Dated decisions

### 2026-09-11 — Dice-count settings toggle contradicts §3.3; hidden pending an orchestrator ruling
- **Finding:** mid-session playtesting (before this plan revision landed) asked for the
  single-die-endgame's per-turn 1-or-2 choice to stop being re-asked every turn. Built as a
  whole-game setting — undecided by default, decided once by whichever player first reaches
  the unlocked state, exposed as a `1 / 2 / ?` toggle on the Settings screen (`?` resets it
  back to undecided). This is now known to directly contradict §3.3: "This rule is mandatory,
  not optional, and **must not be made a settings toggle**."
- **Decision:** keep the underlying flow fully live — it's a real improvement over asking
  every turn, and the safety guarantee §3.3 actually cares about (closing tile `1` alone
  always forces 1 die, no matter the setting) is preserved unconditionally regardless of this
  change. But **hide the Settings-screen toggle itself** (`app/index.html`, wrapped in a
  `hidden` container, code left in place and commented rather than deleted) so the live
  product no longer visibly contains the thing §3.3 locks against, while the mechanism stays
  intact and easy to restore.
- **Alternatives rejected:** (a) delete the toggle code entirely — rejected, throws away
  tested work for a decision that isn't final yet. (b) leave it live and visible — rejected,
  a locked rule is currently being visibly violated in the shipped product.
- **Open, for the orchestrator:** confirmed in conversation that this whole area is headed
  toward a further restructure — a hidden "dev mode" tab in Settings where exploratory/testable
  features (this one included) live separately from the clean, final-product settings surface.
  That restructure is explicitly **not** decided here; §3.3 itself hasn't been revised yet
  either. This entry exists so the orchestrator has the full context before ruling on: revise
  §3.3 to describe the once-per-game model, revert to the original per-turn/default-1 design,
  or land it in the future dev-mode tab.
- **Reconciled into §8 as D-42 (2026-09-11 orchestrator pass) — resolved differently than
  shipped, follow-up needed.** The ruling landed on a third option: §3.3 stays unchanged
  (default one die, no production toggle at all — the once-per-game decide model is explicitly
  **not adopted**), and a much simpler dev-mode-only "force two dice" override is specified
  instead (M8). The currently-shipped hidden toggle + once-per-game-decide mechanism
  (`app/index.html`'s hidden `dice-count-toggle`, `diceChoicePending`/`onChooseDice` in
  `app/app.js`) does not match this and needs replacing when M8 is built — noted, not yet
  actioned, since M8 hasn't been started.

### 2026-09-11 — §3.6 "announced at the moment it is granted" still holds under a redefined timeline
- **Finding:** playtesting surfaced a real confusion — a dry-streak boost awarded at the
  instant the condition fires (the end of the earning player's own turn) left them told
  "boost earned" with no way to spend it until their next turn anyway.
- **Decision (per the orchestrator, this session):** resolve by redefining the two terms
  rather than by contradicting §3.6. **Earned** = the moment the award condition fires (dry
  streak / trailing-at-finish, per D-24). **Granted** = the moment the credit is actually
  delivered into the player's spendable inventory — which is now, deliberately, the start of
  the earning player's *next* turn, the first moment it can actually be used. §3.6's rule
  ("announced on screen at the moment it is granted") describes the **granted** moment under
  this definition, so it still holds — the code's existing behavior (bank a credit at the
  earned moment, deliver + announce it at the start of that player's next turn, capped at
  `boostMaxHeld`, silently dropped if the game has left boost mode before delivery) needs no
  change. Recorded here so the plan's §3.6 wording can absorb the earned/granted distinction
  on its next revision pass.
- **Reconciled into §8 as D-44 (2026-09-11 orchestrator pass).** No follow-up needed — shipped
  behavior matches.

### 2026-09-11 — D-34's theme-flip predicate needs a last-tile carve-out
- **Finding:** D-34 / §3.11 state the sustained-inversion predicate as "D active" full stop.
  Live testing found this made the theme flip on even while the current player is down to
  their last tile — where overpay cannot actually apply (§3.5's last-tile-exact exception) —
  which is a false "you can overpay right now" signal.
- **Decision:** the D-mode sustained inversion now also requires the current player to have
  more than one tile open; it momentarily drops for exactly the turns where they're down to
  one tile, and returns once they have more than one open again. Built and shipped (commit
  `077dc7d`) before this finding could be folded into the plan revision that produced D-34 —
  hence the drift. D-34's predicate should be revised to state this carve-out explicitly:
  "D active AND the current player has more than one tile open" OR a boost overpay move in
  progress.
- **Reconciled into §8 as revised D-34 (2026-09-11 orchestrator pass).** No follow-up needed —
  shipped behavior matches; the predicate is now framed cleanly as "inverted exactly when an
  overpay move is currently legal," which makes the carve-out fall out automatically.

### 2026-09-11 — "Final remaining tile" (§3.5/§3.6) generalized to "closing the whole rack"
- **Finding:** §3.5 and §3.6 both say overpay/boost may not close "the final remaining tile,"
  worded in the singular. Playtesting found this left a real exploit: with two or more tiles
  open, a big enough overpaid roll could select and close *all* of them in one move — the
  same tension-loss the singular rule exists to prevent, just missed because the check only
  ever fired at rack size 1.
- **Decision:** generalized `isValidSelection` (`app/rules.js`) so the exact-match requirement
  applies to any selection that covers every currently open tile, however many that is — not
  only when there was literally one tile to begin with. A strict subset (leaving at least one
  tile open) keeps the normal overpay ≤ total rule; an exact whole-rack sum still legitimately
  finishes the game. Shipped in commit `f262a7d`, including a UI message ("Closing the whole
  rack needs an exact match — exclude a tile to overpay instead.") when a player's current
  selection hits this case. §3.5/§3.6's wording should be updated from "the final remaining
  tile" to "a selection that would shut the whole rack" to match.
- **Reconciled into §8 as D-45 (and D-18 updated to match) (2026-09-11 orchestrator pass).** No
  follow-up needed — shipped behavior matches.

### 2026-09-11 — M4 (continuous-rotation handoff) cut for real
- **Finding, from the status check earlier this session:** M4 was a cuttable spike per its
  own plan text, and M0's orientation-during-lift finding (readable during a lift —
  `docs/FINDINGS.md` criterion 6) kept it technically viable, but the actual feature (skip the
  turn card on a detected 180° rotate-and-set-down) was never attempted, and its three
  acceptance criteria were never run on-device. It sat in an undecided middle state: not
  built, not explicitly cut either.
- **Decision (Dominik, this session):** cut it for real, not just leave it unresolved. The
  game feel with M3's tap/motion turn-card handoff, as shipped, is fine in real play — there
  is no open problem M4 would be solving. Written into the plan as D-40; §5's M4 section now
  reads **CUT**, with the original goal/scope/acceptance criteria kept in a collapsed
  `<details>` block for the historical record only. Do not revisit without a new decision to
  do so.
- **Reconciled into §8 as D-40 (2026-09-11 orchestrator pass).** No follow-up needed — matches.

### 2026-09-11 — M6 closed at single-type scope; two-type boost split into new milestone M7
- **Supersedes the framing of the entry below, not its content.** Dominik confirmed the
  two-type boost expansion will come as its own milestone, and asked whether M6 could then be
  considered closed. Yes: nothing currently shipped needs the second boost type to be correct
  or complete on its own terms, and the four reconciliation entries above (dice toggle,
  award-timing redefinition, D-34's carve-out, the whole-rack overpay generalization) are all
  either resolved or explicitly deferred, not blockers.
- **Decision:** `FlipTheNumber_MilestonePlan.md` §5's M6 section now reads **CLOSED at
  single-type scope**, with a new summary of exactly what shipped, and the original
  two-type-flavoured goal/scope/acceptance-criteria text preserved in a collapsed `<details>`
  block for the record. A new **M7 — Two-type boost system** section carries the
  two-type-specific scope and acceptance criteria (D-35–D-38) forward, explicitly marked not
  started. Logged as D-41.
- **Still true, restated under the new milestone number:** M7 is not to be started without the
  orchestrator's design pass finishing first — see the entry immediately below, which now
  describes M7 rather than an unscoped "the two-type system."
- **Reconciled into §8 as D-41 (2026-09-11 orchestrator pass).** No follow-up needed — matches,
  and M7 now carries a full spec (scope + acceptance criteria) rather than just a placeholder.

### 2026-09-11 — The two-type boost system (D-35–D-38) is not being built yet
- **Status, per the orchestrator:** confirmed explicitly — do **not** start building the
  1-for-2 boost type, the typed `{overpay, oneForTwo}` inventory, the auto-select spend logic,
  or the per-type reward-model split yet, even though D-35–D-38 and the M6 acceptance criteria
  now specify them in full. That design is still to be finished, defined, and prepped by the
  orchestrator before it comes back to a Code session to build. What's currently live is the
  original single-type overpay boost (`boosts: { overpay: n }`) from before this plan
  revision — functioning correctly against its own (superseded) spec, but behind the
  currently-written one. Recorded here so no future Code session mistakes the gap for an
  oversight and starts building it unprompted.
- **Reconciled into §8 as D-35–D-38 (2026-09-11 orchestrator pass), and the "don't build yet"
  hold is now lifted.** The plan revision gave M7 a full spec (scope + 9 acceptance criteria,
  §3.6b) rather than the placeholder it had before, and Dominik confirmed moving on to M7.
  Superseded by the entry below.

### 2026-09-11 — M7 go-ahead; M8 (dev-mode tab) and M9 (time challenge) added to the plan
- **Status:** the orchestrator's revision pass landed with M7 fully specified (§3.6b, scope,
  9 acceptance criteria, stop conditions — D-35–D-38), plus two new milestones not previously
  in the plan: **M8** (a dev-mode settings tab separating exploratory/debug controls from the
  production surface — D-42) and **M9** (a time-challenge anti-drag circuit-breaker, living in
  M8's dev-mode surface — D-43). Dominik confirmed starting M7.
- **Note for the next Code session working M8:** D-42 settles the dice-count question
  differently than the interim fix in the entry above — see that entry's reconciliation stamp.
  The M6-era hidden toggle code should be replaced with M8's plain dev-mode force-toggle when
  M8 is actually built, not before.

### 2026-09-11 — M7 (two-type boost system) built and verified
- **Status: BUILT, matches §3.6b's spec as written.** Implements the second boost type
  (1-for-2), typed inventory/credits (`{ overpay, oneForTwo }`), a cross-type 3-boost cap, the
  auto-select spend (1-for-2 preferred when both resolve, conserving overpay), the shared-pool
  50/50 reward-type roll (`CONFIG.boostTypeDistribution`), and type-aware inventory/
  announcement/offer text.
- **Files touched:** `app/rules.js` (new `isValidOneForTwoSelection` — exact match to either
  rolled die face, needs no whole-rack carve-out of its own since it can never overpay; and
  `oneForTwoResolvable`, gated on two dice actually being rolled), `app/config.js`
  (`boostTypeDistribution`, default 0.5), `app/app.js` (typed `boosts`/`pendingBoostCredits`,
  `awardBoost` now rolls a type at earn time, `deliverPendingBoost` reworked for the combined
  cap — processes `overpay` before `oneForTwo` when a rare simultaneous over-cap delivery would
  otherwise be ambiguous, an implementation choice the spec doesn't otherwise resolve;
  `selectBoostTypeToOffer` for auto-select; `game.currentRoll.boostSpent` (boolean) replaced
  throughout with `boostSpentType` (null/'overpay'/'oneForTwo'), including in the D-34 theme
  predicate — a 1-for-2 spend is never "overpay" in the rules sense (always exact, never
  relaxed) so it correctly does not trigger the theme flip).
- **One interpretation not spelled out in §3.6b, flagged for the orchestrator:** "ignore one
  whole die, play the other as a single value" doesn't say which die when the two faces differ
  and either could resolve the stall. Implemented as *exact match to either individual die
  face* (`sum === dice[0] || sum === dice[1]`) rather than forcing a specific die choice —
  matches the {3,7,8,9}/roll-3+3 example, stays player-driven like every other move, and is a
  safe superset reading. Not contradicted by any acceptance criterion, but worth the
  orchestrator confirming on the next pass.
- **Verified** via a temporary debug hook (removed before commit) against all 9 acceptance
  criteria individually — the spec's own {3,7,8,9}/roll-3+3 example resolving correctly (#4);
  auto-select offering 1-for-2 and leaving overpay untouched when both resolve (#5); the
  only-overpay and no-op cases (#6, #7); the cross-type cap holding at 3 with credits
  overflowing correctly discarded (#3); per-type inventory and announcement text, including
  the multi-type-delivered-at-once announcement (#2); the reward roll landing close to 50/50
  over 5000 trials (#1); single spend-or-stay with no picker, unchanged from M6 (#8) — plus
  full automated multi-type games (both A+boost, where a real random playthrough naturally
  spent both types in the same game, and native D) completing cleanly with zero console
  errors, and a manual click-through screenshot pass confirming the on-screen text reads
  correctly.
