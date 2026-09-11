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
