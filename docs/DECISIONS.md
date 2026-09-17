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

### 2026-09-11 — M8 built: dev-mode tab, and the dice-count reversion this session flagged
- **Status: BUILT, matches §5/M8's spec.** This is the concrete follow-up the "Reconciled as
  D-42" stamp above flagged as owed - it's now done.
- **Dice-count fully reverted to §3.3 as originally written**, not just hidden. The M6-era
  once-per-game mechanism (game-wide `diceCount`, the settings-screen `1/2/?` toggle, the
  first-player-decides live prompt) is gone entirely - `app/app.js`'s `renderPlayDiceChoice`
  is back to showing the 1-or-2 choice **every turn**, per player, defaulting to one die,
  changeable with a single tap, exactly as §3.3 describes. `p.diceCount` is per-player
  again (simplified from the original M1/M2 version - defaults to `1` at player creation, so
  the old `diceCountChosenByPlayer` auto-correct-on-first-unlock flag is no longer needed at
  all and was dropped). The one thing kept from the M6-era work, because it's an independent
  correctness fix, not part of the rejected toggle: the last-tile-is-1 safety net
  (`lastTileIsOne`) still forces 1 die unconditionally, overriding even the new dev-mode force
  below - verified live.
- **Dev-mode tab, since this project has no build step to gate on:** M8's own text leaves "how
  it is gated" as a build decision. With no environment flag to hide behind, implemented as a
  collapsed `<details id="dev-mode-section"><summary>Dev mode</summary>...</details>` on the
  settings screen, styled with a dashed warning-toned border distinct from the production
  `<fieldset>` above it - closed by default so the production surface stays visually clean
  (M8 criterion 1), but not hard-gated, since nothing in this static-file project can hard-gate
  a build variant. Holds a single checkbox for now (`devTwoDiceForce`); §5 says M8 should also
  host the M9 time-challenge as its first exploratory feature, deliberately not built yet -
  that's M9's own session.
- **`devTwoDiceForce` (M8 criteria 2-3):** an `IMMEDIATE`-class setting (same class as
  motion/tap - a testing instrument, not a rule, no fairness reason to defer), forces two dice
  whenever the single-die-unlocked state is reached, and is correctly subordinate to the
  last-tile-is-1 safety rule. Default off; production dice choice unaffected when off.
- **Verified** via a temporary debug hook (removed before commit): the per-turn choice reappears
  for both players every unlock, defaulting to 1 and persisting whatever was last tapped; the
  dev force set mid-game via Settings applies immediately (both `game.devTwoDiceForce` and the
  persisted setting); the last-tile-is-1 override wins even with the dev force on; and three
  full automated games (normal, dev-force-on, native D) completed cleanly with zero console
  errors. Screenshots confirmed the dev-mode section renders collapsed and visually distinct
  from production settings, and expands to show its explanatory text correctly.

### 2026-09-11 — M9 built: time challenge (anti-drag circuit-breaker)
- **Status: BUILT, matches §5/M9's spec.** A dev-mode time picker + Set button, a persistent
  countdown HUD (one element on the turn card, one on the rack), pause-on-turn-card/resume-on-
  rack, and a deliberate no-ranking timeout screen.
