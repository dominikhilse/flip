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