- **Design calls not spelled out in the spec, made explicitly:**
  - **Blocked-until-next-game, not live mid-game.** "A time picker plus a Set button to
    activate the challenge for the group" doesn't say whether Set retrofits a game already in
    progress. Went with the same `blocked-until-next-game` class as `rackSize` (input/button
    disabled while a game is running, with an "applies next game" note) - reason: there's no
    sane answer to "how much of this game's time already elapsed" for a game that started
    before a duration existed, and the whole feature is explicitly a cheap-to-try dev
    instrument, not worth the edge cases of mid-game injection.
  - **Persistence split:** only the configured duration (`settings.timeChallengeSeconds`)
    persists to `localStorage`, matching every other setting; the live countdown
    (`game.timeChallenge.remainingMs`) is in-memory-only game state, per the project's own
    "never persist game-in-progress state" rule (§2) - a reload starts fresh with no timer
    resuming from a stale value.
  - **Pure overlay, not a core-loop change** (the stop condition's own bar): a single
    `setInterval(tickChallenge, 250)` started once at boot, delta-time based so a long pause
    never produces a jump on resume, gated only on reading `activeScreen`/`game.timeChallenge`
    and calling `timeoutGame()` - no turn/rack function was touched to make this work.
    `showScreen()` additionally calls `renderChallengeTimer()` on every transition so the
    paused/running HUD switches instantly rather than waiting up to 250ms for the next tick.
  - **New `screen-timeout`**, not a conditional branch of the existing end screen - keeps
    `endGame()`/`renderEnd()` untouched and makes "no ranking table, ever, on this screen"
    structurally true rather than something a future edit could accidentally reintroduce.
- **Verified** via a temporary debug hook (removed before commit) against all 4 acceptance
  criteria: Set rounds an arbitrary input to the nearest 15s and persists it; the HUD
  genuinely counts down in real time on the rack (confirmed across real multi-second waits,
  not simulated); moving to the turn card freezes `remainingMs` exactly (held flat across a
  further real wait) and moving back resumes from precisely where it left off, with no jump;
  forcing `remainingMs` near zero triggers the timeout screen within one tick, showing the
  exact "Time's up! Better luck finishing next time!" text with no ranking table and leaving
  `screen-end` untouched; a normal game-ending win was confirmed to end via `screen-end`, not
  `screen-timeout`, even with a challenge configured. Screenshots confirmed the paused HUD
  renders visibly struck-through and dimmed on the turn card, and the running HUD renders
  normally on the rack. Full automated games with a challenge configured (both short-circuited
  by real time and left to run long) completed with zero console errors.

### 2026-09-12 — Production dice choice goes silent; the old 1/2/? toggle returns, dev-gated
- **Finding, from real-device playtesting:** the M8/§3.3 per-turn prompt (defaulting to one
  die, re-asked every turn once unlocked) still reads as "the prompt won't go away" in real
  play, even though it was verified working exactly as D-42 specified. The dev-only
  `devTwoDiceForce` checkbox from M8 was a one-way force (2 dice only) with no way to ask
  interactively or reset - not enough to actually test the per-turn path by hand.
- **Decision (Dominik, this session):** go further than D-42 - **production drops the
  player-facing choice entirely.** `devDiceTestEnabled` off (the default) means one die,
  silently, no prompt, no tap-to-change, full stop. This is no longer literally §3.3 ("chooses
  one die or two... changeable with a single tap") - it's "always one, no choice surfaced" -
  but is exactly what was asked for and is a natural extension of D-42's own reasoning, not a
  reversal of it: D-42 already established that dev-testable dice behavior belongs in dev
  mode, not on the production surface; this just moves the *entire* choice there instead of
  only the force.
- **`devDiceTestEnabled` (checkbox) + `devDiceChoice` (nested `1`/`2`/`ask` toggle,
  dev-mode-only, resets to `ask` every time the checkbox is re-ticked):** `ask` reactivates the
  exact §3.3 per-turn prompt for hand-testing both paths; `1`/`2` hard-force silently, folding
  in what `devTwoDiceForce` used to do as one case of this toggle rather than a separate
  control. This is functionally the M6-era "1/2/?" toggle again, but it is **not** a
  reinstatement of the production toggle D-42 rejected - it now lives strictly behind an
  off-by-default dev checkbox, matching M8's own charter ("exploratory, debug, and testable
  controls... reachable during development without polluting the settings a real user sees").
  The last-tile-is-1 safety rule is unconditional throughout, same as before.
- **Flagging for the orchestrator's next pass:** §3.3's text should be revised to state the
  *production* behaviour is now a silent single die with no player-facing choice at all, and
  that the per-turn "changeable with a tap" model is a dev-mode testing affordance
  (`devDiceChoice: 'ask'`), not a shipped mechanic. D-03/D-42 should be updated to match.
- **Verified** via a temporary debug hook (removed before this commit): production default
  (test mode off) rolls one die with zero prompt shown, confirmed on a fresh unlock; ticking
  "Test dice #" resets the nested toggle to `ask` and immediately shows the live per-turn
  prompt; forcing `2` then `1` via the real Settings UI applies immediately with the prompt
  correctly hidden in both forced states; unticking the checkbox reverts everything to the
  silent one-die default with no residual state; three full automated games (production
  default, dev test on `ask`, dev test forced to `2`) completed cleanly with zero console
  errors.

### 2026-09-12 — Real-device report: 1-for-2 boost looked like a dead end - wording, not logic
- **Report:** on a real iPhone, rack open {2, 3, 9}, rolled 5+5, only held boost was 1-for-2.
  Spending it showed "Selected: 0 (needs 5)"; the player couldn't find a way forward and
  concluded the game was stuck with the boost wasted.
- **Investigated and reproduced the exact scenario** (same rack, same dice, same boost) via a
  temporary debug hook: selecting tiles 2 and 3 together (2+3=5) correctly validated, enabled
  Confirm, and completed the move - `RULES.isValidOneForTwoSelection`/`oneForTwoResolvable`
  and the offer/spend pipeline are all correct. **Not a logic bug** - this was reachable,
  just not obviously so.
- **The actual bug: the wording.** "needs 5" and (in the offer) "play a single 5" both read
  as "you need the tile numbered 5" - which, in the case that triggers this boost at all, is
  very often exactly the closed tile that caused the stall in the first place, making a
  legitimately-solvable roll *look* like a trap. Fixed both strings to say explicitly "any
  tiles/open tiles summing to N" (`app/app.js`, `renderPlayBoostOffer`/
  `renderPlaySelectionSum`). No rule or validity logic changed.
- **Verified**: reproduced the exact reported rack/roll/boost via a temporary debug hook
  (removed before commit) - confirmed the escape move resolves correctly, confirmed the new
  wording reads unambiguously, and ran a full automated game with boosts enabled end to end
  with zero console errors.

### 2026-09-12 — URGENT flag for the orchestrator: no recovery/undo path when a player is stuck
- **Raised by Dominik, off the report above** (this instance turned out not to be a dead end,
  but the *category* of risk is real and unaddressed): if a player ever does reach a genuine
  stuck state - a real rules bug, a future regression, or just a player who can't figure out
  a legal move exists - there is currently **no way to recover except "End game"**, which
  discards the entire match for every player, not just backs out of one bad spot. There is no
  undo, no restart-this-turn, no back button anywhere in the turn/rack flow.
- **Not investigated or scoped further here** - explicitly the orchestrator's to think through
  (what should be undoable - a tile selection before Confirm? a whole turn? a boost spend? -
  and what state that requires keeping around, given §2's "never persist/retain more than the
  live game" posture). Flagged as urgent because it's a real-play gap, not a hypothetical one:
  this session's own reporter got stuck (before the wording fix above) with no way out but to
  end the whole game.

### 2026-09-12 — Real bug: a boost could close the whole rack, incl. via full-set-only offers
- **Report:** on a real device, with two tiles {4, 1} left open and rolling two dice, a
  1-for-2 boost was offered and spent to resolve a die face of 5 (4+1), which finished the
  round. The player who reported it correctly judged this must never be legal - "the game
  must not be completed with a boost" - even though the sum matched a rolled die face exactly.
- **Root cause, two layers:**
  1. `RULES.oneForTwoResolvable` (and therefore `selectBoostTypeToOffer`) used
     `subsetSumExists`, which is satisfied by the full set of open tiles - so a die face only
     reachable by using *every* remaining tile was still being offered as a boost, even though
     spending it could only ever end the game.
  2. Nothing blocked *confirming* such a selection either: `wholeRackOverpayBlocked()`
     explicitly exempted 1-for-2 (reasoning at the time: "an exact match can never overpay, so
     it's always fine to legitimately finish the rack this way" - this reasoning is exactly
     what's now overturned), and the overpay-boost path only enforced D-45's "must be exact to
     close the whole rack," not "may not close the whole rack at all."
- **Decision (generalizes beyond 1-for-2):** a boost-spent move, of either type, may never be
  the move that shuts the whole rack - not just when it would overpay, unconditionally, even
  on an exact match. This is stricter than D-45 (which governs plain, non-boost overpay) and
  sits alongside it, not in place of it.
- **Fix:**
  - `RULES.properSubsetSumExists` (new, `app/rules.js`): true iff some subset *smaller than
    the full open set* sums to target. `oneForTwoResolvable` now uses this instead of
    `subsetSumExists`, so an offer is only ever made when a non-rack-closing resolution
    actually exists. (The overpay-boost offer check, `anyLegalMoveExists(..., 'D')`, was
    already proper-subset-safe by construction for >1 open tile - a lone open tile is always
    a valid proper-subset partial move under D - so it needed no change; see its own comment
    in `rules.js`.)
  - `currentSelectionValid` (`app/app.js`) now rejects any selection covering every open tile
    whenever `boostSpentType` is set, before the per-type shape check runs - a single,
    type-agnostic guard so `onConfirm` and the Confirm-button enablement can't disagree, same
    pattern as the existing centralised-validity comment describes. This is the actual
    load-bearing fix; the offer-side fix above just stops the game from dangling a boost in
    front of a player that it wouldn't have let them use anyway.
  - Added `boostWholeRackBlocked()` + a `renderPlayMessage` case so Confirm being disabled in
    this state isn't silent - the player sees why, same UX pattern as the existing D-45
    "closing the whole rack needs an exact match" notice.
- **Verified** via a temporary debug hook (removed before commit): reproduced the exact
  reported case (rack down to {4,1}, dice forced to [5,2] via a `Math.random` stub, two-dice
  roll forced through the dev dice-test toggle) - confirmed the boost is no longer offered at
  all for that roll; separately forced `boostSpentType` and a whole-rack selection directly to
  confirm `currentSelectionValid` now rejects it even on an exact sum; confirmed a boost
  selection that leaves a tile open still validates normally. Ran 6 full automated games across
  both overpay modes and both rack sizes, boosts enabled, with a solver that treats "would
  close the whole rack while boosted" as an error if the game logic ever let it through - zero
  such errors, zero console errors.

### 2026-09-12 — Roster rotates after a completed game; scoped to the win screen only
- **Request:** after a completed game, rotate the roster by one so a different player starts
  the next game by default (the same player going first every time was the report).
- **Decision:** rotate on the normal `#screen-end` "New game" button only (`roster.push(
  roster.shift())`, i.e. whoever went first moves to the back) - **not** on `#screen-timeout`'s
  "New game." A time-challenge timeout has no winner and is deliberately not treated as "a
  completed round" anywhere else in this codebase (see the M9 no-ranking-table rule) - rotating
  the turn order as a reward/consequence of a round nobody actually finished didn't seem like
  the intended trigger, and reusing the same starting player after an aborted round is more
  consistent with "nothing was really decided here."
- Also added drag-to-reorder on the setup screen's player list (Pointer Events, not HTML5
  drag-and-drop, for touch support - a manual pick-and-drag: the dragged row's centre is
  pinned to the pointer's Y and cascades through as many neighbour swaps as a single move
  warrants, recomputed from each row's natural position rather than a compounding transform,
  so a fast flick doesn't stall after one swap). Disabled (handle hidden, same as Remove)
  whenever a game is in progress, matching the existing roster-editability rule.
- **Verified** via a temporary debug hook and scripted Pointer Events (removed before commit):
  rotation confirmed after both a debug-forced game end and a fully-played automated game;
  drag-to-reorder confirmed to cascade multiple slots in one gesture via dispatched
  `pointerdown`/`pointermove`/`pointerup` events, confirmed persisted via `STORAGE.saveRoster`,
  confirmed the handle is hidden and inert mid-game.

### 2026-09-13 — GitHub issue #1: rack grid still resizing pre-roll (extension of the total-line fix)
- **Report** (`dominikhilse/flip#1`): the previous fix reserved space for the dice "Total"
  line only once a roll was already in flight (`totalEl.style.visibility`, toggled inside
  `animateDiceRoll`). The same principle wasn't applied to the moment *before* the first roll
  of a turn: with no `game.currentRoll` yet, `renderPlayDice` rendered nothing at all into
  `#play-dice-area`, which fell back to its CSS `min-height: 3.5rem` - less than the block's
  real height once dice + the total line are actually drawn. Since `#play-rack` is `flex: 1 1
  0` in the same flex column, it silently absorbed that extra slack, then visibly shrank the
  instant the first roll of a turn rendered real content - the same jump as before, just at a
  different transition.
- **Fix:** `renderPlayDice` (`app/app.js`) now always renders the same shape of markup - N
  die spans plus the `#total` div - whether or not a roll has happened yet; pre-roll, the
  dice are placeholder value `1` and everything is `visibility: hidden`, not absent. Die count
  pre-roll comes from `effectiveDiceCount(currentPlayer())`, which is already pure with
  respect to current rack/dev-settings state (it doesn't depend on the eventual random roll),
  so the placeholder count always matches what a real roll would show right now - no
  guessed/hand-measured pixel value involved, matching the "reserve by always rendering,
  toggle visibility" approach used for the animation-phase fix rather than inventing a new
  min-height number.
- **Verified** via a temporary debug hook (removed before commit): measured `#play-rack`'s
  rendered height at turn start (pre-roll), immediately after `onRoll()`, and once the roll
  animation settled - identical (509.9375px) at all three points. Ran a full automated game
  with height sampled every animation frame; the only height changes recorded were pre-existing,
  unrelated UI (`#play-boost-offer` and the boost-earned announcement banner appearing/
  disappearing with real game events) - none from the dice/total/rack area this fix targets.
  Zero console errors.

### 2026-09-13 — Built M11 (navigation & escape-hatch fixes); flag re: M10's stale status header
- **Picked up from the latest milestone-plan revision** (reconciling DECISIONS.md through
  2026-09-12): M11 is written up as "fully resolved" (design-wise) with D-51 locked, but its
  section header still reads `SPECIFIED` and none of it existed in code - so it was the next
  thing to actually build, and this entry covers doing so.
- **Built, matching §M11/D-51 exactly:**
  - **P0 - corner Settings button on `#screen-play`** (`app/index.html`/`app/app.js`), mirroring
    the turn card's existing `.corner-btn`, into the *same* reused Setup/Settings screen (no new
    UI surface). Closes the literal dead end: with Motion off, Play previously had no exit at
    all. `position: fixed` rather than `.corner-btn`'s default `absolute`, since unlike the turn
    card, `#screen-play` can scroll (`overflow-y: auto`) and the button must not scroll away.
  - **Restart match** (`restartMatch()`): keeps `game.players` (identity/seat order/colors) and
    every live setting, re-racks everyone fresh, **resets every player's boosts to zero**
    (deliberately diverges from New Game's boost carryover, per D-51/§3.6's "stacking across
    replays" - a Restart is a do-over of *this* match, not a replay), clears finishedOrder and
    turnIndex, resets the time-challenge clock if one is set, and jumps straight to the first
    player's turn card via the existing `beginTurn()`. Reachable from the mid-game Setup screen
    (new "Restart match" button) and, unguarded and unrotated (see below), as "Rematch" on both
    the End and Timeout screens.
  - **Confirm guards**: a single generic native `<dialog>` (`#confirm-dialog`, `confirmAction()`
    in `app.js`) wraps mid-game "End game" and "Restart match" - the two destructive actions
    reachable while a match is live. Cleanup hangs off the dialog's own `close` event (not off
    Cancel/OK directly) so a desktop Escape-dismiss can't leak listeners. End/Timeout screens'
    own Rematch/New Game need no guard - nothing live to lose there, per spec.
  - **Rematch does not rotate the roster.** D-50's rotation is tied specifically to New Game's
    "discard to Setup" flow; Rematch keeps the same seats in the same order by design (verified
    below), matching "keeps the exact roster and settings."
  - Per-move undo: confirmed absent, as required - nothing built resembles it.
  - Minor supporting CSS: buttons stacked in the same screen (`start-game`/`back-to-game`/
    `restart-match`/`end-game`, and the two Rematch/New-Game pairs) previously had zero gap
    between them with no rule providing one; added `.screen button + button { margin-top:
    0.5rem }` so destructive/safe actions sitting side by side don't visually fuse into one
    blob - directly in service of this milestone's own point (making dangerous actions
    distinguishable), not a drive-by restyle.
- **Verified** via a temporary debug hook (removed before commit): the Play-screen Settings
  button reaches Setup with `motionEnabled: false` (the exact reported dead end); Restart's
  Cancel leaves state untouched and Confirm resets rack/boosts/turnIndex/finishedOrder and lands
  on the first player's turn card; End game's Confirm discards to Setup, Cancel leaves the match
  running; both dialogs checked in light and dark theme; End-screen and Timeout-screen Rematch
  both skip the confirm and leave `roster` order unchanged (`STORAGE`-persisted roster order
  read back identical before/after); a full automated game (boosts on, overpay A, 12-tile rack)
  completed cleanly. Zero console errors throughout.
- **Flag for the orchestrator:** M10's section header in the milestone plan still reads
  `SPECIFIED` even though the dice-roll animation has been built and verified for several
  sessions now (commit `2298247` and its follow-ups) - D-47 is already `Locked` in §8, and the
  2026-09-12 revision note flipped M7/M8/M9 to `BUILT, VERIFIED` but didn't mention M10. Likely
  just missed in that pass; flagging so the next reconciliation flips M10's header too rather
  than leaving it looking unbuilt.

### 2026-09-13 — Built M12 (tabbed settings/menu redesign, structural pass)
- **Picked up after M13 (brand/skin) was resolved and folded in as its own milestone** - per the
  plan's own sequencing, M12's structural pass still comes first (M13 lands skin/avatars on top
  of it), so this session built M12 rather than jumping ahead to M13.
- **Restructured `#screen-setup`** into the four wireframed tabs (Players/Rules/App/Dev) with a
  top tab bar (simple placeholder inline SVG icons - person, list, sliders, `<>` chevrons -
  monochrome `currentColor`, deliberately unpolished per the acceptance criterion that this
  milestone must still read as a wireframe, not final skin). Every existing control kept its
  pre-M12 element id; this was a pure container reorganisation, not a rebuild - `renderSetup()`
  and friends needed no logic changes beyond the new tab-switching and banner code.
- **D-30's tiering, re-expressed as static chips.** The old per-control notes ("Applies next
  lap", conditionally hidden until a game was live) are gone, replaced by an always-visible
  `next game`/`next lap` chip next to each Rules-tab control's label - a static category tag
  rather than a live status message. The one genuinely dynamic, mid-game-only message is now a
  single banner at the top of the whole menu ("Match in progress — rule changes apply at the
  next lap"), shown on every tab via `renderSetupTabs()`, replacing four scattered conditional
  notes with one. No tier, default, or mid-game-mutability behavior changed - confirmed via the
  boost-mode-greys-out-under-D and rack-size/time-challenge-disabled-mid-game checks below.
- **Theme control changed shape**, checkbox → segmented Dark/Light toggle-group, to match 3b's
  spec exactly. Same underlying `settings.theme` value and `queueSettingChange('theme', ...)`
  path as before - only the control's shape changed, verified applying immediately in both
  directions.
- **Dev tab supersedes M8's `<details>` container** (per M12's own stated scope) - dropped the
  collapse/dashed-border treatment (redundant now that Dev has its own tab for segregation) and
  added the corrected banner ("Developer tools — not part of normal play"), avoiding the
  wireframe's undeliverable "not shown in shipped build" claim (this project has no build step
  to exclude anything from - see §2/M12's own flag). Time-challenge `0 = off` needed no code
  change - already the existing behavior throughout (`timeChallengeSeconds > 0` gates every use
  site) - just confirmed it, per M12's "new detail to adopt."
- **Kept both flagged mismatches, per M12's resolution rule:** drag-to-reorder (D-50) built into
  the Players tab's row style unchanged; the full player-colour set (10, not the wireframe's 6
  placeholder swatches) left untruncated.
- `activeSetupTab` is a plain module-level var (not persisted to `settings` or `game`) so
  reopening the menu mid-session keeps the player's last tab instead of resetting to Players -
  a small UX call the spec didn't dictate either way.
- **Verified** via a temporary debug hook (removed before commit): all four tabs render and
  switch with no reload; boost-mode row visibly greys out when Overpay = D and re-enables
  switching back to A; rack size buttons and the time-challenge input/Set button are disabled
  mid-game while the theme toggle and dev dice-test remain live; the mid-game banner appears on
  every tab exactly when a match is live and disappears when it ends; the theme toggle-group
  flips the whole screen immediately in both light and dark; drag-to-reorder re-tested via
  scripted Pointer Events post-restructure and still cascades correctly; M11's Play-screen
  Settings button, Restart, confirm dialogs, and End/Timeout Rematch all re-verified working
  unchanged through the new tab structure; a full automated game (boosts on, overpay A, 12-tile
  rack) completed cleanly end to end. Zero console errors throughout, in both themes.

### 2026-09-13 — Built M13 (brand/skin application + avatars)
- **Only 19 of D-55's locked 20 avatar files exist.** The user supplied 19 placeholder PNGs
  (real photos, not Spudling art - explicitly temp per D-55's "provisional/swappable" framing).
  Renamed from their original camera filenames to the `01.png`..`19.png` convention documented
  in `app/avatars/README.md`. **Not silently padded to 20** - `CONFIG.avatarCount` (`app/
  config.js`) is the single source of truth for the actual count a static site can't discover
  at runtime by listing its own directory, currently `19`. Dropping a 20th file in as `20.png`
  and bumping this one number is the entire fix when it's available; nothing else reads a
  hardcoded avatar count. Flagging here per the "20 is a locked spec number" note rather than
  treating it as resolved.
- **Palette, tile renderer, fonts, and radii applied verbatim from the design handoff**
  (`docs/DevHandoff_BrandSpec.dc.html`): `theme.js`'s `tileColors` moved from a flat hex string
  per value to `{fill, edge, ink}` (edge = dark-partner border/light-fill numeral, a non-hue
  identity channel that survives the theme flip; ink = numeral colour); `closedTileColor`/
  `closedTileTextColor` folded into a single `closedTile` object. `renderPlayRack` (`app.js`)
  updated to read the new shape and add a `.closed` class; `.tile.closed`'s CSS inset shadow is
  one of three redundant closed-state cues (desaturated fill + dim hollow `ink` are the other
  two, both already inline per-tile) - verified all three independently visible with the tile
  screenshot inspected at full colour. Bagel Fat One + Figtree added via network `<link>` in
  `index.html` `<head>` (the §3.1 offline-purity caveat is knowingly accepted, per the handoff -
  `system-ui` is the fallback). `--radius-tile`/`--radius-btn`/`--tile-closed-shadow` added to
  the single shared `:root` block (theme-independent, unlike the colour tokens) rather than
  duplicated into `body.theme-light`.
- **Avatar assignment and cycling (D-55), the one genuinely new mechanic this milestone adds:**
  `assignAvatars(players)` shuffles the avatar pool and deals one per player without
  replacement, called from both `startNewGame()` and `restartMatch()` (a Restart is a fresh
  deal, same as any other game start, consistent with it also resetting boosts/racks). Shown as
  a circular, tap-to-cycle image (`#play-avatar-btn`) next to the name in Play's header - the
  spec's own UI mockup doesn't actually depict where the avatar goes (none of the six mockup
  screens shows one), so the exact placement was this session's call, not the handoff's.
  **Judgment call the spec didn't fully resolve: cycling also enforces uniqueness against every
  other player's CURRENT avatar**, not just the initial deal - `cycleAvatar()` skips any
  filename another player already holds, wrapping through the full pool. Reasoning: D-55's
  stated purpose for avatars is "primary 9-12 distinguisher," which two players sharing one
  (by cycling into it) would directly undermine; enforcing it only at deal-out and not after
  seemed like an oversight risk rather than an intended relaxation.
- **Player-count edge case, noted not solved:** the roster has no upper limit (§3.1), but the
  avatar pool is finite (19 now, 20 at D-55's spec). `assignAvatars` degrades gracefully past
  the pool size by repeating the shuffled pool (`pool[idx % pool.length]`) rather than crashing
  or leaving players without an avatar - guarantees at least one full unique pass before any
  repeats. No real pass-the-phone session will hit this; recorded so it isn't a silent surprise
  if one ever does.
- **Verified** via a temporary debug hook (removed before commit), after first hitting and
  fixing a stale-`config.js`-cache issue (rotated the dev-server port per the standing
  convention, confirmed `CONFIG.avatarCount` loaded correctly after): tile fill/edge/ink render
  correctly per value in both themes, with **pixel-identical background RGB values confirmed
  across the theme flip** (the acceptance criterion that player hues never move); closed tiles
  show all three redundant cues; avatars assign uniquely per game (checked via `Object.keys`/
  direct player inspection) and cycling was driven through all 18 alternatives for one player
  without ever landing on the other's held avatar; turn card and launch screens confirmed
  unaffected by both the theme toggle and the new fonts/palette (fixed contrast preserved,
  matching the do-not-touch instruction); the Setup tab bar, buttons, and headings all confirmed
  using the new display/UI fonts; a full automated game completed cleanly. Zero console errors
  throughout.

### 2026-09-13 — GitHub issue #2: avatar iteration (Play crop, turn-card avatar)
- **Report** (`dominikhilse/flip#2`): the Play-header avatar (built for M13) should crop to a
  head/bust view rather than showing the full character shrunk small, always at the same
  position; a second, full-size avatar should appear above the player's name on the turn card,
  with the same tap-to-cycle behaviour - which means "tap anywhere to continue" must exclude
  that avatar specifically.
- **Play-header crop**: pure CSS, no source-file changes and no per-image tuning - the `<img>`
  is oversized to 190% of its circular container and pinned to the top edge (`position:
  absolute; top:0`), so the container's existing `overflow:hidden` clips it to the same
  head/shoulders window on every avatar, since the source art consistently places the head near
  the top of a square canvas. A very tall hat (checked against `19.png`'s wizard hat) loses its
  tip but the face stays fully visible - an acceptable trade-off of one fixed crop for all 19+
  images, matching "the avatar head position will always be the exact same."
- **Turn card avatar**: full, uncropped, sized independently of the crop above (`.turncard-
  avatar-btn`, `width:100%; height:auto`) - shows the whole character above the name. Reachable
  via `showTurnCardFor(p)` (same function used by both a genuine turn start and the motion
  lift-to-peek pause), so it stays correct without extra call sites to remember.
- **Tap-to-cycle vs. tap-to-continue conflict, resolved by exclusion, not by suppressing either
  behaviour:** the turn card's screen-wide click listener (`turncardScreenEl`) now bails via
  `turncardAvatarBtn.contains(e.target)` before reaching the `effectiveTap()` gate - `.contains()`
  rather than a direct `===` check (as the pre-existing Settings-button exclusion uses) because
  the actual click target when tapping the avatar is the `<img>` inside the button, not the
  button element itself. The avatar's own click handler calls `cycleAvatar()` unconditionally,
  independent of `effectiveTap()`/the tap-to-proceed setting - cycling isn't a turn-advance
  gesture, so it must keep working even when tap-to-proceed is off (motion handles advancement
  instead) or when motion is currently working.
- **`cycleAvatar()` no longer renders internally** - it mutates `p.avatar` only and returns; each
  of its three call sites (Play header, turn card, and any future one) re-renders whatever it's
  actually showing. It was calling `renderPlay()` unconditionally before, which was already a
  layering smell (a rules/state function reaching into a specific screen's render), and would
  have been outright wrong for the turn-card call site (Play isn't even the visible screen then).
- **Verified** via a temporary debug hook (removed before commit): tapping the turn-card avatar
  cycles the image and confirmed the screen stayed on `screen-turncard` (didn't advance); tapping
  elsewhere on the card still advances to Play; the Settings corner button still works unaffected
  by the new exclusion; a cycled avatar on the turn card correctly shows the same new avatar's
  head/bust crop on the Play header afterward (shared `p.avatar` state, no desync); turn card
  confirmed unaffected by the theme toggle (fixed contrast preserved) with the new big avatar in
  place; a full automated game completed cleanly. Zero console errors throughout.

### 2026-09-13 — Font swap (Bagel Fat One → Vollkorn Black) + two-font audit
- **Request:** replace `--font-display` with Vollkorn (Black), extend it to the turn-card player
  name (`#turncard-name`, previously plain UI-font text despite being exactly the kind of "hero
  name" the display face is for), and audit every piece of text in the app so nothing renders in
  a third font.
- **Font link, `style.css` `--font-display`**: swapped to `'Vollkorn', Georgia, serif` (weights
  600/700/900 requested from Google Fonts, in case a lighter/bolder variant is ever needed per
  the request's own allowance - only 900 is used today). Unlike Bagel Fat One (a single
  inherently-heavy weight, no lighter cuts exist), Vollkorn's regular weight is a normal-weight
  serif - **every rule using `--font-display` now sets `font-weight: 900` explicitly**, since
  nothing about the family itself guarantees "Black" the way the old font did. Found and fixed
  one real bug this surfaced: `.tile`'s own rule still hardcoded `font-weight: 700` *after* the
  shared display-font rule in source order, which would have silently won and left tile numerals
  at 700 instead of 900 - removed the stale declaration rather than just adding a heavier one
  elsewhere and leaving a footgun for the next edit.
- **`#turncard-name`**: added `font-family: var(--font-display)` (it never had one - only
  inheriting the UI face by omission) and bumped its own `font-weight: 800` to `900` to match
  every other display-face use exactly, per the explicit ask.
- **Two-font audit**: grepped every `font-family`/`font:` declaration in `style.css` (three
  existed pre-audit: the `html,body` UI default, the shared display rule, and `button {
  font-family: inherit }`) and confirmed nothing else overrides away from the two variables.
  Broadened the `button` inherit rule to `button, input, select, textarea` - form controls don't
  reliably default to an ancestor's `font-family` the way plain text elements do, and the point
  of an audit like this is to close exactly that kind of silent platform-font leak rather than
  assume it isn't happening. (iOS Safari's native `<select>` picker wheel is a platform control
  outside the webview's rendering and cannot be restyled by any web CSS - the closed/collapsed
  select itself is covered by this fix, the native popover's font is a platform limitation, not
  something left unaudited.)
- **Verified** via a temporary debug hook (removed before commit, dev-server port rotated to
  bypass a stale-cache re-serve of the old font link): turn card, Play header name, tile
  numerals, and every primary button confirmed rendering Vollkorn at computed weight 900; every
  secondary/label/setting/input element confirmed still Figtree; `player-name-input` and
  `placement-mode`'s computed `font-family` explicitly checked (previously unverified, per the
  audit's own reasoning) and confirmed Figtree, not a platform default; a full automated game
  completed cleanly in both themes with zero console errors. **Noted, not fixed - flagging for
  visibility**: Vollkorn's serif "1" glyph (a lining figure with a top flag and serif base) reads
  visually close to a capital "I" at the small clamped sizes tile numerals use, most noticeably
  on tile `1` specifically - worth a real-device look before assuming it's fine for the target
  age group, since misreading a tile number is a correctness-adjacent legibility issue in a
  number-matching game, not just a cosmetic one.

### 2026-09-14 — Font swap (Figtree → Overpass)
- **Request:** replace `--font-ui` with Overpass. Straightforward substitution - `--font-ui`
  already sat behind a variable read by everything (the two-font audit the previous session had
  just finished confirmed there was no third font and no stray hardcoded `'Figtree'` anywhere),
  so this needed no structural change, only the value itself and the font `<link>` request.
- Swapped `family=Figtree:wght@400;600;700;800` to `family=Overpass:wght@400;600;700;800` in
  `index.html`'s Google Fonts `<link>` (same weight set requested, since nothing about which UI
  weights are used changed) and `--font-ui: 'Overpass', system-ui, sans-serif;` in `style.css`.
- **Verified** via a temporary debug hook (removed before commit; dev-server port rotated to
  avoid a stale-cache re-serve of the old font link): `document.body`'s and a representative
  UI-face element's (`#turncard-instruction`) computed `font-family` both confirmed `Overpass,
  system-ui, sans-serif`; `#turncard-name` (display face) confirmed still `Vollkorn, Georgia,
  serif`, unaffected; a full automated game completed cleanly with zero console errors.

### 2026-09-14 — GitHub issue #3: Play/turn-card UI fixes (pre design session direction)
- **Scope resolved with the reporter before starting** (four points flagged as blocking,
  answered before any code): (1) the "Total/Selected merged line" item is **deferred** - boost
  UI/UX needs a broader pass first, revisit the merge question then; `#play-selection-sum`
  stays exactly where and how it is. (2) The boost spend-or-stay **buttons stay in their
  current position** (their own row, directly above Roll/Confirm) - only the **help text**
  relocates to the new reserved area below the buttons; "Use boost" becomes the same width as
  "Stay stalled" at that same position, not moved. (3) Header layout is **two explicit rows**,
  not one: row 1 = Settings (left) / boost-earned toast (right); row 2 = avatar+name (left) /
  time-challenge counter (right) - resolves what would otherwise be a real conflict (confirmed
  via `renderPlayBoostAnnouncement`'s own logic that the toast can genuinely persist alongside
  a running counter, not just a hypothetical overlap). (4) **All** message-style text moves to
  the new bottom area - the plain "Stalled — no legal move," both whole-rack-block notices, and
  the boost offer prompt - not just the boost-specific ones.
- **Built:**
  - `#play-boost-offer-text` moved out of `#play-boost-offer` (which now wraps only the
    Use-boost/Stay-stalled button row, unchanged position) into a new `#play-message-area`
    below the Roll/Confirm row, alongside the relocated `#play-message`. Found and fixed a real
    bug this uncovered: `renderPlayBoostOffer()` used to rely on its parent's `hidden` attribute
    to hide stale offer text when no longer pending - now that the text lives in an
    always-visible container, it needed its own explicit clear on the `!show` path, or a
    declined/expired offer's text would have stuck around silently.
  - **Button-sizing bug fixed at its actual root cause**, not papered over: `button.primary`
    and `button.secondary` have always carried different padding/font-size app-wide (by
    design, for the visual weight difference between primary/secondary elsewhere). Inside
    Play's own action-rows specifically, that's what made "Stay stalled" (secondary) taller
    and differently-sized than "Use boost" (primary) - fixed via `#screen-play .action-row
    button { flex: 1; padding: 1em; font-size: 1.1rem; }`, scoped so Setup/End's primary-vs-
    secondary distinction and the confirm dialog's own sizing are untouched.
  - Settings moved from an absolutely/fixed-positioned corner chip (`.corner-btn`, only ever
    used by the turn card now) into a normal flow item in the new `.play-toprow`
    (`.settings-inline`, visually similar chip, not position:fixed) - it now moves with the
    header instead of floating over the rack.
  - `#play-timer` restyled to `--font-display` at the same weight/size as `#play-player-name`
    (both `1.5rem`, explicitly set on both rather than left to each element's differing
    implicit default - h1's is UA-dependent, not something to match against blindly); its
    "Time challenge:"/"(paused)" label text dropped everywhere (`renderChallengeTimer()`), on
    the turn card relying on the existing strikethrough CSS alone to signal "paused."
  - Turn card's `.corner-btn`/`.corner-timer` swapped left/right (settings now upper-left,
    counter upper-right) to match the new Play convention - a straightforward swap of two
    already-absolute-positioned classes, not a layout rebuild.
  - **1-for-2 die highlight (new mechanic, not just a relayout):** once a boost-spent selection
    sums to exactly one die's face, that die gets an outline and the other dims to 0.35 opacity
    - purely a state readout (dice aren't interactive elements), added to `renderPlayDice()`.
    When both dice show the same face, both highlight (there's no meaningful "other one" to dim
    when they're visually identical). Nothing highlights before a match exists, per "after
    selecting the number" in the request.
- **Verified** via a temporary debug hook (removed before commit; dev-server port rotated to
  avoid a stale-cache re-serve): forced the exact `{4,1}`-rack/`[4,6]`-roll 1-for-2 scenario and
  confirmed selecting tile `4` outlines the die showing `4` and dims the one showing `6`, then
  confirmed the move closes only that tile (not the whole rack, re-exercising D-48's existing
  guard as a side effect); "Use boost"/"Stay stalled" confirmed equal-sized; boost-offer text
  confirmed relocated below the buttons and correctly cleared (not stuck) after spending;
  forced a simultaneous running time-challenge counter and boost-earned toast and confirmed
  both rows render exactly as specified with no overlap; plain "Stalled — no legal move"
  confirmed relocated to the same bottom area; turn card's settings/counter swap confirmed
  (left/right, counter struck-through, label-free); a full automated game completed cleanly in
  both themes with zero console errors.

### 2026-09-14 — GitHub issue #4: last UI clean-up / repositioning
- **Dice-choice prompt still caused a grid jump** even after issue #3's message-area work,
  because it was a separate sibling above `#play-dice-area` reserving its own extra space -
  gone the instant a roll happened, letting the rack grow into the freed gap. Fixed by drawing
  the prompt *inside* `#play-dice-area` (in the dice's own stead, per the report), sharing one
  reserved box instead of stacking two. Measured, not guessed: the real dice+total content
  renders at ~68.8px, taller than the old `min-height: 3.5rem` (56px) floor - bumped to
  `4.3rem` so both states settle at the *same* measured height, confirmed via
  `getBoundingClientRect()` before/after a forced roll (0px diff, was ~11.5px).
- **"Next player" now occupies the same DOM position as Roll+Confirm** (moved before
  `#play-message-area` instead of after it), so the button row's position is constant across
  all three of its states (Roll+Confirm / Use boost+Stay stalled / Next player alone) and the
  message area consistently reads as "below the buttons," not "above Next player."
- **Root-caused the persisting button-height mismatch**, not re-applied the same fix harder:
  issue #3's sizing fix (matching padding/font-size) held on desktop but the reporter found it
  still off on the real device - the actual cause is iOS Safari layering native button chrome
  on top of the authored box model, most visible on buttons that spend most of their time
  `disabled` (Confirm, Stay stalled) versus their counterparts that don't (Roll, Use boost).
  Fixed with `-webkit-appearance: none; appearance: none;` on `button` - the standard, known
  remedy for this exact class of cross-engine sizing bug, not something guessable from desktop
  Chrome alone (where the two already measured identical).
- **1-for-2 double-dice edge case, revised per report:** previously, rolling a double (both
  dice showing the same face) and matching it highlighted *both* dice as "used," reasoning that
  either physical die could be the one in play. The reporter flagged this as backwards - the
  point of the cue is signalling "one die is being ignored," and marking both as used says the
  opposite. Changed `oneForTwoDieClass` so a double still marks exactly one die unused (index 0
  arbitrarily wins "used," consistently) rather than dropping the distinction.
- **Verified** via a temporary debug hook (removed before commit; dev-server port rotated
  between CSS-affecting changes to avoid a stale-cache re-serve): dice-area height measured
  identical before and after a forced roll with the choice prompt showing; "Next player"
  confirmed sitting in the action-row's position with the stall message below it; `appearance:
  none` confirmed applied (`getComputedStyle`); the exact double-roll 1-for-2 scenario
  (`{4,3}` rack, `[4,4]` roll) confirmed marking exactly one die `die-used` and the other
  `die-unused`, screenshot-checked; a full automated game completed cleanly with zero console
  errors.

### 2026-09-14 — GitHub issue #5: Selected: X/X repositioned, Play screen made uniformly fixed-height
- **`#play-selection-sum` was still pushing the grid down**, same class of bug as issues #1/#4:
  it sat *above* the rack with `min-height: 1.2em` but its text (`hidden` attribute swapped
  off, not just emptied) still shifted the rack below it by a hair whenever a roll started.
  Per the report, moved it to a new position entirely - directly above `#play-dice-area`,
  between the rack and the dice - and switched it (and `#play-boost-count`, its row-mate for
  the same reason) from `hidden`-attribute toggling to `visibility` toggling with an always-on
  `min-height`, matching the pattern already proven for the dice/total area in issue #1 and the
  message area in issue #3. The stray `hidden` attribute left on both elements' HTML markup
  (a leftover from the old attribute-toggle approach, now dead since the JS no longer clears
  it) was removed - it was fully collapsing them regardless of the new `visibility` logic.
- **Boost-offer's two buttons (`Use boost` / `Stay stalled`) merged into the same shared
  `.action-row` as Roll/Confirm/Next player** rather than living in their own `#play-boost-offer`
  wrapper - per the report's instruction that everything but the grid stay fixed-height, having
  a whole extra wrapper div appear/disappear above the row was itself a source of vertical
  movement. `renderPlayButtons()` is now the single place deciding which of the five buttons
  in the row show (exactly one pair, or the lone Next-player, is ever visible - confirmed via
  `renderPlayButtons`'s existing mutual-exclusivity logic, unchanged).
- **New bug introduced by that merge, caught before commit:** with three states now sharing
  one row, the row's own height differed by ~5px between "Use boost/Stay stalled" (a
  primary+secondary pair) and "Roll/Confirm" or "Next player" (primary-only), because
  `button.primary` uses the Vollkorn display face and `button.secondary` doesn't - different
  font metrics, not something the existing padding/font-size unification (issue #3) touches.
  Fixed with an explicit `min-height: 4.3rem` on `#screen-play .action-row` (measured against
  the tallest real button), which combined with the row's default `align-items: stretch` also
  fixes a pre-existing few-px primary/secondary height mismatch as a side effect.
- **Confirmed by design, not a bug:** `#play-rack` remains the only height-responsive element
  (`flex: 1` in the `#screen-play` column), so a few px of difference in a sibling below it
  (e.g. the action-row states above) is absorbed by the rack's own flexed height rather than
  shifting anything's position - verified the rack's `top` position is invariant (measured
  `getBoundingClientRect()`) across every state combination tested, including toggling boost
  mode on/off mid-debug-session and switching between 9- and 12-tile racks.
- **Verified** via a temporary debug hook (removed before commit; dev-server port rotated to
  avoid a stale-cache re-serve, then reverted to 8123): rack `top` measured identical across
  pre-roll, rolled, boost-offer-pending, stalled, and boost-mode-off states; the 1-for-2 boost
  variant's longer wrapped text (`"...summing to X or Y"`) confirmed still fitting the existing
  `min-height` on a 375px-wide viewport; a full automated multi-player game (brute-force
  `RULES.isValidSelection`-driven solver) completed cleanly with zero console errors; both
  themes and both rack sizes screenshot-checked.

### 2026-09-15 — M14 brand pass: type, skins, player-accent chrome (docs/DevHandoff_BrandSpec_v2.dc.html + docs/PlayScreen_Redesign.dc.html)
Applied both handoff docs. Where they conflicted or left something unresolved, confirmed with
the user rather than guessing (see their answers below); everything else is a straightforward
application of the docs' explicit tokens/mockups.

- **Skins: 2, not 3.** BrandSpec v2 describes three skins (Brand - new default - Colorful,
  Monochrome, with Brand's 12 swatches spelled out); PlayScreen_Redesign's own skin-strip
  section shows only Colorful (labelled default) and Monochrome, and all three of its mockup
  frames use Colorful. Asked the user - confirmed 2 skins, Colorful stays default. `theme.js`'s
  `tileColors` moved to `skins.colorful.tiles` (verbatim, unchanged); no `skins.brand` was
  built. `activeSkin` is *not* stored in `theme.js` as BrandSpec's own token diff shows - it's
  `settings.skin` (storage.js), matching how `settings.theme` already works without a
  duplicate field in `theme.js`; `skin` is cosmetic-only in `queueSettingChange`, exactly like
  `theme`.
- **The "Overpay" pill in PlayScreen_Redesign's Frame C is the existing boost-earned toast**
  (showing "Overpay" as the awarded type's name), not a new `overpayFlipActive()` indicator as
  first read - the user corrected this directly. Per their answer: settings (icon-only cog,
  was a text button) + two permanent boost chips + the toast all now live in **one row**
  below identity (`.play-chrome-row`, replacing the old `.play-toprow` above identity and the
  separate `#play-boost-count` text row). Toast text is the boost type name only (no "Boost
  earned:" prefix); it may overlap the chips if it doesn't fit - not engineered around, per
  the user ("if it does so be it"). After a hold period the toast shrinks (width/opacity) and
  "merges" into its chip, which is when the chip's own count visibly jumps - implemented by
  holding the chip at its pre-award count for the hold+collapse duration (`boostToastState` in
  app.js, transient/UI-only, never persisted), then bumping it once the collapse finishes.
  `deliverPendingBoost` now records the awarded *amounts* per type (not just which types), so
  the held-back count is exact even for a rare same-type double-award, not a hardcoded -1.
- **Judgement calls the docs don't resolve** (flagged as open in BrandSpec's own "Open / needs
  a call" list, or simply unspecified) - made a reasonable choice and documented it here rather
  than blocking on it, per this project's own convention:
  - **Boost-toast timing**: 1200ms held + 280ms collapse (`BOOST_TOAST_DISPLAY_MS` /
    `BOOST_TOAST_COLLAPSE_MS` in app.js). Not specified anywhere; picked to read clearly
    without feeling sluggish, same "starting value, tune by feel" treatment as
    `config.js`'s `diceAnimationDurationMs`.
  - **Mono skin's 12-stop ramp**: BrandSpec explicitly flags "exact 12 L-steps + min delta-L"
    as unresolved. Implemented `monoRampTiles()` in app.js: HSL lightness ramp from L 82 down
    to L 20 across the 12 tiles (hue/saturation held from the player's own colour), edge one
    step darker (-14 L, floored at 8), ink flips from a hue-tinted dark shade to the shared
    cream (`#FBF5E9`) at L > 48. Reverse-engineered from PlayScreen_Redesign's own Teal mono
    swatch as a plausible target, not measured - revisit after a real readability pass.
  - **Crimson Pro tile-digit weight on dark fills**: BrandSpec flags this as needing an eyeball
    check before shipping. Checked across all 12 colorful-skin fills at 375px width - legible
    on every one, including the darkest (Denim `#3D7BC0`, Indigo `#6A5AC8`). No optical-weight
    bump applied.
  - **The old "No boosts for the last number" prose** (shown when only one open tile remains,
    so a boost can't help) is dropped - the new chip UI is icon+count only, no room for prose,
    and neither doc addresses this case. The underlying rule (last tile is always exact-only)
    is unchanged; only this hint text is gone.
  - Timer / `#play-message` (default state) / `#play-boost-offer-text` moved from a fixed
    `--accent-danger` red to the player accent (`.play-accent-text`) - explicit in
    PlayScreen_Redesign's Frame B/C mockups (the stalled/boost-offer prompt and the countdown
    both render in the player's colour there, not red). `#play-message.stalled`/`.notice`'s
    own colours are untouched - neither doc mentions changing those, and they predate this
    pass (issue #3).
  - Player identity colour (`THEME.playerColors`) stayed a flat hex array rather than becoming
    `{fill,edge,ink}` triples as BrandSpec's token diff shows - triples would change
    `storage.js`'s persisted roster shape (`p.color` is a plain string today) and break
    loading an existing roster. Instead `playerEdge()` (app.js) looks up the edge partner from
    `skins.colorful.tiles` by matching fill, since player fills are already, by construction,
    the same 12 hexes as that skin's tile fills, in order.
  - `#screen-play button.primary`'s player-accent override, and `.is-muted`, are scoped to the
    Play screen only (`#screen-play` prefix) - BrandSpec's own token diff shows an unscoped
    `button.primary` rule, but applying it globally would tint Setup/End's buttons with
    whatever `--player-accent` was last set (or nothing, pre-game). `.is-muted` is applied by
    JS (`renderPlayButtons`) always alongside `:disabled`, per the token diff's instruction,
    even though for the Roll/Confirm pair the two states are always identical in practice.
- **Found and fixed a real bug while verifying the mono skin**: `rgbToHsl()` returned
  saturation as a 0-1 fraction, but `hslToRgb()` divides its `s` input by 100 (expecting
  0-100) - every mono tile rendered desaturated grey regardless of the player's hue until this
  was caught by screenshot during verification. Fixed by scaling `s` to 0-100 in `rgbToHsl`.
- **Flagging, not fixing: player colour #3 ("Honey", `#E4BE2F` fill / `#9C7F16` edge) fails
  the light-theme 4.5:1 contrast target BrandSpec's own "Open" list calls out** - measured
  3.59:1 against the light background (`#f7f7f5`), the only one of the 12 that fails (all
  others clear 4.5:1). Not changed - this is a shared identity colour (same hex used for both
  player #3 and colorful-skin tile #3), and picking a new edge is a colour decision for the
  design track, not a code judgement call. Flagged for the orchestrator/design session.
  - **20th avatar**: confirmed with the user - left at 19 (config.js `avatarCount` untouched),
  no placeholder generated (CLAUDE.md bars mascot/character art; no source asset exists).
  - **Not built**: Frame B's mockup shows the *offered* boost type's chip with an emphasised
  border/background (distinct from the plain dimmed-at-0 treatment) while boost-offer is
  pending. Neither doc describes this in prose, only that one frame's inline styling - skipped
  to avoid over-fitting a single mockup detail; the two documented chip states (accent /
  dimmed-at-0) are built.
- **Verified**: temporary debug hook (removed before commit; dev-server port rotated during
  CSS/JS-affecting edits, reverted to 8123); Crimson Pro/Overpass loaded and applied at the
  right weights (`document.fonts.status`, computed `font-feature-settings`) with lnum/tnum
  confirmed; promoted/muted button swap confirmed across pre-roll, rolled-unselected, and
  valid-selection states; boost-toast hold -> collapse -> chip-bump sequence confirmed with
  precise millisecond-gated checks (not just screenshots, which are subject to tool round-trip
  jitter); mono skin colour-matches the active player after the `rgbToHsl` fix; light theme and
  the overpay XOR-flip both confirmed switching `--player-accent-text` between fill and edge
  correctly; Setup's new skin toggle confirmed live-updating a mid-game rack; a full automated
  multi-player game completed with zero console errors; the entire flow (roster -> setup ->
  turn card -> roll -> confirm) re-verified through real UI clicks (not just the debug hook)
  after stripping it, zero console errors.

### 2026-09-16 — M15 brand pass: launch/handoff/timeout/setup/dialog/results (docs/GameScreens_Redesign.dc.html)
Applied the whole rest of the flow per the redesign doc, which itself superseded an earlier
draft after a design-session pass. As with M14, confirmed the structural/rules-affecting
questions with the user rather than guessing; the rest is a straightforward application of the
doc's tokens/mockups.

- **The turn card's background architecture deliberately changed.** It used to fill the whole
  screen with the player's flat colour, independent of the site theme (a locked-sounding
  decision recorded in style.css's own comment). The redesign moves it onto the same dark/light
  themed surface as every other screen, with the player's colour now carried only by the avatar
  ring/glow and the name (`--player-accent*`, same mechanism as Play). Confirmed directly with
  the user before touching it ("the full colour player screen got changed, indeed"). The avatar
  itself also switched from the old full-uncropped-character art to the same circular head/bust
  crop as Play's `.avatar-btn`, just bigger, per the mockup.
- **Colour-role scope: new screens only, not retroactive to Play.** GameScreens_Redesign
  introduces a stricter "sand = system chrome, player hue = identity only, red = destructive
  only" rule, explicitly framed as fixing an "old mock reused a player colour... as a generic UI
  highlight" mistake - which is exactly what Play's settings cog/boost chips/promoted button do
  (per DevHandoff_BrandSpec_v2 Part 3 and PlayScreen_Redesign's own mockup). Asked the user
  directly: confirmed Play is unaffected and keeps its player-tinted chrome as shipped in the
  M14 pass; the new sand rule governs only the screens this doc covers (launch, turn card,
  timeout, setup/settings, confirm dialog, results). New tokens: `--accent-sand`/`-ink`/`-border`
  (system chrome), `--accent-amber-*` (a third, purely informational role for the "next
  lap/next game" and "dev" badges - not reused for sand's "active control" meaning), and
  `--accent-danger-fill` (a stronger red for a destructive button *fill* - `--accent-danger`
  itself is tuned as pale text-on-dark, e.g. the stalled message, and reads too low-contrast as
  a button background with light text on it).
- **Time challenge: visual redesign only, whole-match semantics unchanged.** The doc's Dev-tab
  label ("Per-turn countdown -> Timeout screen") and Timeout copy ("the turn passes... Pass to
  next player") describe a per-turn shot clock; the actual, current mechanic is a single
  countdown for the whole match that ends it entirely (`game.timeChallenge`, ticks continuously,
  `timeoutGame()` never resumes play). Confirmed with the user: restyle only, keep real
  semantics - Timeout's copy was rewritten to a match-over framing ("Nobody finished in time -
  the match ends without a winner"), both original buttons (Rematch/New game) kept instead of
  the mockup's single "Pass to next player". Per the user's request, the per-turn shot-clock
  idea itself isn't lost - it's flagged right here as a plausible **future alternative game
  mode** for the design/orchestrator track to pick up later, not something this pass builds.
  DECISIONS.md is the established channel for exactly this (see this file's own header) - no
  better mechanism exists in this project for a Code-session finding to reach the design track.
  The Dev tab's time-challenge control was still restyled (switch + stepper replacing a number
  input + "Set" button) since that's a pure UI change over the same
  `settings.timeChallengeSeconds` - `lastTimeChallengeSeconds` (a plain in-memory var, not
  persisted) remembers the last duration across an off/on toggle; 60s is the starting default
  the first time it's ever switched on (a judgement call, not measured, same tier as
  `config.js`'s other tunable-by-feel starting values).
- **Results screen has no per-player score column** - the doc itself marks this "Benched": the
  design is final but the rules engine has no scoring model at all (only finish order,
  `game.finishedOrder`/`p.place`), so a number would have to be invented. The mockup's own
  "Benched" note is real, user-facing UI (drawn inside the phone frame, not a design-only
  annotation) - built exactly that way rather than treated as an internal-only remark.
- **20th avatar / avatar-count claim**: the doc corrected itself here (now says "all 19 live in
  `app/avatars/`", matching the repo) - no further action, consistent with the earlier decision
  to leave `config.js`'s `avatarCount` alone. The colour+monogram fallback it calls for
  (`renderIdentityCircle` in app.js) is still real and needed, just for a different reason than
  the doc states: a roster entry has no `avatar` field at all until `assignAvatars()` runs at
  game start, not because source files are missing.
- **Dev tab: kept the existing dice-choice test instrument (1/2/ask), restyled but not
  replaced.** The mockup shows a different, more elaborate set of dev tools ("Roll d6" /
  "Force a value" isolated animation triggers, a "Jump to Results" shortcut) that don't exist
  today and aren't specified precisely enough to build without guessing at exact behaviour
  (what "force a value" forces, whether "jump to results" fabricates a fake finish order,
  etc.). Not built - flagged here rather than invented; the real, existing dice-choice control
  got the same switch/segmented-toggle restyle as everything else instead.
- **Other judgement calls, made and documented rather than blocked on:**
  - Confirm dialog's OK button now shows the actual action ("End match" / "Restart match")
    instead of a static "Confirm" - `confirmAction()` gained a `title`/`okLabel` split from one
    plain message string, matching the mockup's title/description layout.
  - Setup gained a real page title ("New Game" pre-match / "Settings" mid-match, with a
    subtitle) - there wasn't one before at all (`renderSetup` in app.js).
  - Roster colour swatches dim an already-taken colour (`.color-swatch.taken`) as a visual hint
    only, per the doc's own "taken hues are dimmed" wording - not an enforced uniqueness rule;
    the app has never had one, and the doc doesn't ask for one either.
  - The skin picker (Setup > App) upgraded from a plain 2-button segmented toggle to the
    mockup's mini-preview cards (swatch grid + checkmark) - `skinToggleGroupEl`'s JS now
    targets `.skin-card` instead of `.toggle-btn`.
  - Roster list's "Remove" text button became an icon-only X (`REMOVE_ICON_SVG`), and the tab
    bar's four icons were swapped to match the mockup's set (two-person/ruler/phone/wrench).
- **Verified**: temporary debug hook (removed before commit; dev-server port rotated during
  CSS/JS-affecting edits, reverted to 8123); full flow screenshotted in both themes - launch,
  roster add/remove with monogram fallback and taken-colour dimming, all four Setup tabs
  (including the skin-card picker and the time-challenge switch+stepper live-adjusting through
  a real countdown), the turn card's new accent-ring/glow layout, a live time-challenge
  countdown allowed to actually expire into the redesigned Timeout screen, the confirm dialog
  (icon/title/description/dynamic red label) in both themes, and the Results screen (trophy
  banner, ranked rows, Benched note) in both themes; zero console errors throughout; the full
  roster -> setup -> turn card -> roll flow re-verified through real UI clicks after stripping
  the debug hook.

### 2026-09-17 — M16: post-M15 bug reports (grid jump, button heights, turn card layout, dice-anim dev control)
Real-device bug reports from the M15 pass, root-caused individually rather than patched by
feel - each one measured before and after via a temporary debug hook, not guessed.

- **The dice-roll grid jump was never about the dice.** Measured `#play-rack`'s height across
  the whole animation window (50ms samples): the entire ~0.73px shift happens synchronously the
  instant `onRoll()` runs, then stays flat for the rest of the wobble/flash animation - so the
  animation itself was innocent. Root cause: `#play-selection-sum`'s `min-height: 1.2em` was
  ~0.7px short of the real rendered line height (Overpass at 0.9rem measures ~18px, 1.2em only
  reserves ~17.28px) - the exact same "estimated min-height, not measured" bug class as several
  earlier issues in this project, just small enough this time to hide behind the dice animation
  that happened to start at the same moment. Fixed by bumping to `1.3em`, re-verified as an
  exact 0px rack delta across the full animation window.
- **The boost-offer button-height mismatch was a real align-items:stretch failure, not a
  leftover font-metric issue.** Measured `getComputedStyle` on all four action-row buttons:
  "Use boost" (primary) stretched to the row's 68.8px, "Stay stalled" (secondary) sat at
  60.8px despite identical padding, font-size, and font-family (both Overpass since the M14
  pass removed the display face from `button.primary`) - `align-items: stretch` on the row
  (computed as `normal`, which should behave as stretch) simply wasn't equalizing a
  border-width-driven or other latent min-content difference between primary/secondary is
  buttons. Rather than chase the exact CSS engine behaviour further, switched to the more
  robust fix the report asked for: `#screen-play .action-row button` now gets an **explicit,
  identical `height: 4.3rem`** (not just padding/font-size matching + hoping stretch equalizes
  the rest) and becomes its own centering flex box (`display:flex; align-items:center;
  justify-content:center`) so text stays centered regardless of any remaining content-height
  slack. Re-verified: Roll/Confirm/Use boost/Stay stalled/Next player all measure exactly
  68.796875px in every state.
- **Turn card top area rebuilt to mirror Play's header/chrome-row *exactly*, not just
  conceptually.** Previously: settings top-right, timer top-left, no avatar/name up top - the
  reverse of Play's layout (identity left/timer right in `.play-header`, settings alone on the
  left in `.play-chrome-row` below it) and no anchor for the lone settings icon. Fixed by
  literally reusing `.play-header`/`.play-chrome-row`/`.identity-row` (a new class alias for
  `#play-identity`'s rules) and `.turncard-screen`'s padding now matches `#screen-play`'s
  exactly (only `padding-bottom` overridden, not a separate `1.25rem` side value) - so the
  avatar/name/timer/settings all land in the pixel-identical spot on both screens, confirmed via
  side-by-side screenshot comparison. The new mini avatar+name is decorative only (not
  independently tap-to-cycle - that stays on the big centered avatar, avoiding two ways to do
  the same thing) and reads `--player-accent-text` like everything else; the settings icon
  stays neutral, per M15's sand-vs-player-hue split.
- **New Dev-tab control**: a plain live-editable number input for
  `CONFIG.diceAnimationDurationMs` (ms), applied on the very next roll, no "Set" button -
  matches config.js's own "purely cosmetic... tune by feel" framing for this value already.
  Mutates `CONFIG` directly, not `settings`/localStorage (ephemeral, session-only, consistent
  with it never having been a persisted preference). `renderSettingsControls()` skips
  overwriting the field while it has focus, so a re-render mid-keystroke can't clobber typing.
- **Not built: "Player X had the highest score" on the Timeout screen.** The requested change -
  compute each player's progress (highest sum of closed tiles) and display that player's name,
  without showing the number - runs directly into a locked, explicitly "stop and report" rule
  in the milestone plan (D-02, plan §8): *"Remaining tile values never affect winning, are
  never displayed as a score, and never rank a player... If you are adding a visible number
  that represents remaining points, you are violating this rule — stop."* Picking which
  player's name to surface based on an internal points comparison **is** ranking a player by
  points, even with the digit itself withheld - the rule's own wording ("never rank a player")
  covers exactly this, not just the printed number. Flagged back to the user rather than
  built; the existing "ran out of time" copy (naming whoever's turn was live at the timeout,
  no ranking involved) is left in place pending their call - amend D-02 deliberately if they
  want this, or land it once the flagged future scoring iteration actually relaxes D-02.
- **Verified**: temporary debug hook (removed before commit; dev-server port rotated four times
  across this pass due to repeated browser HTTP-cache staleness on CSS-only edits, reverted to
  8123); rack-height and button-height deltas measured precisely via `getBoundingClientRect`
  before/after each fix; turn card and Play screens screenshot-compared side by side for exact
  corner alignment; a full automated multi-player game completed with zero console errors after
  stripping the debug hook.

### 2026-09-18 — M17: turn card reverts to a full-bleed player-colour background
Explicit user request, and a direct reversal of M15's own decision - noted here per this
project's convention for exactly this kind of drift between sessions.

- **Background**: `showTurnCardFor` (app.js) sets `turncardScreenEl.style.background = p.color`
  again, restoring the pre-M15 full-bleed treatment M15 had deliberately moved away from (see
  that entry above). The turn card is once again fully theme-independent - confirmed identical
  under `.theme-light` since nothing on it reads a dark/light token any more.
- **Chrome**: since the background is now an arbitrary saturated player colour rather than a
  dark/light surface, every element this screen reuses from Play (`.settings-icon-btn`,
  `.avatar-btn`, the plain-inherited `color` on the name `h1`s) needed a fixed, theme-
  independent treatment instead of the token/`--player-accent`-driven one M16 gave it. Rather
  than re-declare colour on each of those shared-class elements individually (and risk missing
  one, or leaking a change into Play, which uses the same classes), scoped an override of the
  underlying custom properties (`--fg`, `--text-dim`, `--text-soft`, `--border`, `--bg-subtle`,
  `--player-accent`) once on `#screen-turncard` itself - every consumer picks it up
  automatically, and custom properties don't leak sideways or back up the tree, so Play (same
  classes, same property names, different scope) is provably unaffected - confirmed by
  screenshot immediately after this change. `#turncard-name`/`#turncard-mini-name` dropped
  `.play-accent-text` entirely (that class means "the player's colour," which is now the
  background itself, not the text) and just inherit the section's plain white `color`.
- **Avatar**: enlarged (7.2rem -> 11rem) and switched from the oversized-image/head-crop
  technique (Play's small `.avatar-btn` still uses that) to a plain `object-fit: cover` fill.
  The source art is a full-body *square* image, so at 1:1 box proportions this shows the whole
  character with no cropping beyond what the circular mask itself clips at the very corners -
  matching "enlarge the circle so it fits the entire avatar" as closely as a circular frame
  around a square image can. Ring and glow read `--player-accent`, which the override above
  resolves to white - a same-colour ring on a same-colour background would have been invisible.
  The small top-left mini avatar (added in M16, explicitly *not* what this request called "the
  large avatar circle in the center") keeps its existing head/bust crop.
- **Verified**: temporary debug hook (removed before commit; dev-server port rotated, reverted
  to 8123); screenshotted across two different player colours to confirm the white ring/glow/
  text/chrome hold up regardless of hue, confirmed identical under forced `.theme-light`, Play
  screen screenshot-confirmed unaffected, and a full automated multi-player game (real button/
  tile clicks, not direct state mutation) completed to `screen-end` with zero console errors
  after stripping the debug hook.

### 2026-09-19 — GH issues #5 & #6
- **GH #5 (Use boost sits higher than Stay stalled)**: root cause was a completely different
  rule than the M16 button-height work touched. `.screen button.primary + button, .screen
  button.secondary + button { margin-top: 0.5rem; }` exists to space *vertically-stacked*
  button groups (`#setup-footer`'s Start/Back/Restart/End) - but `#screen-play .action-row` is
  a `.screen` descendant too, and "Stay stalled" is a `<button>` immediately following a
  `button.primary` sibling ("Use boost"), so the selector matched there as well and pushed it
  down 0.5rem *within* the horizontal row. Both buttons already measured the identical explicit
  height (4.3rem, from M16) - this was a pure position offset, invisible to a height-only
  `getBoundingClientRect` check, which is exactly why M16's verification passed while this
  survived. Fixed by extending the existing `.banner-actions` override (already added for
  End/Timeout) to cover `.action-row` too - neither ever wants stacking margin, both space
  their own buttons via flex `gap`.
- **GH #6, bullet 1 (stop collecting boosts once down to the last tile)**: guarded both award
  paths - `maybeAwardDryStreakBoost` returns early when `RULES.openValues(p.rack).length === 1`
  for that player, and `awardTrailingBoosts` skips entirely when every remaining player is
  already on their last tile (`maxOpen === 1`). The underlying rule (last tile is always
  exact-only, never boostable) is unchanged - this only stops a *new* credit from being banked
  in a situation where it could never help this game, matching the report's own reasoning
  ("would technically transfer to next round, but still confusing in the moment").
- **GH #6, bullet 2 (Play's settings icon shows in the player's colour, not the theme)**:
  removed `.play-accent-text` from `#settings-from-play` - it now just inherits the ambient
  `--fg`, i.e. white in dark theme / near-black in light theme, matching the turn card's
  settings icon (already theme-neutral since M15) rather than the player's own hue. This is a
  partial narrowing of the M15 "Play screen keeps all its player-tinted chrome" answer -
  settings specifically is chrome, not identity, same reasoning as every other screen's own
  sand-vs-player-hue split; the promoted button, boost chips, name, and message stay
  player-accented as already decided.
- **GH #6, bullet 3 ("white accents" not following the theme, e.g. "Roll")**: the promoted
  button's ink (`--player-accent-ink`) was a flat `THEME.playerNameTextColor` cream constant
  regardless of theme - the one text colour on this screen that never changed with light/dark.
  Added `body.theme-light #screen-play button.primary:not(.is-muted) { color: #241C10; }` (a
  literal dark colour, not `--accent-sand-ink` - tried that first, but that token flips the
  *other* way, cream in light theme, since it's tuned for sand's own fill going darker in light
  theme, not this button's situation at all - caught by checking its resolved value before
  trusting it, not by assuming the name matched the need). `:not(.is-muted)` keeps the muted
  sibling button's own `--text-dim` untouched. Scanned for other hardcoded/fixed-regardless-of-
  theme "white accents" on Play (tile selection outline, boost-chip-count, avatar ring) -
  everything else already reads a var that already flips correctly; this button ink was the
  one real instance.
- **GH #6, bullet 4 (settings icon should sit centered under the avatar)**: added
  `margin-left: 0.2rem` to the shared `.settings-icon-btn` rule (avatar-btn is 2.4rem wide,
  settings-icon-btn 2rem - half the difference centers one under the other, both rows sharing
  the same left origin). Shared class, so this centers it identically on both Play and the turn
  card (already centered under its own mini avatar there) without any per-screen scoping.
- **Verified**: temporary debug hook (removed before commit; dev-server port rotated across
  CSS-affecting edits, reverted to 8123); GH #5 reproduced in the exact reported state (boost-
  offer pending, light theme) and confirmed `topDelta: 0` via `getBoundingClientRect` after the
  fix; dry-streak and trailing-boost guards unit-tested directly (both correctly skip at exactly
  one open tile, both still award normally above that); settings-icon colour and button ink
  checked in both themes via `getComputedStyle` (white/black settings icon, cream ink in dark
  theme unchanged, `#241C10` ink in light theme); settings-icon horizontal centering confirmed
  via bounding-box centre comparison against the avatar (sub-pixel delta); a full automated
  multi-player game completed with zero console errors; turn card re-screenshotted to confirm
  the shared `.settings-icon-btn` change reads correctly there too.

### 2026-09-17 — GH #6 follow-up: settings icon still blue on real device
User confirmed the GH #6 position fix landed on the real device, but the settings icon still
shows blue - in Safari directly, not just the "Add to Home Screen" PWA, and after a full
close/restart/new-tab. Investigated before touching anything further:

- Confirmed the source (`#settings-from-play` has no `.play-accent-text` class, no inline JS
  colour, `.settings-icon-btn` sets no `color` of its own) and the *live deployed* file agree -
  fetched `https://dominikhilse.github.io/flip/app/style.css` directly and it already has the
  fix. `cache-control: max-age=600`, `age: 0` on that response - the CDN itself is serving
  fresh content, not a stale cached copy. Confirmed GitHub Pages' own settings deploy from
  `main` at `/`, matching what was fetched.
- This rules out "not actually deployed" and "CDN cache" as explanations, and a fresh Safari
  tab after a full restart makes a lingering client HTTP cache less likely too - none of it is
  proof positive, since real iOS Safari/WebKit behaviour can't be reproduced in this session's
  Chromium-based preview tooling at all, only reasoned about from documented behaviour.
- Added `-webkit-tap-highlight-color: transparent` to the global `button` reset as a defensive
  fix regardless of whether it's the actual cause here: iOS Safari's default tap highlight is a
  translucent blue overlay on any tappable element, this project had never reset it, and an
  icon-only button with a mostly-transparent background (`.settings-icon-btn`) is exactly the
  shape of element where that default would read as "the icon is blue" rather than a normal
  highlight. Every button already has its own `:active` state for real touch feedback, so this
  has no real downside either way.
- **Not confirmed working** - asked the user for a fresh screenshot before assuming this was
  the actual root cause, rather than declaring it fixed on a guess a second time.

### 2026-09-17 — PWA install wiring (manifest + head tags), adapted from Spudling
User added `app/assets/{icon-192,icon-512,apple-touch-icon}.png` (commit `ffb1e0d`) but nothing
referenced them yet. Asked to check how a sibling project ("Spudling") had implemented the same
thing, then apply the equivalent here.

Spudling's pattern (its M6.3 commit): a `manifest.webmanifest` (name/short_name/start_url/
display: standalone/background_color/theme_color/icons array) plus, in `<head>`, `<link
rel="manifest">`, `<link rel="icon">`, `<meta name="theme-color">`, and a separate set of
Apple-only tags (`<link rel="apple-touch-icon">` + three `apple-mobile-web-app-*` metas) kept
*alongside* the manifest rather than instead of it, since iOS's Add to Home Screen predates full
manifest.json support and has never fully honoured it for standalone launch or the icon. No
service worker was part of that commit either - manifest/icons and service-worker registration
are separate concerns there too.

Two adaptations for this project, not a straight copy:
- **All paths relative, no leading slash** (`manifest.webmanifest`, `assets/icon-192.png`, ...).
  Spudling is served from its domain root, so its absolute `/icon-512.png`-style paths resolve
  correctly there; this app is served from a subpath (`/flip/app/`), where the same absolute
  path would resolve to the repo root and 404. Matches the relative-path convention
  `app/index.html` already uses for `style.css`.
- **`start_url: "."`** rather than `"/"`, for the same subpath reason - `app/` is where the
  installable page actually lives (the repo-root `index.html` is a one-link splash into `app/`,
  not part of the installed experience).
- `background_color`/`theme_color` both set to `#111111` - the app's root/dark-theme `--bg`
  (`style.css`), which is also the launch screen's fixed background regardless of site theme,
  making it the closest thing this app has to a single "brand" chrome colour for a splash/status
  bar.
- No service worker added - locked constraint, and consistent with Spudling's own M6.3 scope.

**Verified**: served `app/` from the local dev server and confirmed via `fetch()` in-page that
`manifest.webmanifest` (200, `application/manifest+json`) and all three icon files (200) resolve
correctly relative to `app/`, and that `document.head` contains the expected tags; zero console
errors on load.

### 2026-09-19 — M18 clarification: "Confirm" is the existing button, unchanged; flow is additive

Before building M18, flagged to the user that its "Confirm commits the previewed boost" language
was ambiguous against the shipped code: today, `#play-confirm` is already hidden for the entire
`boostOfferPending` window, and `onBoostSpend` (bound to "Use boost") never touches tile selection
- it only resolves the *stall*, after which the player selects tiles and hits the same `#play-confirm`
as any other move. Also flagged that acceptance criterion 5 ("single-applicable-boost case unchanged
from today, resolved via Confirm") seemed to contradict a same-tap-commits reading of today's flow.

**User's clarification, settling both:** today's flow already *is* "Use boost → select tiles →
Confirm" even in the single-applicable-boost case - `onBoostSpend` was never a move-commit, only a
boost-type commit that unstalls the roll. M18 doesn't change `onConfirm` or that shape at all. It
only inserts an optional "Change boost" step, cyclable **before tile selection, after it, or
interleaved with it** ("select tiles, (still a change boost is possible, causing the user to have to
or being able to select other tiles)") - i.e. `boostSpentType` stays mutable right up until the
existing Confirm fires, same as it's always been the single source of truth
`currentSelectionValid`/dice-highlighting/the D-34 overpay theme-flip read every render.

**Implementation, built accordingly:**
- `selectBoostTypeToOffer` refactored (behaviour-preserving) to be the first element of a new
  `applicableBoostTypes(p, openVals, dice, total)` - the full ordered list (1-for-2 first) of held
  types that resolve this stall, computed once per roll and frozen on `game.currentRoll` for that
  roll's lifetime.
- `onBoostSpend` (Use boost) is untouched - still spends the default (first) type immediately,
  exactly as before D-56.
- New `onBoostChange` (Change boost): cycles `boostSpentType` through that fixed list, refunding the
  outgoing type's count and charging the incoming one - so the player's held counts are always
  correct no matter how many times they cycle. It does not touch `game.selected`; a selection that's
  no longer valid under the new type just fails `currentSelectionValid` (same "adjust and see" UX any
  other rule-driven invalidation already has), matching "having to select other tiles."
- `onConfirm` is **not modified at all** - it already only reads `boostSpentType` at the end, exactly
  as it did before M18.
- `#play-boost-change` takes `#play-roll`'s visible slot (Roll hidden instead) whenever a boost has
  been spent and more than one type is still applicable - preserves the existing "exactly one
  secondary control alongside Confirm" row shape instead of adding a third simultaneous button.
  Hidden whenever only one type applies, reproducing "unchanged from today" for that case exactly.

**Verified**: real-click walkthrough of both the two-type (cycle to overpay, confirm, inventory ends
correct: spent type debited, cycled-away type refunded to its original count) and one-type (no
Change-boost control, behaves identically to pre-M18) paths, zero console errors; a temporary
`window.__debug` harness then drove 6 full automated games (~280 turns, boost mode on, random
decline/spend/cycle mix) to completion via the real `onRoll`/`onBoostSpend`/`onBoostChange`/
`onConfirm`/`onPass` functions with zero errors and no dead-end states, before being stripped.

### 2026-09-19 — M18 bug: real-device reports traced to premature inventory decrement

Two real-device reports came in together: (1) a single-die stall on a 2-tile rack where the
confirmed move only made sense under an overpay boost, yet the 1-for-2 chip was what stood out
next to it; (2) with only one boost type actually resolving a stall, "Change boost" still
appeared and could seemingly spend a type showing a `0` count.

Root cause, one bug behind both: the initial M18 build decremented `p.boosts[type]` immediately
in `onBoostSpend`, then refunded/re-charged on every `onBoostChange` cycle. Whichever type wasn't
the *currently previewed* one always displayed its full original count, and the currently-previewed
one always displayed already-spent - correct only for the type actually confirmed, misleading for
everything shown *before* Confirm. Report (1) was never actually a 1-for-2 offer (single die
always excludes it, confirmed unchanged and correct in code) - the player misread the untouched
1-for-2 chip sitting next to a boost that had already visibly "spent" its overpay count, before
the move was even confirmed. Report (2) is the same premature-decrement made visible through
cycling instead: a real second held boost temporarily shows `0` because it's momentarily the
non-previewed side of the swap, not because it's actually unavailable.

**Fix:** `p.boosts` is no longer touched by `onBoostSpend` or `onBoostChange` - both now only set
`game.currentRoll.boostSpentType` (a preview/selection, not a commit). The single real decrement
moved into `onConfirm`, exactly once, for whichever type is selected at the moment of commit. The
permanent boost-count chips (M14) now show stable, accurate holdings through the entire Use boost
/ Change boost / reselect-tiles sequence, dropping only when a move actually lands - matching "Use
boost previews, Confirm commits" literally, not just in spirit.

Also fixed to match the user's spec: `#play-boost-change` uses the same `.primary` (player-accent)
styling as `#play-boost-spend`/`#play-confirm`, not the muted `.secondary` treatment used for
"Stay stalled" - it's an available action alongside Confirm, not a decline.

**Verified:** forced two-boost/one-boost scenarios directly on `game.currentRoll` - inventory
confirmed stable (unchanged) across Use boost and two Change-boost cycles, then debited by exactly
1, for the correct type, only at Confirm; single-applicable-boost case re-confirmed to still hide
Change-boost entirely. Re-ran the 6-game automated regression (~285 turns) with zero errors.
