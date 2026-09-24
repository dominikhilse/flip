# Flip the Number — Prototype Milestone Plan

**Document status:** canonical milestone plan for the web prototype.
**Audience:** a Claude Code session with no prior context. Everything needed is in this file.
**Supersedes:** nothing. This is the first plan for this project.

**Revision note (latest pass — reconciling DECISIONS.md through 2026-09-20):** M18 and M19
status-flipped SPECIFIED → **BUILT, VERIFIED**, each with a shipped-reality note: M18's flow was
already "Use boost → select tiles → Confirm" (the change is an additive, cyclable "Change boost"; a
premature-inventory-decrement bug was found and fixed so counts only change at Confirm); M19 was
**reversed to fly OVER the chips, not under** (D-61), and falls back to shrink-in-place for the rare
double-award. Added **M-Maint** (GH issues #1–#6, two font swaps → Vollkorn Black / Overpass, PWA
install wiring — all chrome/packaging, no mechanics). Avatar set grew **19 → 36** (D-62). New
**M20 — avatar grid picker** specified: tap = cycle (unchanged), tap-and-hold = large modal grid,
own avatar = equipped checkmark, no dimming, **soft uniqueness** (sharing allowed), random-assign
stays default (D-63). The §6b parked mode-cleanup thought (launch-screen Timer/Boosts toggles,
overpay-D → Dev) remains parked, not built.

**Prior pass (reconciling DECISIONS.md through 2026-09-19):** large catch-up. M11,
M12, M13 status-flipped SPECIFIED → **BUILT, VERIFIED**. Four built brand/bug milestones folded in:
**M14** (brand pass 2 — 2 skins, the `.play-chrome-row` consolidation incl. the boost chips + earned
toast that M18/M19 operate on; **D-58**), **M15** (brand pass 3 — sand/hue/red colour roles on the
new screens, time-challenge restyle-only with whole-match semantics kept; **D-59**), **M16** (measured
bug fixes — another "estimated min-height" recurrence), **M17** (turn card reverted to full-bleed
player colour, reversing M15; **D-60**). Two new boost features specified: **M18** — player *chooses*
which boost to spend when both apply, via a one-button cycle-and-preview, a **deliberate, approved
partial reversal of D-36/D-37** (conservation kept as default, not enforced; **D-56**, D-37 superseded,
D-36 partially); **M19** — the M14 boost-earned toast refined to **travel into its type's chip** under
the chip layer, count-bump re-anchored to arrival (**D-57**, refinement not rebuild). §6a updated
(avatar/Flip question resolved; Honey-colour contrast fail and per-turn-shot-clock-as-future-mode now
the live design items). Avatar count corrected to **19 as shipped** (D-55). Two font swaps
(Bagel Fat One → Vollkorn Black; Figtree → Overpass) are noted but the plan does not pin a font name
(§7) — the current family lives in code, not here.

**Prior pass (reconciling DECISIONS.md 2026-09-12):** M7, M8, M9 all status-flipped
from SPECIFIED to **BUILT, VERIFIED**; M7's die-choice-on-differing-faces interpretation confirmed
correct (exact match to either die, no forced choice). A stricter whole-rack rule added (**D-48**):
a boost-spent move may never close the whole rack, not even on an exact match — corrects M6's
original enforcement, not just an M7 addition. Production single-die-endgame behaviour revised a
second time (**D-49**, supersedes D-42's production-facing part): the shipped game is now a **silent
single die once unlocked, no player-facing choice at all**; the old "1 or 2, changeable with a tap"
model survives only as a dev-mode testing affordance. Roster now **rotates by one seat after a
completed game** (win screen only, not timeout) plus **drag-to-reorder** in setup (**D-50**). **M10**
(dice roll animation) added. **M11** (navigation/escape-hatch fixes) added and fully resolved:
Pause button on Play reuses the existing tabbed screen; Restart resets boosts (New Game still
carries them forward); undo confirmed out of scope. **M12** (tabbed settings/menu redesign) written
against all four now-wireframed tabs (Rules/Players/App/Dev) — structural implementation now, skin
deferred to the brand drop landing the next day — with a stated resolution rule (prototype wins on
functionality the wireframe is silent on or conflicts with) applied to keep drag-to-reorder and the
full player-colour count, both flagged as mismatches for the design session; one new detail adopted
(time-challenge `0 = off`) and one factual correction flagged (the Dev tab's "not shown in shipped
build" claim, which this no-build-step project cannot actually deliver). **Brand track now RESOLVED
via the design session's dev handoff** — added as **M13** (brand/skin application + avatars): Flip
cut, name kept, Spudlings in as 20 pre-made avatar PNGs (random-assign + cycle) plus splash/wordmark;
new 8-CVD-safe + 4-graceful `{fill,edge,ink}` palette; Bagel Fat One + Figtree via network `<link>`;
closed-tile 3-cue redundancy; overpay XOR and turn-card/launch contrast unchanged (**D-53/54/55**;
supersedes D-13's Flip framing and D-32's avatar deferral). The brand brief's open fork is closed.

**Prior pass (reconciling DECISIONS.md 2026-09-11):** M4 cut (D-40); M6 closed
at single-type overpay scope and verified, with the two-type expansion split into a new **M7**
(specified, not started — D-41); new **M8** dev-mode tab (D-42) and **M9** time challenge (D-43)
added; the two-dice-force relocated to dev mode with §3.3 left unchanged; boost **earned-vs-granted**
timing folded in (D-44); the overpay "final tile" rule generalised to **whole-rack** exact-match
(D-45, §3.5/§3.6); the theme-flip predicate given its **last-tile carve-out** / invert-iff-overpay-
legal framing (D-34 revised); §3.6 restructured into the LIVE single-type spec plus §3.6b (M7,
not built); a reconciliation-stamp process rule added (D-46); and **M10 dice roll animation**
(face-cycle + optional shake, CSS-3D out of scope) added (D-47). Brand-track direction (Flip cut,
Spudlings carry the game) is being brainstormed into a separate brand brief and is **deliberately
NOT yet folded into this plan** — it awaits the design session's outcome before reconciliation.

**Earlier pass:** orientation lock removed; rest-to-flip debounce as an M0-tuned constant; overpay
restructured into an A/D toggle + boost checkbox; boost system typed; mid-game settings with
lap-boundary fairness; motion/tap mutual invariant; avatars and Flip/Spudling recorded as design
questions.

---

## 1. What this is

A pass-the-phone party game for 2+ players on a single device, based on the traditional
pub game **Shut the Box** (Normandy origin, public domain, also known as Klackers,
Canoga, Batten Down the Hatches). Game rules are not copyrightable; this is a clean-room
implementation of a traditional game.

The product name is **Flip the Number**. "Flip" is a mascot character who does **not**
appear in this prototype. Do not draw, generate, or reference a character. Tiles are
plain numerals on colour-coded backgrounds.

The phone lies flat on a table. Players sit around it. On each turn the current player
rolls, flips tiles, and passes the phone. The device's motion sensor is used to detect
whether the phone is lying flat, and to drive turn handoff automatically — but see §4,
motion is an accelerator, never a dependency.

---

## 2. Constraint envelope

**Platform target:** modern iOS Safari on iPhone 11 and iPhone 15. These are adult/parent
devices. There is **no** requirement to support the household's older iOS 12 devices, and
no requirement to support Android. Do not add polyfills or legacy transpilation for
devices outside this target.

**Stack:** plain HTML, CSS, and JavaScript. **No build step. No framework. No npm
install. No bundler. No TypeScript.** ES2020 syntax is fine on the target devices. The
deliverable is a set of static files that can be opened directly and served as-is.

**No server.** No backend, no API calls, no network requests at runtime. The game must
run fully offline once loaded.

**No service worker.** Not needed, and it adds failure modes.

**Storage:** `localStorage` for settings and for the player roster only. Wrap every access
in `try/catch` — Safari throws `SecurityError` under some privacy configurations. Never
store game-in-progress state; a reload starts a new game.

**Must not be touched or introduced:**
- No third-party libraries of any kind, including physics, animation, or dice libraries.
- No analytics, telemetry, or remote logging.
- No character art, mascot art, or generated imagery.
- No sound assets in this prototype (silent is acceptable; audio is a later milestone).

**Repo:** `flip`, at `/Users/dominik/Projects/GitHub/flip`. The folder and the GitHub repo
are created by the human before the session starts; the session will be pointed at the
folder. Do not create or rename the repo.

**Hosting:** **public** GitHub repo, served by **GitHub Pages**. This satisfies the HTTPS
secure-context requirement for motion (see §4) and gives a permanent play origin. Pages on
a private repo would require a paid GitHub plan; the repo is public instead, which is
acceptable because the project contains no secrets and no personal data.

**Consequence of a public repo — treat as a hard rule.** Do not commit real family or
child names anywhere: not as default players, not in test fixtures, not in comments, not in
`FINDINGS.md`. The player roster lives in `localStorage` and is never committed. Use
placeholder names (`Player 1`, `Player 2`) in all code and documents.

---

## 3. Game rules — complete and locked

These rules are decided. Implement them exactly. If a rule appears wrong or produces a
bad state, **stop and report** — do not adjust the rules.

### 3.1 Setup
- **Player count:** 2 or more. No upper limit enforced. Each player has a name and a
  colour.
- **Rack:** each player has their own independent rack of tiles, numbered `1..N`.
  `N` is **9 or 12**, chosen in settings. Default 9.
- All tiles start open. A tile is either **open** or **closed**. Closed is permanent for
  that player for that game.

### 3.2 A turn
1. The current player rolls. One roll per turn — **never a second roll in the same turn.**
2. Dice: **two dice** normally. See §3.3 for the single-die endgame.
3. The pip total is `T`.
4. The player must flip a set of open tiles whose values sum **exactly** to `T`.
   - **Any subset is legal.** With `T = 6` and tiles 1–9 all open, legal sets include
     `{6}`, `{1,5}`, `{2,4}`, `{1,2,3}`. There is no limit on how many tiles may be
     flipped in one turn.
   - The player chooses which legal set to use when more than one exists.
   - If at least one legal set exists, the player **must** flip one. Passing voluntarily
     is not allowed.
5. If **no** legal set exists, the player is **stalled**: the turn ends, the rack is
   unchanged, and play passes on. Being stalled does **not** eliminate the player and does
   **not** end their game. They roll again on their next turn.
6. Play passes to the next player in seat order.

### 3.3 Single-die endgame
- The single-die option **unlocks for a player when every one of that player's remaining
  open tiles is ≤ 6.** (This generalises correctly to the 12-tile rack: it unlocks once
  all tiles above 6 are closed.)
- **Production behaviour (revised — see D-49): once unlocked, the player rolls one die,
  silently, with no choice surfaced.** There is no toggle, no per-turn prompt, no tap-to-change
  in the shipped product. This supersedes the earlier "chooses one die or two, default one,
  changeable with a tap" wording — that model is **not** shipped; see the next bullet.
- **The interactive "choose 1 or 2 each turn" model exists only as a dev-mode testing
  affordance** (`devDiceChoice: 'ask'`, behind an off-by-default `devDiceTestEnabled` checkbox
  in M8's dev surface), used to hand-test both the one-die and two-dice code paths. It is not a
  production mechanic. The dev surface also allows hard-forcing `1` or `2` for testing.
- This rule is **mandatory, not optional, and must not be made a *production* settings
  toggle.** Reason: two dice cannot total 1. A player whose only remaining open tile is `{1}`
  can never close it with two dice, and since the win condition is closing every tile (§3.4),
  the game would hang forever. The single-die endgame is the only thing that guarantees a rack
  can always be finished — and the current production behaviour (always one die once unlocked,
  unconditionally) satisfies this trivially, since two dice are never rolled once unlocked in
  production at all.
- **The last-tile-is-1 safety net is unconditional and overrides every dev-mode setting,
  including a dev-forced `2`.** If a player's only remaining open tile is `1`, one die is
  forced regardless of any dev override. This is independent of, and stricter than, the
  production/dev split above.

### 3.4 Winning and placement
- **A player wins by closing every tile on their rack.** This is the only win condition.
- **Remaining tile values never affect winning, are never displayed as a score, and never
  rank a player.** There is no "score" in this game and no score UI. The sole permitted use
  of a player's remaining-tile sum is **internal**: it may be computed silently to decide
  boost eligibility in the boost overpay mode (§3.6, milestone M6). It must never be
  surfaced to players as a score or used for placement. If you are adding a visible number
  that represents remaining points, you are violating this rule — stop.
- Placement is **finishing order**: first player to shut is 1st, second is 2nd, and so on.
- When a player shuts their rack, they are finished and are **removed from the turn
  rotation.** Remaining players continue.
- **Placement mode setting**, applies at any player count:
  - **`winner-only` — DEFAULT.** The game ends the moment the first player shuts.
  - `top-two`. The game ends when the second player shuts.
  - `all-places`. The game ends when the **second-to-last** player shuts. The single
    remaining player is awarded last place without having to finish. Do not make the last
    player grind out a solo rack.
- Note the degenerate case: with exactly 2 players, `all-places` and `winner-only` end at
  the same moment. This is correct; no special handling needed.

### 3.5 Overpay (flow control)
Overpay changes what counts as a legal move. Without it, a turn is legal only if a subset of
open tiles sums **exactly** to the roll total; otherwise the player stalls (§3.2). Overpay
relaxes that. It exists because testing showed the strict endgame stretches out, while full
overpay flows fast but feels loose. The setting lets the human dial between the two.

**The overpay control is a two-part setting, not a slider:**
- **Overpay toggle — `A` (strict) / `D` (overpay). Default `A`.**
  - **`A` — strict.** Rules exactly as §3.2. A legal move must sum exactly to the roll total.
    Stalling is frequent, especially in the endgame. The rigorous feel.
  - **`D` — overpay.** A move is legal if a subset of open tiles sums to **any value ≤ the
    roll total** — the player need not consume the whole roll. Nearly eliminates stalling.
    **Mandatory exception, established in testing: a selection that would shut the whole rack
    must be paid exactly** — overpay may not close every remaining tile at once, however many are
    open, or the endgame loses all tension. (This generalises the earlier "final remaining tile"
    singular wording, which had an exploit at rack sizes >1; shipped commit `f262a7d`. A strict
    subset leaving ≥1 tile open keeps the normal overpay ≤ total rule.)
- **Boost checkbox — available only while the toggle reads `A`.**
  - When the toggle is `A`, the boost checkbox is interactable. Checked = the game runs the
    **boost mode** (strict base play plus earned overpay boosts, §3.6).
  - When the toggle is flipped to `D`, the boost checkbox **greys out and its value is
    ignored** — it does not error. The reason the *overpay boost* is meaningless under `D` is
    that `D` already grants overpay to everyone for free (§3.6 explains the scope precisely;
    this is a property of that one boost type, **not** a rule that `D` forbids boosts).

**The three reachable states are therefore:** `A` (strict), `A` + boost (the boost mode of
§3.6), and `D` (overpay). There is deliberately no "`D` + boost" state in the MVP, because both
MVP boost types are redundant under `D`. Future boost *types* whose effect is not redundant
under `D` are not precluded (§3.6).

**Naming note:** there is no `B` button. "Boost mode" means "overpay toggle = `A` with the boost
checkbox on" — an emergent state of two controls. The single-type overpay boost of this mode is
M6 (live); the two-type expansion is M7.

### 3.6 Boost system (strict base + earned boosts)
The boost mode is strict base play (exact-sum, as `A`) plus earned, spendable **boosts** that
let a struggling player rescue a stall. It is the comeback mechanic that keeps trailing kids in
the game. Reached via the overpay toggle = `A` with the boost checkbox on (§3.5).

This section describes the **single-type overpay boost that is LIVE and VERIFIED (milestone
M6).** The **two-type expansion** (adding the 1-for-2 boost, a typed inventory, auto-select, and
per-type reward pools) is specified separately in **§3.6b and built in M7 — it is NOT yet built.**
What ships today is the single overpay type only.

**The overpay boost (LIVE — M6):**
- One overpay boost grants **one overpay move** — flip a subset of open tiles summing to **any
  value ≤ the roll total** (voids some pips), spent to resolve a turn that would otherwise stall.
- The holding is modelled **typed even now** — `boosts: { overpay: n }` — so the M7 expansion is
  additive, not a schema change. **Cap: 3 total.**
- The overpay boost is only meaningful under strict base play (`A`), because `D` already grants
  free overpay. This is why the boost checkbox is A-only (§3.5). It is a property of *this type's
  effect being redundant under `D`* — **not** a rule that `D` forbids boosts. **Never write "D has
  no boosts."**

**Spending (LIVE — M6):**
- **One boost per turn, no chaining.**
- **Offered, never force-spent.** When a player would otherwise stall and holds ≥1 overpay boost
  that would actually resolve this stall, the game shows a single **spend-or-stay** choice ("Spend
  a boost / Stay stalled"). Declining leaves them stalled, boost retained.
- **May not close the whole rack** (see the whole-rack rule below).

**Whole-rack exact-match rule (LIVE — M6, shipped commit `f262a7d`).** Overpay may **not close a
selection that would shut the entire rack.** The exact-match requirement applies to *any* selection
covering every currently-open tile, however many that is — not only when a single tile remains. A
strict subset (leaving ≥1 tile open) keeps the normal overpay ≤ total rule; an exact whole-rack sum
still legitimately finishes the game **when no boost is being spent.** This supersedes the earlier
"final remaining tile" (singular) wording, which had an exploit: with 2+ tiles open, one big
overpaid roll could close them all at once, losing the endgame tension the rule exists to protect.
The UI shows "Closing the whole rack needs an exact match — exclude a tile to overpay instead." when
a selection hits this case.

**Boost-spent moves may never close the whole rack — stricter than the rule above, no exception
(LIVE — M6, corrected).** A move made **by spending a boost, of either type**, may never be the move
that shuts the entire rack — **not even on an exact match.** This is stricter than the whole-rack
rule above (which governs plain, non-boost overpay, where an exact whole-rack match is fine) and
sits alongside it, not in place of it. The principle: **a boost may advance a player, but must never
be the move that finishes their rack.** This was found live via the 1-for-2 boost (a 5-total roll on
{4,1} was being offered and let through, finishing the game), but the fix generalizes to the overpay
boost too — the original M6 implementation only enforced "must be exact to close the whole rack,"
not "may not close the whole rack at all," for boost-spent moves. Both the **offer** (a boost is
never offered when it would only be usable to close the whole rack) and the **confirm** (a whole-rack
selection is rejected outright whenever a boost is being spent, before any per-type shape check)
must enforce this — a single, type-agnostic guard, not two that could disagree. The player sees why
("closing the whole rack can't be done with a boost" or equivalent) rather than a silently-disabled
Confirm.

**Boost lifetime (LIVE — M6):** held in the in-memory roster, stacking across replays **within one
app session only.** Fresh app launch → everyone at zero. No cross-session persistence, no stored
identity.

**Award criteria (LIVE — M6) — a boost is awarded when either fires:**
1. **Dry streak.** The player has **not had three clean (legally resolvable) rolls within their
   last 5 rolls.** Evaluated per player on each of their rolls, over their own rolling window of 5.
   (A "clean roll" is one where a legal exact move existed, boost or not.)
2. **Trailing at a finish.** The moment any player shuts their rack, the player with the **most
   tiles still open** is awarded a boost. Ties: all tied players get one. Reads remaining-tile
   counts internally, permitted by §3.4.

**Earned vs granted timing (LIVE — M6).** These two moments are deliberately distinct:
- **Earned** = the instant an award criterion fires (which for a dry streak is the end of the
  earning player's own turn).
- **Granted** = the moment the credit is delivered into the player's spendable inventory and
  **announced** — deliberately the **start of that player's next turn**, the first moment it can
  actually be used. Announcing at the earned moment was confusing: the player was told "boost
  earned" with no way to spend it until their next turn anyway.
- §3.6's visibility rule ("announced when granted") refers to the **granted** moment. The live
  behaviour — bank a credit when earned, deliver + announce at the start of that player's next turn,
  capped at the max held, silently dropped if the game has left boost mode before delivery — is
  correct and needs no change.

**No eligibility floor (LIVE — M6).** The leader is **not** excluded from earning boosts. If the
front-runner is stalling, the game is dragging — a boost there speeds it toward an end.

**No re-earn on spend (LIVE — M6).** A player is not awarded a boost on the same turn they spend one.

**Visibility (LIVE — M6):** each player's boost count is visible on their own screen; every award is
announced on screen at the **granted** moment.

**Tunable after playtest (LIVE — M6):** dry-streak ratio; whether criterion 2 fires mid-game rather
than only at a finish. Labelled starting points in `config.js`.

### 3.6b Two-type boost expansion — SPECIFIED, NOT YET BUILT (M7)
This expansion is **fully specified but deliberately not built** — see the M7 milestone and the
DECISIONS.md note. Do **not** start it unprompted; the orchestrator finishes the design pass first.
Everything in §3.6 (LIVE) remains as the base; M7 layers the following on top.

**Second boost type — 1-for-2.** Grants one move that **ignores one whole die** and plays the other
die as a single value (voids a *whole die*, vs overpay's *some pips*). E.g. rack {3,7,8,9}, roll 3+3
(total 6) stalls under strict rules; 1-for-2 lets the player play a single 3 and close the {3}. Also
a stall-rescue, holder-spent, self-affecting — no targeting, no durations, no inter-player effects.

**Typed inventory.** `{ overpay: n, oneForTwo: m }` (the LIVE build already models it typed). **Cap
3 total across both types** (not 3 each); the types compete for the same 3 slots. Both MVP types are
A-only (redundant under `D`); a future type not redundant under `D` may be offered under `D`.

**Auto-select spend (no picker).** At a stall, compute which held types would resolve *this* stall.
If both an overpay and a 1-for-2 would, auto-select the **1-for-2** (the weaker, less versatile
boost) to **conserve overpay**. If only one would, select it. If none would, no offer. This is
provably total: overpay's reachable set (subset ≤ total) is a superset of 1-for-2's (a single die's
value is always ≤ the two-die total), so whenever 1-for-2 resolves a stall, overpay does too — the
branches are: both → 1-for-2; only-overpay → overpay; neither → no offer. Still a single
spend-or-stay choice; the offer **names** the auto-selected type. Accepted by-design edge case: a
player who could reach a marginally better rack state by spending overpay instead does not get to
choose — conservation of the stronger boost wins.

**Reward model — per-type criteria pools.** Each type owns its own criteria pool; pools may overlap.
When a fired criterion is shared by more than one type, the awarded type is chosen by a
**configurable distribution variable** (default 50/50; any split allowed). MVP config: both types
share the §3.6 criteria, so every award is a 50/50 roll. The per-type-pool machinery exists but is
not exercised with divergent criteria until later.

**Visibility (M7).** The inventory display becomes **type-aware** (how many of each type, not one
count — the current "Overpay boosts: N" counter must change), and each award announcement **names the
type** awarded (the 50/50 outcome is a rule-affecting event the player must see).

### 3.7 Dice
- Standard uniform random 1–6 per die. Use `Math.random()`. No seeding, no determinism
  requirement in this prototype.

### 3.8 Motion toggle
- A settings toggle, **ON by default**, controls whether the motion mechanic is active.
- **ON:** the game behaves per §4 — moving/lifting the phone shows the current player's turn
  card, resting it flat resumes/advances play. The pass-on-the-table experience.
- **OFF:** motion is ignored entirely. Players may hold the phone in any position and pass it
  freely; the game never hides the rack or interrupts on movement. No permission is requested
  while OFF.
- OFF is not a separate code path — it forces the tap-only handoff (§4.1). There must not be a
  second turn-advance implementation.

### 3.9 Tap-to-proceed toggle and the "always one path" invariant
- A settings toggle, **tap-to-proceed**, controls whether tapping the turn card advances it.
  **Default OFF in the final build; default ON during development** (it keeps the game fast to
  test). Ship the final default as OFF.
- **Mutual constraint with motion — they can never both be effectively off.** A game must
  always have at least one way to advance a turn. Two parts:
  - **UI-level:** turning motion OFF forces tap-to-proceed ON, and turning tap-to-proceed OFF
    forces motion ON. The user can have both on; they cannot set both off.
  - **Runtime invariant (this is the important one):** tap-to-proceed becomes **effectively
    available whenever motion is not actually delivering** — whether motion is toggled off,
    permission was denied, or the sensor is absent — *even if the user's tap-to-proceed
    preference is OFF*. Formally: `effective_tap = user_tap_preference OR (motion not currently
    working)`. This guarantees a turn can always be advanced, including when motion fails
    mid-game. It is a safety fallback the user may not see reflected in the settings screen,
    and that is intended: the settings toggle records preference, the effective state
    guarantees playability.
- Both toggles resolve to the same single tap handoff path (§4.1); neither introduces a second
  turn-advance implementation.

### 3.10 Changing settings during a match
The settings menu is reachable **during a game** (it opens from a player's turn screen), and
some changes take effect **without restarting the match.** Settings differ in how safe they are
to change mid-game, so each is tagged one of three kinds.

**The three kinds:**
- **immediate** — the change writes straight to the live game and takes effect at once, even
  mid-turn. This is correct for **input-path preferences that carry no fairness stake** (motion,
  tap-to-proceed): they change *how a turn is advanced*, not *what a legal move is*, so there is
  no reason to defer them and deferring would just feel unresponsive.
- **live-at-end-of-lap** — the change is accepted immediately but **applied at the start of the
  next lap.** A lap boundary is defined by **seat order, anchored to the earliest active seat**
  (P1, or the earliest player who hasn't finished) — *not* by the requesting player's seat. So a
  change requested mid-P3's-turn rides out under the old rules through P3 and P4, then lands when
  it is next P1's turn. This is a **fairness rule:** if overpay flipped A→D mid-lap, some players
  would have played that lap under A and others under D. Deferring to the lap boundary keeps
  everyone on one ruleset per lap. This applies to **rules-affecting settings only.**
- **blocked-until-next-game** — the control is **visibly disabled** during a match (greyed, with
  a short "applies next game" note — disabled and labelled, **not hidden**, so a parent looking
  for it doesn't think it's missing). Takes effect only when a new game starts.

**Tags:**
| Setting | Mid-game | Reason |
|---|---|---|
| Placement mode (winner-only / top-2 / all-places) | **live-at-end-of-lap** | Rules-affecting: changes the end condition |
| Overpay toggle (A / D) | **live-at-end-of-lap** | Rules-affecting: changes move legality (flipped tiles untouched) |
| Boost checkbox (on/off, A only) | **live-at-end-of-lap** | Rules-affecting: turns the boost mode on/off |
| Motion toggle | **immediate** | Input-path preference, no fairness stake (respect the §3.9 invariant) |
| Tap-to-proceed toggle | **immediate** | Input-path preference, no fairness stake (respect the §3.9 invariant) |
| Rack size (9 / 12) | **blocked-until-next-game** | Racks are already built and half-flipped; no coherent in-place change |
| Add / remove player | **blocked-until-next-game** | Same class as rack size — corrupts the match in progress |

Rack-size and roster changes are **not needed mid-game** and are explicitly blocked. The
rules-affecting settings (placement, overpay, boost checkbox) defer to the lap boundary; the
input-path toggles (motion, tap) apply immediately.

### 3.11 Theme flip as the overpay signal
Light and dark themes both exist and are user-selectable. In addition, **the theme inverts to
signal that overpay rules are in play** — this is the visible, non-silent indicator that the
rules have relaxed (the same "a rule-changing mode must announce itself on screen" principle
that killed the cut mode C). When overpay is active the selected theme flips to its opposite
(light→dark or dark→light); when overpay is not active it shows the user's selected theme.

**The signal has two triggers with two different lifetimes — build both:**
- **Mode `D` → sustained inversion, but only while overpay is actually available to the current
  player.** While overpay-`D` is the active ruleset, the theme stays inverted (respecting the
  lap-boundary timing, §3.10) — **except** it momentarily drops for the turns where the current
  player is down to **one open tile**, because there overpay cannot apply (the whole-rack
  exact-match rule, §3.5/§3.6), and a sustained inversion would falsely signal "you can overpay
  now." It returns once they have more than one tile open again. Shipped commit `077dc7d`. This is
  an ambient "you are playing in overpay mode" cue, not a per-move flash.
- **Boost spend → momentary inversion.** A boost is a per-move event, not a mode, so its signal
  is momentary: the theme inverts **for the duration of the overpay move a boost pays for**, then
  reverts. It does not persist, because nothing is "in overpay" between boost-spends.

**Do not** invert the theme merely because a given roll *happens* to be overpay-resolvable, or
during the stall/boost-offer decision before a boost is actually spent. The clean framing: **the
theme is inverted exactly when an overpay move is currently legal for the current player.** That
makes the last-tile carve-out fall out automatically (overpay is illegal at one tile open), rather
than being a special case. The predicate is: **(mode `D` active AND the current player has more
than one tile open) OR a boost overpay move in progress.**

**Deliberately theme-independent surfaces** (keep their own fixed high-contrast look, do not
flip): the turn card (carries the player's colour), the launch/title screen (fixed dark), and
the boost-award banner (fixed gold). Flipping these fights their purpose.

---

## 4. Motion, orientation, and turn handoff — architecture

Read this section fully before implementing M3. Getting the architecture wrong here is the
main way this project goes bad.

### 4.1 The core principle
**The turn card is always advanceable by tap. Motion only automates that tap.**

There must be exactly one code path for advancing a turn. Motion detection calls the same
advance function a tap calls. Consequences, all intended:
- If motion permission is denied, the game is fully playable.
- If the device has no accelerometer, the game is fully playable.
- If the M0 spike fails outright, the game is fully playable.
- There is no "fallback mode", no `motionEnabled` branch in game logic, and no duplicated
  turn-advance code. Motion is a listener that fires the same function a button fires.

### 4.2 iOS motion access — known constraints
- `DeviceMotionEvent` / `DeviceOrientationEvent` on iOS require a **secure context
  (HTTPS)**. A plain `http://` LAN address will not work. This is why the hosting decision
  in §2 blocks M0.
- iOS requires `DeviceMotionEvent.requestPermission()` to be called **from inside a real
  user gesture handler** (a tap). It cannot be called on page load.
- **Permission is granted per origin.** A permission granted on an ngrok URL does **not**
  carry over to a GitHub Pages URL. They are different origins.
- Verified precedent: a previous project in this household successfully read motion data
  on the same class of device, served over HTTPS via an ngrok tunnel, with
  `requestPermission()` behind a tap. The mechanism is known to work. What is **not**
  verified is behaviour on the final play origin — hence M0.

### 4.3 Orientation — no lock (revised after M4 testing)
- **The game does not lock or enforce an orientation.** Portrait was tested on-device during
  M4 and felt fine; the handoff worked without any landscape lock. The final orientation and
  layout are a **design-session decision** (external Claude Design), not fixed here.
- **Do not add a screen-orientation lock.** The earlier plan locked landscape defensively; M4
  testing showed it is unnecessary and portrait plays well. Removing it does not contradict the
  sensor physics below — the handoff never depended on reading orientation while flat.
- **The handoff feel is now a locked, verified thing (D-26); orientation is downstream of it.**
  A gentle shove of the phone from one player to the next is enough to swap the view to the new
  player, and a slight lift-to-peek-then-rest is the intended flow. If a future design decision
  wants a fixed or locked orientation for layout reasons, that is allowed **only if verified
  not to disturb this shove/lift handoff feel** — the feel wins, the orientation choice yields.
- **Sensor fact, still true and still the reason no yaw detection is attempted:** when the
  phone lies flat, the accelerometer **cannot distinguish one flat rotation from another** —
  gravity points straight down and rotation about the vertical axis does not move the gravity
  vector. Do not attempt to detect the phone being spun on the table. Orientation is only
  unambiguous while the phone is tilted (during a lift/shove), which is exactly when the
  handoff reads it.

### 4.4 Flat detection and the rest-to-flip delay
- Flat is detected from the gravity vector: z-component dominant, x and y near zero.
- The **rest-to-flip delay** — the pause between the phone coming to rest and the view flipping
  from turn card to game view — is a first-class tuning constant. M4 testing found the current
  value **too long**: a child was able to tap the screen before it flipped. It must be
  shortened to beat a fast tap, without becoming so short that a table bump or a hand resting
  nearby flips the view early.
- **Every threshold here is UNMEASURED.** Do not invent values or write estimated numbers as if
  tuned. Specifically unmeasured:
  - the gravity-z threshold that counts as "flat"
  - the x/y magnitude tolerance
  - the motion magnitude that counts as "still" versus "being moved"
  - the **rest-to-flip delay** (the debounce before a rest is acted on and the view flips)
- All are measured in M0 (see the M0 debug slider for the rest-to-flip delay) and written into
  a single `config.js` as named constants, each with a comment recording the date and device
  measured on.

---

## 5. Milestones

Each milestone is a separate executor session. Do not start the next before the human has
verified the previous one by hand.

---

### M0 — Sensor and origin spike

**Goal.** A one-page static test harness, deployed to the **real play origin**, that
proves motion works there and produces the measured constants the rest of the project
depends on.

**Scope.**
- A single HTML file with a "Start" button that calls `DeviceMotionEvent.requestPermission()`.
- Live on-screen readout of raw gravity x/y/z and total motion magnitude.
- A visible "FLAT / NOT FLAT" indicator driven by a threshold that the tester can adjust
  on screen with a slider.
- A large on-screen log of the last 20 flat/not-flat transitions with timestamps.
- **A second on-screen debug slider for the rest-to-flip delay** (added after M4 testing).
  Live-adjustable on the phone, showing the current value numerically, controlling how long
  after the phone comes to rest the harness registers a "settled" event. This slider is an
  **instrumentation tool only and must not ship in the game** — the value it lands on is
  written into `config.js` as a measured constant.
- Deployed to GitHub Pages (**not** to ngrok — see risks).

**Site structure — established in M0 and kept for the life of the project:**
- `/index.html` is a **neutral landing page**, not the game and not the harness. Clean white
  background, one centred outlined button, nothing else. No project name, no game name, no
  description, no favicon beyond the default. The button navigates to the app.
- The app lives at a sub-path (e.g. `/app/`). In M0 that sub-path holds the sensor harness;
  from M1 onward it holds the game.
- Rationale, stated so it is not misread later: this is **not** a security measure. A public
  repo is fully browsable and the game is trivially discoverable regardless. The landing
  page exists because it is the future launch page, and because it keeps a diagnostic
  readout off the root URL.
- Button styling: a **solid dark outline**, not a hairline grey border — a thin light border
  on white fails contrast.
- The landing button **cannot** serve as the motion-permission gesture. Permission must be
  requested from a gesture on the page that installs the motion listener, so the app page
  keeps its own explicit "Tap to start".

**Out of scope.** Any game logic, tiles, dice, or players. Any styling of the landing page
beyond the single button. This is instrumentation only.

**Acceptance criteria — all hand-checkable on the actual phone:**
1. Opening the play-origin URL on the phone and tapping Start produces the iOS permission
   prompt, and after granting it, numbers on screen change as the phone is moved.
2. Laying the phone flat on a table shows FLAT. Picking it up shows NOT FLAT. Doing this
   ten times gives the correct reading ten times with no false flips.
3. Setting the phone down gently and setting it down firmly both settle to FLAT within a
   second, with no flicker in the transition log.
4. Resting a hand on the table next to the phone, and a normal table bump, do **not**
   trigger NOT FLAT.
5. **Persistence check:** fully close Safari, reopen the same URL, tap Start. Record
   whether the permission prompt appears again or motion flows immediately. Either result
   passes — this is a fact-finding step, not a pass/fail gate. Write the answer down.
6. Slowly lift the phone, turn it around, and set it down. Record whether device orientation
   is readable during the lifted portion. Write the answer down. (Orientation is no longer
   locked — §4.3 — but this fact still informs the handoff.)
7. Opening the root Pages URL shows a white page with one centred outlined button and no
   text identifying the project. Tapping it loads the harness.
8. **Rest-to-flip delay bounds (added after M4).** Using the debug slider, find a delay that
   is (a) short enough that a fast tap right after the phone settles cannot beat the flip, and
   (b) long enough that a table bump or a hand resting on the surface nearby does **not**
   trigger a false settle. Record the value. **If no single value satisfies both — i.e. the
   shortest bump-safe delay is still slow enough to out-tap — that is a stop condition**
   (see below): the flip needs a different trigger, not just a shorter delay.

**Deliverable beyond the harness:** a short `FINDINGS.md` recording the measured
thresholds, the phone model and iOS version, the date, and the answers to criteria 5 and 6.

**Risks.**
- Testing on ngrok instead of the real origin would validate the wrong origin, since
  permission is per-origin. If ngrok is used for convenience during development, the
  acceptance run must still happen on the play origin.
- Free ngrok URLs are ephemeral and time-limited. Fine for inner-loop iteration, unusable
  for a game handed to children.

**Stop conditions.**
- If the permission prompt never appears on the play origin, **stop.** Do not work around
  it, do not fall back to ngrok as the permanent answer, do not disable the feature. Report
  the exact URL scheme and browser behaviour observed.
- If flat detection cannot be made stable within the acceptance criteria, **stop and
  report the noise characteristics.** Do not compensate with a long debounce that makes the
  game feel sluggish.
- **If the rest-to-flip bounds cross** (criterion 8 — no delay is both tap-proof and
  bump-safe), **stop and report.** The fix is a better settle trigger (e.g. requiring flat
  *and* a short stillness confirmation, or gating on the motion-magnitude threshold), not an
  arbitrary delay value. Do not just pick a number and move on.

---

### M1 — Rules engine and single-rack play

**Goal.** One rack, one player, fully correct Shut the Box rules, playable by tap. No
motion, no turn passing, no settings.

**Scope.**
- Rack of 9 tiles, all open.
- Roll button; two dice rendered with their values and the total.
- Tile selection: tap tiles to select, running sum displayed, Confirm enabled only when
  the sum equals the total exactly.
- Full-subset flipping per §3.2.
- Stall detection: if no legal subset exists, say so clearly and offer "Roll again"
  (standing in for the pass that arrives in M2).
- Single-die endgame per §3.3, including the one-die/two-dice choice with one die default.
- Win state when all tiles are closed.
- Tile appearance driven by a **theme config object** — colour per tile number, read from
  a single `theme.js`. **No hex literal anywhere in the game code.** Tiles show plain
  numerals. This hook exists because tiles are the intended customisation surface later;
  do not build any customisation UI now.

**Out of scope.** Multiple players, turn handoff, motion, settings screen, animation
polish, sound, any character or mascot art. Reason: the rules engine is the thing most
likely to have subtle bugs, and it should be verifiable in isolation before anything is
layered on it.

**Acceptance criteria — checkable by playing, not by reading code:**
1. Rolling a 6 with all tiles open allows me to close `{6}`, or `{1,5}`, or `{2,4}`, or
   `{1,2,3}` — I can perform each of these in separate games.
2. Selecting tiles that do not sum to the total leaves Confirm disabled.
3. I cannot select an already-closed tile.
4. When a roll has no legal move, the game tells me I am stalled and does not let me flip
   anything.
5. Once every open tile on my rack is 6 or lower, a one-die/two-dice choice appears,
   defaulted to one die.
6. Playing until only tile `1` remains, I can still close it using one die, and the game
   declares the box shut.
7. There is no score shown anywhere at any point.

**Risks.** Subset-sum over up to 12 tiles is trivially small; if any performance
workaround is being considered, that is a signal the approach is wrong.

**Stop conditions.** If the rules as written in §3 produce a state where a player can
neither move nor ever finish, **stop and report the exact rack and roll.** Do not patch the
rules.

---

### M2 — Multiplayer, turn passing, and settings

**Goal.** n players passing the phone by tap, with the settings that shape a match.

**Scope.**
- Player setup: add players, each with a name and a colour chosen from the theme palette.
  2 or more, no upper limit. Roster persisted in `localStorage`.
- Independent rack per player.
- Turn rotation; finished players removed from rotation per §3.4.
- **Turn card:** a full-screen, high-contrast screen showing whose turn it is — player
  colour, name, and an instruction to place the phone flat on the table. Advanced by tap.
  This is the screen that motion will later advance automatically; build it now as the
  only handoff mechanism.
- Placement modes per §3.4, defaulting to `winner-only`.
- Rack size setting, 9 or 12, defaulting to 9.
- **Overpay control per §3.5: an A/D toggle plus a boost checkbox.** Default toggle `A`. When
  `D`, a move is legal if selected tiles sum to ≤ the roll total, except a selection that would
  shut the whole rack, which must be exact (§3.5/D-45). The **boost checkbox** is present and
  interactable only while the toggle is
  `A`; when the toggle is `D` the checkbox greys out and its value is ignored. In M2 the boost
  checkbox is **built and persisted but its checked behaviour is inert** — the boost mode
  itself lands in M6. (Do not build a 3-position slider; there is no `B` button — see §3.5.)
- **Motion toggle per §3.8, default ON**, and **tap-to-proceed toggle per §3.9, default ON in
  development / OFF in the final build.** Enforce the §3.9 mutual constraint at the UI level:
  the two cannot both be set off. In M2 both toggles are stored and the UI constraint works,
  but motion has no runtime effect until M3; tap advancing the turn card is the only handoff.
- **Settings menu reachable during a match per §3.10**, with each setting tagged
  live-at-end-of-lap or blocked-until-next-game as in that table. Blocked settings (rack size,
  add/remove player) are visibly disabled with an "applies next game" note while a game is in
  progress. Live settings are accepted immediately and applied at the next lap boundary.
- End-of-game screen showing finishing order.
- Settings button reachable from a player's turn screen, intended for the adult running the
  game.

**Out of scope.** Motion runtime behaviour (toggles stored, no effect until M3). Single-player
mode. The boost mode's runtime behaviour (M6 — the checkbox exists but does nothing yet).
Reason: single-player is a different design not yet worked out; the boost mode is a later
milestone.

**Acceptance criteria:**
1. I can set up four players with distinct names and colours, and each sees their own rack
   with their own closed tiles preserved across turns.
2. In `winner-only`, the game ends immediately when the first player shuts their box.
3. In `top-two`, play continues after the first shut and ends on the second.
4. In `all-places` with four players, the game ends when the third player shuts, and the
   fourth is shown in last place without playing on.
5. With two players in `all-places`, the game ends at the first shut.
6. A stalled player's rack is unchanged when the phone comes back to them.
7. Closing the app and reopening it remembers the player roster and settings, including the
   overpay toggle, the boost checkbox state, the motion toggle, and the tap-to-proceed toggle.
8. Switching the rack size to 12 (before a game starts) gives every player twelve tiles and
   the single-die option still unlocks correctly.
9. With overpay set to `D`, I can end a turn using fewer points than I rolled (e.g. roll 11,
   flip tiles summing to 9) — **except** I cannot close a selection that would shut my whole rack
   unless the roll pays it exactly.
10. With overpay set to `A`, the above is rejected exactly as in M1 — a move must sum to the
    roll total.
11. The boost checkbox is interactable when the toggle is `A` and greys out when I switch the
    toggle to `D`. (Its checked behaviour does nothing yet — that is M6.)
12. I cannot set both the motion toggle and tap-to-proceed toggle off; turning one off forces
    the other on in the UI.
13. Opening settings mid-game, I can change placement mode and the overpay toggle, and the
    change takes effect at the start of the next lap, not mid-lap. Rack size and add/remove
    player are visibly disabled with an "applies next game" note while a game is in progress.

**Stop conditions.** If turn rotation and the finished-player removal interact to produce
an empty rotation while the game is still running, **stop and report** rather than adding a
guard clause. If applying a live-at-end-of-lap change cannot be cleanly deferred to the lap
boundary, **stop and report** rather than applying it mid-lap.

---

### M3 — Motion gating

**Goal.** The phone knows when it is lying flat, and the turn card advances by itself when
the incoming player sets the phone down.

**Scope.**
- Permission request on first launch, behind an explicit tap ("Tap to start").
- Measured constants from M0 loaded from `config.js`, **including the rest-to-flip delay**.
- While the phone is **moving/lifted** during play, the game shows the current player's turn
  card rather than the rack. Resting it flat returns to play / advances.
- The turn card advances automatically when the phone comes to rest — after the **rest-to-flip
  delay** — calling the **same** advance function the tap calls. Per §4.1 there must not be two
  paths.
- **No orientation lock** (§4.3). Do not force landscape or portrait.
- **Honour the tap-to-proceed toggle (§3.9) and the mutual invariant.** Implement
  `effective_tap = user_tap_preference OR (motion not currently working)` so a turn can always
  be advanced, including when motion is denied or fails at runtime, even if the user's
  tap-to-proceed preference is OFF.
- Graceful behaviour when permission is denied or the API is absent: the game runs exactly
  as it did in M2, tap-driven, with no error state and no nag.
- **Honour the motion toggle from §3.8.** When OFF, motion is not activated, no permission is
  requested, and the game runs tap-only via the same path, not a new one.

**Out of scope.** Detecting the phone being rotated/spun while flat (impossible — §4.3).
Detecting which player picked it up. Any use of the gyroscope. Any orientation lock.

**Acceptance criteria:**
1. Playing a full four-player game without ever tapping a turn card — passing the phone
   (including a gentle shove to the next player) and letting it rest is enough to advance each
   turn.
2. Lifting or moving the phone mid-turn shows the turn card; resting it returns to the same
   rack with the same tiles still selected or still open.
3. A firm table bump does not show the turn card.
4. **The view flips to the game fast enough that a fast tap right after the phone settles
   cannot beat it** (the rest-to-flip delay from M0 is short enough). A resting hand or bump
   still does not trigger an early flip.
5. Declining the motion permission leaves a game completely playable by tapping, with no error
   message and no repeated prompts — because `effective_tap` is forced on.
6. Turning the motion toggle OFF lets me hold and pass the phone in any position without the
   view ever changing on movement, and the game never asks for motion permission. Turning it
   back ON restores the pass-and-rest behaviour.
7. With tap-to-proceed preference OFF and motion ON, if motion then fails mid-game, I can
   still advance turns by tapping (the invariant made tap effective).

**Risks.** If flat/rest detection is tuned too tightly, the view flickers mid-turn and the
game becomes unplayable. If too loose, the handoff will not fire or a kid out-taps it. The M0
measurements (including the rest-to-flip delay) exist to prevent guessing; if insufficient,
**re-measure**, do not tune by feel in the game code.

**Stop conditions.** If the view changes during normal play more than once in a full game,
**stop and report** with the logged transition data rather than widening thresholds until it
stops.

---

### M4 — Continuous-rotation handoff (spike) — CUT

**Status: CUT (D-40).** This was a cuttable spike per its own text. M0's orientation-during-lift
finding kept it technically viable, but the feature (skip the turn card on a detected 180°
rotate-and-set-down) was never attempted and its acceptance criteria were never run on-device.
The M3 tap/motion turn-card handoff, as shipped, feels fine in real play — there is no open
problem M4 would solve. **Do not revisit without a new decision to do so.** Original spec kept
below for the record only.

<details>
<summary>Original M4 spec (cut — historical record)</summary>

**Goal.** Find out whether the phone can be picked up, turned 180°, and set down again with the
game staying in play — no turn card at all.

**Scope.** During a lift, read device orientation (§4.3) and latch the last valid landscape
orientation at the moment the phone returns to flat. If the latched orientation differs from the
previous one, treat the set-down as a completed handoff and advance the turn without a turn card.

**Acceptance criteria.** (1) Picking the phone up, rotating 180°, and setting it down advances to
the next player's rack without a turn card. (2) Picking up and setting down without rotating does
not advance. (3) Ten consecutive handoffs at natural speed give ten correct results.

**Stop conditions.** If criterion 3 cannot be met, cut and report.
</details>

---

### M5 — (reserved / no-op)

The motion on/off toggle originally imagined as its own milestone is **not a separate
milestone.** The setting is built in M2 (stored) and given its runtime effect in M3 (read).
Nothing remains for an M5. This heading exists only so the numbering is not misread as a gap.
Do not create work here.

---

### M6 — Boost system, single-type overpay — CLOSED (verified)

**Status: CLOSED at single-type scope, VERIFIED in play (D-41).** What shipped: the strict-base
boost mode reached via overpay toggle = `A` + boost checkbox on, with the **single overpay boost
type** (`boosts: { overpay: n }`), the two award criteria, earned/granted timing, the whole-rack
exact-match rule, and the offered spend-or-stay. This matches §3.6 (LIVE). The **two-type
expansion is M7, not part of M6.** Nothing shipped needs the second type to be correct on its own
terms, so M6 is complete.

**What shipped (all live and verified):**
- Boost checkbox functional while overpay = `A`; greys out under `D`.
- Single overpay boost: subset ≤ roll total, spent to rescue a stall; cap 3; in-memory,
  session-only.
- Whole-rack exact-match rule (commit `f262a7d`) — overpay cannot close every open tile at once.
- Award criteria: dry streak + trailing-at-finish. Earned-vs-granted timing (bank on earn,
  deliver + announce at the start of the earning player's next turn).
- No eligibility floor; no re-earn on spend; per-player boost count shown; award announced when
  granted.

<details>
<summary>Original M6 spec, written for the two-type system before the split (now M7 — historical)</summary>

The two-type scope (typed `{overpay, oneForTwo}` inventory, 1-for-2 effect, auto-select spend,
per-type reward pools, 17 acceptance criteria) that briefly lived here has moved to **M7** intact.
See M7 below; not duplicated.
</details>

---

### M7 — Two-type boost expansion — BUILT, VERIFIED

**Status: BUILT, matches §3.6b as written (2026-09-11).** Implements the 1-for-2 type, typed
inventory/credits (`{ overpay, oneForTwo }`), the cross-type 3-boost cap, auto-select spend (1-for-2
preferred when both resolve), the shared-pool 50/50 reward roll (`CONFIG.boostTypeDistribution`), and
type-aware inventory/announcement/offer text. All 9 acceptance criteria verified individually plus
full automated multi-type games with zero console errors.

**Orchestrator ruling on one flagged interpretation.** §3.6b's "ignore one whole die, play the other
as a single value" doesn't say which die when the two faces differ and either could resolve the
stall. Shipped as **exact match to either individual die face** (not a forced die choice) — this
matches the §3.6b {3,7,8,9}/roll-3+3 worked example, stays player-driven like every other move in
this game, and is a safe superset reading not contradicted by any acceptance criterion. **Confirmed
correct; no change needed.**

**Goal.** Add the **1-for-2 boost type** and the typed inventory / auto-select / per-type reward
model of §3.6b, on top of the verified single-type M6.

**Sequencing note.** Comes after real sessions on `A`, `D`, and single-type boosts, so criteria
and award distribution tune against observed stall frequency. Values in §3.6b are labelled
starting points.

**Scope.**
- Add the **1-for-2 effect** (ignore one whole die, play the other as a single value) alongside
  overpay in the already-typed inventory. Cap stays **3 total across both types**.
- **Auto-select spend (§3.6b), no picker.** Both resolve → offer 1-for-2 (conserve overpay); only
  one resolves → offer it; neither → no offer. Single spend-or-stay; offer names the type.
- **Per-type reward model (§3.6b):** each type owns a criteria pool; shared-criterion awards pick
  the type by a configurable distribution variable (default 50/50). MVP: both share the M6
  criteria, so every award is a 50/50 roll.
- Inventory display becomes **type-aware** (counts per type, not one number — the "Overpay
  boosts: N" counter changes); award announcement **names the type**.

**Out of scope.** Any purchase/currency/store. Cross-session persistence. The **block-dice** boost
and any targeted / inter-player / duration boost (benched, §6). Changes to `A`/`D` rules,
placement, motion.

**Do-not-touch on entry.** The verified M6 single-type behaviour, `A`/`D` rules, placement, and
motion/tap paths.

**Acceptance criteria — checkable by playing with overpay `A` and the boost checkbox on:**
1. I receive a mix of both types over many awards, roughly the configured distribution (~50/50).
2. My inventory shows **how many of each type**, not one count.
3. I never hold more than **3 boosts total** across both types.
4. **1-for-2 works:** rack {3,7,8,9}, roll 3+3 stalls under strict rules; spending a 1-for-2 lets
   me play a single 3 and close the {3}.
5. **Auto-select conserves overpay:** on a stall both would resolve, the game offers the 1-for-2
   and my overpay count is unchanged.
6. **Only-overpay case:** on a stall only overpay resolves, overpay is offered.
7. **No-op case:** on a stall neither held boost resolves, no spend is offered and I stall.
8. Single spend-or-stay choice (never a two-boost picker); the offer names the type.
9. **Neither boost type can EVER close a selection that would shut the whole rack while spending a
   boost — not even on an exact match** (the stricter rule above, corrected from an earlier draft
   of this criterion that wrongly implied the exact-match D-45 carve-out applied to boost-spent
   moves too — it does not).

**Stop conditions.** If the auto-select rule ever offers a boost that does **not** resolve the
current stall, **stop and report** — the usable-here filter is wrong. If awards flood the game,
**stop and report the rate** rather than silently tightening constants.

---

### M8 — Dev-mode tab (development surface) — BUILT, VERIFIED

**Status: BUILT, matches spec (2026-09-11).** Implemented as a collapsed
`<details id="dev-mode-section"><summary>Dev mode</summary>...</details>` on the settings screen,
styled distinctly (dashed warning-toned border) from the production `<fieldset>` above it, closed
by default. Not hard-gated — this static-file project has no build variant to gate on, so "always
present but visually/structurally separate and closed by default" satisfies the spec's actual intent
(criterion 1: production doesn't *show* exploratory controls). All acceptance criteria verified.

**Note — M8 is likely to be superseded by M12** (the tabbed settings redesign) once that lands; M8's
`<details>` approach was the right interim answer with no build step to gate on, but M12's design
puts Dev behind its own top-level tab instead. Not urgent; M8's shipped behaviour remains correct
until M12 replaces it.

**Dice-count history — see §3.3 for the current, twice-revised production behaviour.** M8 originally
just relocated a two-dice *force* here; production dice-count has since gone through two further
revisions (a return of the full 1/2/? choice, then dropping the player-facing choice from production
entirely) — §3.3 and D-49 carry the current state; this section's original scope text below is kept
for the historical record of what M8 itself delivered.

**Goal.** A separate **dev-mode tab** in the settings menu that holds exploratory, debug, and
testable controls, keeping the **production settings surface clean and shaped toward the final
product.** The split is the container several in-flight experiments need.

**Why.** Playtest-driven experiments (the two-dice force, the time challenge, future probes) should
be reachable during development without polluting the settings a real user sees. §3.3's "no
production settings toggle for the single-die rule" is satisfied by putting the two-dice force
*here*, not on the main surface.

**Scope.**
- A dev-mode tab/section in settings, visually and structurally separate from the production
  settings. How it is gated (always visible in dev, hidden/flagged for production) is a build
  decision — the requirement is only that production and exploratory controls are **separated**.
- Relocate the **two-dice force** control here: default remains **one die** (§3.3 unchanged, the
  single-die endgame rule is untouched); this control simply lets a tester force two dice mid-game
  to exercise that path. It is a dev instrument, not a gameplay rule, and does not decide any
  player's endgame — the mandatory single-die availability (tile-closing that requires one die)
  still holds unconditionally.
- Host the **time challenge** (M9) as its first exploratory feature.

**Out of scope.** Deciding the final production settings layout (design-session territory). Any
production-facing behaviour change — this is purely a container and relocation.

**Acceptance criteria:**
1. The settings menu has a clearly separate dev-mode area; production settings do not show the
   exploratory controls.
2. The two-dice force lives in dev mode; the main settings surface contains no single-die/two-dice
   toggle (§3.3 preserved).
3. Default play is still one die at the endgame; forcing two dice from dev mode exercises the
   two-dice path and can be turned off again.

**Stop conditions.** If separating the surfaces would require touching the `A`/`D`/boost/placement
rules, **stop and report** — the dev tab is a container, not a rules change.

---

### M9 — Time challenge (dev-mode feature) — BUILT, VERIFIED

**Status: BUILT, matches spec (2026-09-11).** Dev-mode time picker + Set (rounds to nearest 15s,
persists the duration only — the live countdown is in-memory game state, never persisted, per §2's
"never persist game-in-progress state"), a persistent countdown HUD on both the turn card (visibly
paused, struck-through) and the rack (running), delta-time-based ticking so a long pause never jumps
on resume, and a dedicated `screen-timeout` (not a branch of the normal end screen) so "no ranking,
ever, here" is structural rather than something a future edit could reintroduce. Implemented as a
pure overlay — no turn/rack function was touched to build it, matching the stop condition's own bar.
All 4 acceptance criteria verified, including real (non-simulated) multi-second timing checks.

**Goal.** A quick, cuttable time-cap feature to stop games dragging on, built to try the idea fast
and react to real feedback. Lives in the M8 dev-mode surface.

**Origin and intent.** Games can drag, especially two-dice endgames that leave awkward low tiles
(e.g. {1,2} needing two dice takes forever). The time challenge is an **anti-drag circuit-breaker**:
it ends a game that won't end, gracefully, **without declaring a false winner.**

**Scope.**
- A dev-mode option: a **time picker** (smallest unit 15 s) plus a **Set** button to activate the
  challenge for the group.
- A **timer on the in-game HUD** (new persistent UI element) counting down the set time.
- The timer **pauses while a player/turn screen is showing and resumes on the active rack** — it
  measures *play* time, not pass-the-phone time. The paused state must be **visibly** paused
  (greyed/struck), so a tester can see it working.
- On timeout: the game **ends immediately** with a deliberate **no-ranking** screen — "Time's up!
  Better luck finishing next time!" — showing **no placement table.** The absence of a ranking is
  **intentional**, not a stub: nobody shut their box, so there is no winner, and leaving the "so
  who won?" question open is the design probe (it surfaces whether the family wants tiles-left
  tracking, which is a real future design input). **Do not add a ranking table to this screen.**

**Out of scope.** Any ranking or scoring on the timeout screen (deliberately — see above). Random
placeholder rankings (rejected: a random table undercuts the very tension being tested and teaches
testers the race is meaningless). Making the timer a production feature yet (it is exploratory).

**Acceptance criteria:**
1. From dev mode I can set a time (15 s increments) and Set it; the HUD shows a counting-down timer.
2. The timer visibly pauses on a turn/player screen and resumes on the rack.
3. When it reaches zero the game ends at once with the "Time's up" message and **no ranking table**.
4. A game finished normally (someone shuts) before timeout ends normally, not via the timer.

**Risks.** A timer treats the *symptom* (drag), not the disease (unwinnable-slow endgames). Watch
the test result: if games *routinely* hit the timer instead of finishing, that indicates the
**endgame rules** need a fix (single-die availability, or something new), **not** that the timer
needs tuning. Do not read "games always time out" as "the timer works."

**Stop conditions.** If building the HUD timer requires changing turn/rack state handling in a way
that touches the core loop, **stop and report** — the timer overlays the loop, it does not rewrite
it.

---

### M10 — Dice roll animation — SPECIFIED

**Goal.** The dice visibly *roll* before settling, so a roll reads as a roll rather than a value
appearing. Cheap, cosmetic, replaceable.

**The load-bearing rule (do not violate).** The roll **result is decided by `Math.random()` before
the animation starts.** The animation only *displays* that predetermined result — it never derives,
influences, or is read for the outcome. Coupling the result to where an animation "lands" is the one
way this goes subtly wrong; keep them fully separate.

**Scope.**
- **Face-cycle animation:** on roll, flash each die rapidly through several random faces (~a few
  hundred ms), then settle on the predetermined result. This is the whole feature.
- **Optional CSS shake/wobble** on the die element during the cycle (a few degrees of transform,
  a small bounce) — pure CSS `@keyframes`, no library. Include if it makes the roll feel juicier;
  cut freely if it fights the layout.
- **Covers the single-die endgame animation** (§3.3): when only one die is rolled, the same
  face-cycle plays on the single die. Do not build a two-dice-only animation that breaks or looks
  wrong in single-die mode.
- Must **not fight the theme-inversion signal** (§3.11): the die animation is cosmetic and runs
  independently of the overpay theme flip; neither should interrupt, delay, or visually collide
  with the other. If the theme is mid-inversion when a roll happens, both proceed without
  stepping on each other.

**Out of scope.** **CSS-3D dice** (a real rotating cube built from six faces) — explicitly parked as
later polish. Its landing-orientation math is a time sink disproportionate to a prototype; the
face-cycle delivers the "it rolled" read for a fraction of the cost. Physics simulation of any kind.
Sound (M-later / out of scope generally).

**Acceptance criteria — checkable by playing:**
1. Rolling visibly cycles the dice through changing faces, then settles — it reads as a roll, not a
   value popping in.
2. The settled faces always match the actual roll result used by the rules (the animation never
   changes the outcome). Rolling many times, the displayed faces and the resolved total always agree.
3. In the single-die endgame, the single die animates the same way — no broken or missing animation.
4. A roll during an active overpay theme-inversion animates normally; neither effect glitches the
   other.

**Stop conditions.** If making the animation display the predetermined result cleanly would require
deriving the result *from* the animation, **stop** — that inverts the load-bearing rule. Keep result
and animation decoupled or report why it can't be done.

---

### M11 — Navigation & escape-hatch fixes — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-13), matches the spec below.** Pause button on Play (reuses the
tabbed menu), Restart (resets boosts, distinct from New Game), and confirm guards on destructive
exits all shipped; per-move undo confirmed out. The direct answer to the URGENT flag in
DECISIONS.md** ("no recovery/undo path when a player is stuck," raised after a report where the only
way out of a confusing state was End game, discarding the whole match). All three open points from
the prior draft are now settled.

**The gap, as mapped by the design session's screen-flow review** (solid arrows = exists in code;
the gaps below = a player would reasonably expect these but they aren't there):
1. **Play → menu/Back is missing entirely when Motion is off.** The turn card has a corner Settings
   button; Play (the rack screen — roll, pick tiles, Confirm, Next) has none. The *only* exit from
   Play is picking the phone up, which does nothing when Motion is off — a genuine dead end.
2. Restart match with the same roster — missing (New Game exists but discards to Setup).
3. Confirm-guard before End / New game — missing (one mis-tap currently erases everything).

(An earlier version of this diagram also listed "undo a confirmed flip" as expected-but-missing —
that line is **stale**: undo was separately ruled out in conversation with the design session before
any playtest surfaced a real desire for it, and that ruling never made it back into the diagram. It
is **not** part of this milestone; see the out-of-scope note below.)

**P0 — Pause/Menu button on Play.**
- **Where:** top corner of Play, mirroring the turn card's existing `corner-btn` so it feels native
  and consistent rather than a bolted-on addition.
- **What:** gives a tap route off Play **regardless of motion state** — closes gap 1 unconditionally.
  This is the load-bearing fix for the urgent flag: whatever else this milestone does, this alone
  removes the literal dead end.
- **Destination: reuses the existing tabbed Setup/Settings screen** (the same one the turn card's
  corner button already opens), **not** a separate new sheet. Mid-game, that screen's footer already
  shows "Back to game / Restart match / End match" (per the wireframe and M12) — Play's new button is
  simply a second entry point into it. No new UI surface to build.

**P1 — Restart match.**
- **Where:** the Pause/Menu screen (i.e. the reused tabbed screen above), and the End and Timeout
  screens (labelled "Rematch" there).
- **What:** keeps the **exact roster and settings**, re-racks everyone, jumps straight to the first
  player's turn card. Explicitly **distinct from "New game,"** which discards to Setup — Restart is
  a fast same-group replay; New Game is for changing who's playing or what's configured.
- **Boosts reset to zero on Restart** — this is a deliberate divergence from "New Game," which
  carries boosts forward per §3.6's "stacking across replays within one app session." **Restart does
  not count as a replay for this purpose.** Rationale: a restart is a do-over of the *same* match,
  and resetting boosts incentivises actually finishing a match to keep what you've earned, rather
  than restarting mid-game to shed a bad position while keeping accumulated boosts. New Game (a
  genuinely new match) still carries boosts forward as before — this milestone does not change that.
- **Guarded** by the P1 confirm dialog below whenever a match is in progress (not needed from the End
  or Timeout screens, where the match is already over).

**P1 — Confirm guards on destructive exits.**
- **Where:** wraps **End game**, **Restart** (when a match is live), and **New game** (when a match
  is live) in the design system's existing `.dialog` component — e.g. "End this match? Scores and
  progress will be lost. This can't be undone." Reuses an existing component; no new dialog system.
- Closes gap 3. Cheap, and removes the one-mis-tap-erases-everything risk directly reported.
- **Not needed** when there's no live match to lose (End/Timeout screens' own New Game/Rematch
  buttons don't need a guard — nothing is in progress to discard).

**Out of scope.** **Per-move undo** (undoing a confirmed tile flip) — confirmed out, not merely
deferred. Already ruled out with the design session prior to this milestone; no playtest has
surfaced a real desire for it. P0 (an exit always exists) + Restart (a coarse full reset) are the
complete answer to the urgent flag. If a genuine need for finer-grained undo surfaces later, it is a
new, separately-scoped milestone — not a gap in this one.

**Do-not-touch on entry.** The motion/tap turn-advance logic itself — the Pause button is a new,
independent exit, not a change to how motion or tap already work. The boost-carryover rule for New
Game (unchanged; only Restart diverges from it, per above).

**Acceptance criteria:**
1. From Play, with Motion off, tapping the corner button opens the same tabbed Setup/Settings screen
   the turn card already opens — the game is never a dead end regardless of motion state.
2. Attempting End game, Restart, or New game while a match is live always shows a confirm dialog
   first; declining leaves the match untouched; confirming proceeds.
3. End/Timeout screens' own New Game / Rematch buttons need no confirm guard (nothing live to lose).
4. Restart re-racks all players, keeps the roster and settings, resets every player's boost inventory
   to zero, and jumps to the first player's turn card — verified distinct in behaviour from New Game
   (which returns to Setup and carries boosts forward).
5. There is no undo affordance for a confirmed tile flip anywhere in the app.

**Stop conditions.** If closing gap 1 (P0) turns out to require touching the motion/tap turn-advance
logic itself, **stop and report** — the Pause button is a new, independent exit, not a change to how
motion or tap already work.

---

### M12 — Tabbed settings/menu redesign — BUILT, VERIFIED (structural)

**Status: BUILT and verified (2026-09-13), structural pass.** All four tabs (Players/Rules/App/Dev)
shipped with the segmented/switch controls, next-game/next-lap chips (D-30 tiers), mid-game banner,
and mid-game footer. Skin was still placeholder at build time; the real skin arrived across M13–M15.
Drag-to-reorder and the full colour count were kept per the prototype-wins rule. Original structural
spec below.

**Status (original):** all four tabs are now wireframed (2a Rules, 3a Players, 3b App, 3c Dev) — the
"extrapolate the pattern" approach from the previous draft is **no longer needed**; every tab has a
real spec below. **Brand specs (palette, final type application) land tomorrow, not today** — this
milestone is written to the wireframe's *structure*, with the skin still explicitly deferred one
more day. Do not treat the wireframe's colours/fonts/placeholder display font as final.

**Resolution rule for this milestone (apply throughout): where the wireframe's static mock doesn't
show — or actively conflicts with — functionality that already exists in the shipped prototype, the
prototype's functionality wins and is kept. The mismatch is recorded below for the design session to
fold into a future pass, not resolved unilaterally by dropping the feature to match the mock.** This
is not a license to add anything new — only to keep what's already real when the wireframe is silent
or behind on it.

**Supersedes M8's interim implementation.** M8 shipped the dev surface as a collapsed `<details>`
element for lack of a better container at the time. M12's Dev tab replaces that with a proper
top-level tab. M8's underlying content carries over unchanged; only the container changes.

**Scope — tab by tab, from the real wireframe.**

**Tab bar:** top segmented tabs with icons, order **Players / Rules / App / Dev**, per 2a/3a/3b/3c.

**Rules tab (2a):** rack size (segmented 9/12, `next game` chip), placement (segmented Win/Top
2/All, `next lap` chip), overpay (segmented A/D, `next lap` chip), boost mode (switch, `next lap`
chip, sub-labelled "A only" — **must render visibly disabled/greyed when overpay = D**, an
interactive state the static wireframe can't show but is an acceptance criterion here). The
`next game`/`next lap` chips are a visual implementation of **D-30's** three-tier rule — carry the
tiering exactly as D-30 specifies. A mid-game banner ("Match in progress — rule changes apply at the
next lap") shows across the whole menu whenever a match is live.

**Players tab (3a):** roster list (colour dot + name + remove), an "Add player" row (name input +
Add), a colour-swatch picker, and a banner ("Add at least 2 players to start · roster edits apply
next game" — matches the existing 2-player minimum and D-30's blocked-until-next-game tier for
roster edits, no change needed).
- **Mismatch — drag-to-reorder not shown.** The wireframe's roster rows have no reorder handle;
  the shipped prototype has drag-to-reorder (D-50, Pointer Events, disabled mid-game). **Kept per
  the resolution rule above.** Build the reorder interaction into 3a's row style (a handle affordance
  fits naturally into the existing row layout); flag to the design session that the mock should grow
  a drag-handle glyph in its next pass.
- **Mismatch — swatch count.** The wireframe shows 6 grey placeholder swatches; the shipped
  `theme.js` already defines more player colours than that (at least 10, per the P4/P5/P10 additions
  on record). **Kept — do not truncate the real colour set to 6 to match the mock.** This will
  naturally resolve once tomorrow's refined palette (colour-blind-safe to 8, graceful to 12 per the
  brand brief) lands; no separate fix needed now beyond not regressing the count.
- **Avatar row — now resolved, belongs to M13.** Avatars are confirmed IN (20 pre-made Spudling
  PNGs, random-assign + cycle — D-55). The Players tab will gain an avatar affordance, but that lands
  with **M13** (which introduces avatars), not here. If M12 ships before M13, this tab simply has no
  avatar row yet; M13 adds it. No conflict — just sequencing.

**App tab (3b):** a "Handoff" group (Motion switch, Tap-to-proceed switch, and a banner — "One of
Motion / Tap must stay on — turning both off isn't allowed" — **this is a precise, correct rendering
of the §3.9 mutual invariant**, nothing to change) and a "Display" group (Theme, segmented
Light/Dark).
- **Clarify, not a mismatch:** this Theme control sets the player's **preferred base theme**. It does
  not override or replace the automatic overpay theme-inversion (§3.11/D-34) — that flips
  independently on top of whichever base is selected here. The wireframe doesn't spell this
  relationship out; note it for the design session so a future pass doesn't try to reconcile the two
  into one control.

**Dev tab (3c):** a "Dice test" group (`Test dice #` switch, `Dice choice` segmented 1/2/?) and a
"Time challenge" group (a numeric seconds input rounding to 15 s steps + Set button, `next game`
chip, a status line — "Currently 1:30 — applies next game"). This **already matches the current,
twice-revised dice-test model (D-49)**, not the older single-force toggle — good sign the design
session is working from current information.
- **New detail to adopt (not a conflict — the plan never specified this and the wireframe fills a
  real gap):** the time-challenge input defines **`0` seconds as the off state.** Lock this in: `0` =
  no challenge active; the smallest active duration is still 15 s per M9's existing rule.
- **Flag for the design session — a claim the mock makes that the stack can't deliver.** The Dev
  tab's banner reads "Developer tools — not shown in the shipped build." This project has **no build
  step** (§2 of this plan) — there is no mechanism to conditionally exclude anything from a "shipped
  build" versus a dev one; it's the same static files always. M8's actual approach (a
  visually-distinct, always-present section) is the correct realization of "developer tools kept out
  of the way," but the banner's literal wording overpromises something the architecture cannot do.
  **Do not implement hiding-from-shipped-build; keep the always-present-but-visually-separate model.**
  Reword the banner copy when this tab is built (e.g. "Developer tools — not part of normal play") so
  it doesn't assert a false guarantee. This is a correction, not a mismatch to preserve either side of.

**Mid-game footer state (all tabs, same menu screen):** "Back to game" (primary) plus a secondary row
of "Restart match" / "End match" — matches M11 exactly (M11 resolved the Pause button to reuse this
same screen). Pre-game: "Start game" only, as shown on 3a/3b/3c (those wireframes reuse the pre-game
footer since the mid-game state was already shown once, on 2a).

**Out of scope.** Final visual skin (brand-track-dependent; lands tomorrow). Any new settings or
rules not already specified elsewhere in this plan — this milestone re-organizes and re-skins
existing controls into the new tabbed structure, plus the two kept mismatches above; it does not
invent new functionality.

**Do-not-touch on entry.** No settings value, default, or mid-game-mutability tier changes — this is
a container/layout change over the existing settings model (D-30), not a rules change.

**Acceptance criteria:**
1. The settings screen shows four top tabs (Players / Rules / App / Dev) with icons; switching tabs
   shows the right content, no page reload.
2. Rules tab matches 2a: segmented/switch controls only, with next-game/next-lap chips exactly
   matching D-30's tiers; the boost-mode switch visibly disables when overpay = D.
3. Players tab matches 3a **plus** keeps drag-to-reorder and the full existing colour-swatch count
   (both mismatches above resolved toward keeping prototype functionality).
4. App tab matches 3b exactly; the mutual motion/tap invariant banner is present and correct.
5. Dev tab matches 3c, with `0` seconds established as the time-challenge off-state, and the banner
   copy corrected to not claim build-time exclusion.
6. The mid-game banner appears whenever a match is live, on every tab, and disappears when none is.
7. Mid-game, the footer shows "Back to game" + "Restart match" + "End match"; pre-game, "Start game".
8. Visual polish still reads as a wireframe/placeholder skin — confirms this milestone did **not**
   attempt to guess at final brand colours/fonts ahead of tomorrow's brand drop.

**Stop conditions.** If any tab's real content requires inventing a setting that doesn't already
exist elsewhere in this plan, **stop and report** — this milestone re-arranges and preserves, it
does not invent.

---

### M13 — Brand / skin application + avatars — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-13), then extended by M14–M15.** The first brand handoff was
applied (palette, `{fill,edge,ink}` tiles, closed-tile redundancy, fonts, 19 avatars with
random-assign + cycle). Subsequent brand passes (M14, M15) revised type, skins, and screen chrome on
top of this — so the *specific* fonts and some tokens below were later superseded; see M14/M15. The
structural achievements (avatar system, per-tile colour model, closed-tile redundancy, overpay XOR
untouched) hold. Original spec below.

**Status (original):** the design session delivered a grounded developer handoff (`DevHandoff_BrandSpec_dc.html`,
built against `flip@main` — `app/style.css`, `theme.js`, `config.js`, `index.html`) with the settled
brand spec, a full mockup of all six screens in the new look, and drop-in CSS + `theme.js` tokens.
This milestone applies that skin across the app. It **depends on M11 and M12** (the Pause button and
tabbed menu it skins must exist first) and is **skin + avatars only — no rules, engine, motion, or
boost-model changes.** The handoff explicitly leaves those untouched.

**This resolves the brand track.** The brand brief's open fork (§2.1, Spudlings include/exclude) is
closed: **Spudlings are IN, as a fixed set of pre-made avatar PNGs** (see avatar handling below).
Name kept ("Flip the Number"). Palette, type, and tokens are settled below.

**Scope — tokens and skin (from the handoff, taken as-is unless noted):**
- **Fonts via network `<link>`** in `index.html <head>`: Bagel Fat One (display) + Figtree
  (400/600/700/800). `--font-display` for numerals, hero numbers, titles, primary buttons;
  `--font-ui` for all other UI/body. Confirms the earlier §3.1 flagged decision **toward the network
  `<link>` option** (not self-hosting) — record that the offline-purity caveat (§3.1) is knowingly
  accepted: first load needs network, `system-ui` is the fallback.
- **New `theme.js` palette** replacing the ad-hoc set: 8 CVD-safe player colours (Chili, Marigold,
  Honey, Moss, Teal, Denim, Indigo, Plum) + 4 graceful 9–12 (Rust, Sky, Rose, Sage, **not** held to
  the CVD bar). Each tile colour is now an object `{ fill, edge, ink }` — `edge` is the dark partner
  used as tile border and light-fill numeral (a **second, non-hue identity channel that also survives
  the theme flip**); `ink` is the numeral colour. Assign player colours **safe-8-first order** so the
  first 8 seated always land on the safe set.
- **Tile renderer change:** tiles set background `fill`, a 3px `edge` border, and text `ink`
  per-tile; the old flat-string tile colours and the `tileTextColor`/`closedTileTextColor` globals
  fold into per-tile `ink`. (Handoff offers a parallel-map fallback if the renderer isn't touched
  yet, but the object form is the intended shape.)
- **Closed tile — 3 redundant, individually-sufficient cues** (satisfies the §3.2 open/closed
  colour-blindness requirement): desaturate+darken fill (`closedTile` ≈ `#5C625F`), inset pressed
  shadow (CSS), and a dim hollow numeral. **Any one cue reads state without colour.**
- **Token additions to `style.css` `:root`:** `--radius-tile: 10px`, `--radius-btn: 14px`,
  `--tile-closed-shadow`, plus the font-family vars. Existing chrome tokens (`--bg/--fg/--border…`)
  and the **overpay XOR logic in `applyTheme()` are unchanged** — player hues live outside the
  chrome-token system on purpose, so the theme flip moves only chrome, never player identity.
- **Apply the skin to the tokened surfaces only:** setup, play, end. **Turn card and launch keep
  their fixed contrast** (player colour / fixed dark) independent of theme and overpay XOR —
  unchanged from current behaviour.

**Scope — avatars (this milestone introduces them):**
- **20 avatar PNGs** in `app/avatars/`, served static (no-build, no network dependency).
  **Provisional art** — treated as swappable: each player holds an avatar **reference (id/filename)**,
  so replacing the art later is a file swap, not a code change.
- **Randomly assigned at game start (without replacement — unique per player**, guaranteed since 20 ≥
  the 12-player max), then **cycle-through** to change (browse the set from the assigned one).
- Avatar appears on the **player screen (gameplay chrome)** — this **supersedes the handoff's
  "Spudlings never gameplay chrome" line**, and is what makes the avatar the **primary 9–12 player
  distinguisher** (order past 8 players: avatar → name → colour, since colour is not CVD-safe past 8).
- The Spudling **avatar creator is out of scope and not referenced** — only its PNG output, as this
  fixed 20-set. Spudlings also appear on splash/loading/wordmark per the handoff (art via Nano Banana,
  later — the wordmark asset is a noted open item, not blocking).

**Out of scope.** Any rules/engine/motion/boost-model change (the handoff changes none). The avatar
creator or any in-app avatar *creation*. Final Spudling wordmark/splash art (Nano Banana, later).
Self-hosting the fonts (network `<link>` accepted).

**Do-not-touch on entry.** The dark-root/`.theme-light` structure; the overpay XOR in `applyTheme()`;
turn-card and launch fixed contrast; the rules engine, motion thresholds, and boost model; the M10
dice wobble and `cqh`-based tile sizing (all confirmed compatible by the handoff).

**Acceptance criteria — checkable by using the app:**
1. The app renders in the new look — Bagel Fat One numerals, Figtree UI, warmer palette, rounder
   tiles/buttons — across setup, play, and end screens.
2. Each player's tiles use their assigned hue's `fill`, a visible `edge` border, and a legible
   numeral; open tiles are full-chroma.
3. A closed tile is distinguishable from an open one **with colour vision simulated off** — the
   desaturate, the pressed inset, and the hollow numeral each independently signal "closed."
4. The first 8 players seated get the 8 CVD-safe colours in order; 9–12 get the graceful set.
5. The overpay theme flip still flips **only chrome** — player tile hues stay constant through the
   flip (regression check on the untouched XOR logic).
6. Turn card and launch still show fixed contrast, unaffected by theme selection or overpay flip.
7. Every player is assigned a **unique** avatar at game start; a player can cycle through the set to
   change theirs; the avatar shows on their player screen.
8. Replacing an avatar PNG file in `app/avatars/` changes what shows in-game with no code change
   (swap-friendly reference confirmed).

**Stop conditions.** If applying the palette requires changing the overpay XOR logic or moving player
hues into the chrome-token system, **stop and report** — the whole point of the handoff's structure is
that player identity lives *outside* the flipping chrome. If the tile-renderer change to `{fill,edge,
ink}` risks breaking the M10 wobble or `cqh` sizing, **stop and report** rather than working around.

---

### M14 — Brand pass 2: type, skins, player-accent chrome — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-15), from `DevHandoff_BrandSpec_v2` + `PlayScreen_Redesign`.**
A second brand handoff, applied after resolving conflicts with the user rather than guessing.

**What shipped:**
- **Two skins, not three.** Colorful (default) and Monochrome; the doc's third "Brand" skin was
  dropped per user confirmation. `activeSkin` is `settings.skin` (cosmetic-only, like `settings.theme`),
  not a `theme.js` field. Mono skin uses a computed HSL lightness ramp (`monoRampTiles()`), starting
  values reverse-engineered, flagged "revisit after a real readability pass" (unmeasured).
- **Play chrome consolidated into one `.play-chrome-row`** below identity: icon-only settings cog +
  two permanent boost chips + the boost-earned toast, all in one row (replacing the old `.play-toprow`
  and separate boost-count text row). **This is the row M18/M19 below operate on.**
- **The boost-earned toast** (M14's build) shows the awarded boost type name, holds, then shrinks and
  merges into its chip, at which point the chip count bumps. Held-back count via `boostToastState`
  (transient, never persisted); timings `BOOST_TOAST_DISPLAY_MS` (1200ms) / `BOOST_TOAST_COLLAPSE_MS`
  (280ms), unmeasured tune-by-feel starting values. **M19 refines this into a travelling animation.**
- Type: Crimson Pro (tile digits) + Overpass (UI) at this stage — later superseded (subsequent
  font-swap entries note Vollkorn Black then further swaps; the plan does not pin the font name, §7).
- Player identity colours stayed a flat hex array (not `{fill,edge,ink}` triples) to avoid breaking
  the persisted roster shape; `playerEdge()` looks up the edge partner from the skin's tiles by fill.

**Flagged, not fixed (carried forward):** player colour #3 "Honey" (`#E4BE2F`) measures 3.59:1 on the
light theme, failing the 4.5:1 target — a shared identity/tile colour, so re-picking its edge is a
**design-track decision, not a code call.** Open for the design session.

**Verified:** fonts loaded at correct weights, promoted/muted button swap, boost-toast
hold→collapse→bump sequence (millisecond-gated), mono skin colour-match (after fixing a real
`rgbToHsl` saturation-scale bug found during verification), light theme + overpay XOR flip, full
automated game, zero console errors.

---

### M15 — Brand pass 3: launch / handoff / timeout / setup / dialog / results — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-16), from `GameScreens_Redesign`.** The rest of the flow
skinned; structural/rules questions confirmed with the user, not guessed.

**What shipped:**
- New **"sand = system chrome, player hue = identity only, red = destructive only"** colour-role
  rule, scoped to **these new screens only** — Play keeps its player-tinted chrome as shipped in M14
  (confirmed with the user; not retroactive). New tokens: `--accent-sand*`, `--accent-amber*`
  (informational badges), `--accent-danger-fill` (destructive button fill).
- **Turn card moved onto the themed surface** (player colour carried by avatar ring/glow + name only)
  — **later reverted by M17** back to full-bleed player colour. Note the round-trip.
- **Time challenge: visual redesign only, semantics unchanged** — it remains a single whole-match
  countdown that ends the match with no winner (not the per-turn shot-clock the mockup's copy
  implied). Timeout copy rewritten to match-over framing; both Rematch/New-game buttons kept. **The
  per-turn shot-clock is explicitly flagged as a possible FUTURE game mode** (see §6a), not built.
- **Results screen has no score column** — "Benched" is shown as real user-facing UI, because the
  rules engine has no scoring model (only finish order). Consistent with D-02.
- Confirm dialog OK button shows the real action ("End match"/"Restart match"); Setup gained a real
  title; taken colour swatches dim (hint only, no enforced uniqueness); skin picker upgraded to
  preview cards; Remove became an icon; tab icons swapped.
- **Not built (flagged):** the mockup's elaborate dev tools ("Roll d6", "Force a value", "Jump to
  Results") — underspecified; the existing 1/2/ask dice-choice control was restyled instead.

**Verified:** full flow screenshotted both themes, live time-challenge expiry into the redesigned
Timeout, confirm dialog, Results — zero console errors, real-click re-verification after debug strip.

---

### M16 — Post-M15 bug fixes — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-17).** Real-device bug reports, each root-caused and measured,
not patched by feel. Headline: the recurring **"estimated min-height, not measured"** bug class struck
again — `#play-selection-sum`'s `min-height: 1.2em` was ~0.7px short of Overpass's real line height,
causing a rack jump on roll (the dice animation was innocent; fixed to `1.3em`, re-verified 0px
delta). Also: explicit button heights on the play action row (an `align-items: stretch` failure),
turn-card layout, and a dice-animation dev control. **Reinforces the §7 rule — measure, never
estimate, box heights.**

---

### M17 — Turn card reverts to full-bleed player colour — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-18).** Explicit user request and a **direct reversal of M15's**
turn-card change: the turn card is once again a full-bleed player-colour background, fully
theme-independent. Chrome that the turn card shares with Play (settings icon, avatar, name) is handled
by scoping custom-property overrides (`--fg`, `--player-accent`, etc.) once on `#screen-turncard`, so
Play (same classes, different scope) is provably unaffected. Recorded as intentional drift-reversal.

---

### M18 — Player choice of boost at spend (reverses D-36/D-37) — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-19), with a cleaner shipped architecture than the original spec
below described, and one real bug found + fixed during build.** The interaction goal is unchanged;
what shipped clarified the mechanics:
- The flow was *already* "Use boost → select tiles → Confirm" even pre-M18 — `onBoostSpend` never
  committed a move, only committed the *boost type* that unstalls the roll; the existing `#play-confirm`
  commits the move as for any turn. M18 did **not** change `onConfirm` or that shape.
- M18 adds an optional **"Change boost"** step, cyclable **before, after, or interleaved with tile
  selection** — `boostSpentType` stays mutable right up until the existing Confirm fires. Built via a
  new `applicableBoostTypes()` (the ordered held-and-resolving list, 1-for-2 first, frozen per roll),
  `onBoostChange` cycling through it, and `#play-boost-change` taking `#play-roll`'s slot only when a
  boost is spent and >1 type still applies (preserving the "one secondary control beside Confirm" row).
- **Bug found + fixed (real-device):** the first build decremented the boost count in `onBoostSpend`
  and refunded/recharged on each cycle, so pre-Confirm chip counts were misleading. Fixed: `p.boosts`
  is touched **only in `onConfirm`, once, for the selected type** — Use boost / Change boost are pure
  preview/selection, counts stay stable until a move lands. "Use boost previews, Confirm commits,"
  literally. `#play-boost-change` uses `.primary` (an action beside Confirm), not muted `.secondary`.

**Original spec (as written before build — interaction still accurate; the "Confirm commits the
previewed boost" language is realised as: Confirm reads `boostSpentType` at commit, as it always did):**

**Goal.** When a player stalls and holds **both** boost types, each of which would resolve the stall,
let the player **choose** which to spend — via a one-button cycle-and-preview, not a picker.

**This is an approved, deliberate reversal of the auto-select rule (D-36/D-37 → D-56).** Those rules
made the spend auto-selected (1-for-2 preferred, to conserve overpay), with the player having no
choice — and explicitly accepted that a player who could score better with overpay didn't get to. That
is now reversed: the player gets the choice. **But the reversal is partial by design** — conservation
survives as the *default* (see below), so a player who doesn't actively choose still gets the
conservation-optimal outcome. D-37's conservation is demoted from *enforced* to *default*, not deleted.

**Interaction (one button at a time — honours the "no dropdown / no multi-select" constraint):**
1. Stall; **both** boost types resolve it; player holds both → the action button reads **"Use boost."**
2. Tap **"Use boost"** → the game previews the **lower-value 1-for-2** first (the conservation
   default). On-screen text shows what that boost would do / how it plays out *for this roll*. The
   action button relabels to **"Change boost."** Confirm is available.
3. Tap **"Change boost"** → cycles to the overpay boost; the preview updates. Tapping again cycles
   back. Written to cycle through **the applicable-and-held boost set generally** (so a future third
   type doesn't break it), not hardcoded to two.
4. **Confirm** commits whichever boost is currently previewed.
5. **Only one boost resolves the stall** → no cycle: button stays "Use boost," no "Change boost"
   appears, Confirm commits the single option (unchanged from today).

**Key property — the default preserves conservation.** A player who taps Use boost → Confirm without
cycling spends the 1-for-2, i.e. **exactly what auto-select does today.** Only a deliberate "Change
boost" spends the overpay. So the common path is unchanged; agency is added on top.

**Out of scope.** A dropdown, radio list, or simultaneous multi-boost picker (explicitly rejected).
Changing which boosts are *offered* (the applicable-set logic from M7 is unchanged — this only changes
selection *among* applicable boosts). Any change to the whole-rack-block (D-48) or last-tile rules.

**Do-not-touch on entry.** The M7 offer/applicability logic (`selectBoostTypeToOffer` becomes the
*default* selection, not the *only* one); the boost-spent whole-rack guard (D-48); the earned/granted
timing (D-44).

**Acceptance criteria:**
1. Stalling with both boosts held and both resolving the stall, tapping "Use boost" previews the
   1-for-2 and shows a "Change boost" control.
2. Tapping "Change boost" cycles to overpay with an updated preview; tapping again returns to 1-for-2.
3. Confirm commits the previewed boost; the *other* boost's count is unchanged.
4. Use boost → Confirm with no cycling spends the 1-for-2 (default = today's auto-select outcome),
   leaving overpay untouched.
5. With only one applicable boost, there is no "Change boost" control and Confirm commits the one.
6. The preview text accurately describes what the currently-selected boost does for the current roll.

**Stop conditions.** If exposing the choice would let a player spend a boost that does **not** resolve
the current stall (i.e. the cycle includes an inapplicable boost), **stop** — only applicable boosts
are cyclable, same filter as the offer.

---

### M19 — Boost-earned toast travels into its chip — BUILT, VERIFIED (refines M14)

**Status: BUILT and verified (2026-09-19), motion + z-layering only, M14's toast machinery untouched
(only `triggerBoostToast` changed). Then revised once (2026-09-18) — see the reversal below.**
- Travel distance computed live via `getBoundingClientRect()` on the toast and the awarded type's
  chip (`playBoostChipEls[type]`), applied as a `transform` on a new `.traveling` class sharing
  `BOOST_TOAST_COLLAPSE_MS`. Arrival = the bump (chip `.pop` scale-bounce at the same instant M14
  already re-read the true count). Held-back-count logic unchanged.
- **REVERSAL (D-61): the toast flies OVER the chips, not under.** M19's own spec (and the earlier
  conversation) said the pill should pass *beneath* the chips. Per direct user request this was
  reversed — z-index swapped so `.boost-toast` (2) sits above `.play-boost-chips` (1). Nothing else
  changed. **The "under" wording in the desired-animation list below is superseded; current behaviour
  is over-the-chips.**
- **Simultaneous double-type award** (both types delivered at once) has no single destination chip —
  the spec only covered the single-type case, so the build falls back to M14's shrink-in-place (no
  travel) rather than inventing a split animation. Rare edge case; counts still bump correctly.

**Original spec below — accurate except the "beneath the chips" point (item 3), now reversed to over.**

**Goal.** Refine the **existing** M14 boost-earned toast so it visibly **travels into the correct
boost chip** rather than shrinking in place — making "where the boost came from and went" legible.

**This is a refinement of shipped behaviour, not a new build.** M14 already built the toast, the
held-back count (`boostToastState`), the timings (`BOOST_TOAST_DISPLAY_MS` / `BOOST_TOAST_COLLAPSE_MS`),
and the count-bump-on-merge. The state machinery and the fact that the count bumps *at merge* are
correct and stay. **Only the visual motion changes.** Do not rebuild the toast system.

**The desired animation (per the user):**
1. The toast pill appears (right-aligned, as today), showing the awarded boost's name.
2. After its hold period, it **slides left while shrinking** (width + opacity).
3. It slides on a layer **beneath** the boost chips (chips sit on a higher z-layer, so the pill passes
   *under* them).
4. Its travel target is the **specific chip for the awarded type** (the overpay chip vs the 1-for-2
   chip — different positions in `.play-chrome-row`), not a generic spot.
5. **At the moment the pill reaches that chip's position**, the chip **"pops"** and its count
   increments — the arrival *is* the bump. (Re-anchor M14's existing bump from collapse-finish to
   travel-arrival if they differ.)

**Out of scope.** The toast's content/text, the held-back-count logic, the earn/grant timing, and
which chip corresponds to which type (all unchanged from M14). This is motion + z-layering + retiming
the bump to arrival.

**Do-not-touch on entry.** `boostToastState` and the delivery logic (`deliverPendingBoost`); the boost
counts themselves; M18's spend UI (M18 and M19 both touch `.play-chrome-row` but are independent — one
is spend, one is award).

**Acceptance criteria — checkable by watching an award:**
1. On a boost award, a named pill appears right-aligned, then slides left and shrinks.
2. The pill passes **under** the boost chips (occluded by them), not over.
3. The pill's destination is the chip of the **awarded type** — an overpay award travels to the
   overpay chip, a 1-for-2 award to the 1-for-2 chip.
4. The target chip pops and its count increments **at the moment the pill arrives**, not before.
5. A rare same-type double-award still bumps the count by the correct amount at arrival (M14's exact
   held-back amount, not a hardcoded step).

**Stop conditions.** If making the pill travel across/over the chips requires restructuring
`.play-chrome-row` in a way that disturbs M18's spend controls or the settings cog, **stop and
report** — this is an animation layer over the existing row, not a re-layout.

---

### M-Maint — accumulated maintenance / GH issues / PWA / fonts — BUILT, VERIFIED

**Status: BUILT and verified (2026-09-13 → 2026-09-19), a running series of small fixes and additions
logged in DECISIONS.md rather than as numbered milestones. Recorded here so the plan reflects reality.**
- **GH issues #1–#6:** rack-grid pre-roll resize (extension of the total-line min-height fix — same
  "measured, not estimated box height" class as §7), avatar Play-crop + turn-card avatar iteration,
  Play/turn-card UI fixes, "Selected: X/X" repositioning, Play screen made uniformly fixed-height, and
  a real-device settings-icon-still-blue fix.
- **Two font swaps:** Bagel Fat One → **Vollkorn Black** (display), Figtree → **Overpass** (UI). The
  plan does not pin a font name (§7 / earlier notes) — current family lives in `index.html`/CSS.
- **PWA install wiring:** manifest + head tags, adapted from the Spudling project — the app is
  installable to a home screen. (Note: does not change the offline story materially; fonts still load
  via network `<link>` per D-53's accepted caveat.)

No rules/engine/mechanics changes in any of these; all are chrome, layout-measurement, or packaging.

---

### M20 — Avatar grid picker — SPECIFIED

**Goal.** Give players a fast way to reach a *specific* avatar out of the (now ~36) set, without
cycling past it — while keeping cycling for the casual "just give me a different one" case.

**Why (from real play).** Cycling is well-accepted and is **not** being replaced — the only pain is
the targeting case: a player knows which avatar they want, or has just overshot it. At ~36 avatars,
linear cycling can't serve that case. A grid gives random access. Avatar-changing is understood as a
**gimmick, not a gate** — most players keep their random-assigned one; the grid is opt-in for the few
who care.

**Interaction:**
- **Tap avatar → cycle** (unchanged — keep exactly as shipped).
- **Tap-and-hold avatar → open the grid.**
- **A visible hint label** near the avatar signposts both (e.g. "Tap to change · hold to choose" —
  final wording at build). This is deliberately **not** a hidden gesture: the label plus social
  discovery (kids copy kids, parents explain once) makes it a signposted affordance.

**The grid:**
- A **large floating modal above the player screen**, built in the **existing dialog/overlay idiom**
  (reuse `.dialog`/sheet, not a bespoke surface). Obvious dismiss (tap-outside and/or an X).
- Shows **all avatars** as thumbnails, scrollable, sized for comfortable kid tap targets.
- **Tap a thumbnail = select and close** in one action (no separate pick-then-confirm step — that
  friction is the thing being removed).
- **Grid states: the player's own current avatar shows the equipped yellow checkmark; all others are
  normal and all tappable.** No dimming of any avatar.
- **No uniqueness enforcement (soft).** Multiple players may share an avatar; there is no rule against
  it and none should be added. Player identity is carried by colour + name + turn context, so avatar
  collision is never ambiguous. (Note this **deliberately differs** from the taken-*colour* swatch
  behaviour, which dims-as-hint — avatars and colours have different uniqueness stances on purpose; do
  not "fix" the inconsistency by adding dimming to the avatar grid.)

**Preserve fast-start.** Random-assign-at-game-start stays the default (D-55); nobody must touch
avatars for the game to be playable. The grid is purely opt-in. Do not turn avatar selection into a
pre-game step every player sits through — that is the exact time-sink the random-assign default exists
to prevent.

**Out of scope.** Any change to cycling (kept as-is). Uniqueness enforcement. Dimming/blocking taken
avatars. Any in-app avatar *creation* (the creator stays out of scope; only the fixed PNG set is used).
Changing the random-assign default.

**Do-not-touch on entry.** The cycle interaction; the random-assign logic (`assignAvatars`); the
colour-swatch taken-dimming (a separate, deliberately different pattern); the avatar reference model
(players hold an id/filename — grid selection sets that same reference).

**Acceptance criteria — checkable by using the app:**
1. Tapping the avatar still cycles (unchanged).
2. Tap-and-hold opens a large modal grid above the player screen; a visible hint label near the avatar
   tells the player both gestures exist.
3. The grid shows all avatars scrollably; tapping one sets it and closes the modal in a single action.
4. My own current avatar shows the yellow (equipped) checkmark in the grid; no avatar is dimmed.
5. I can select an avatar another player already holds (no block, no warning) and the game proceeds
   with no ambiguity (colour + name still distinguish us).
6. Starting a game without opening the grid still assigns everyone a random avatar and is immediately
   playable — the grid is never forced.
7. The modal has an obvious way to dismiss without selecting (tap-outside or X), leaving the current
   avatar unchanged.

**Stop conditions.** If the grid modal can't reuse the existing dialog/overlay pattern without a
bespoke surface, **stop and report** rather than building a one-off. If tap-and-hold conflicts with the
existing roster drag-to-reorder (D-50) Pointer-Events handling on the same avatar element, **stop and
report** the gesture clash rather than working around it silently.

---

## 6. Explicitly out of scope for this prototype

- **Single-player mode.** Playable in principle but the design has not been worked out.
- **The single-type overpay boost (M6) is CLOSED and verified; the two-type expansion (M7) is
  specified but not built.** M6 shipped the single overpay boost; the 1-for-2 second type, typed
  inventory, auto-select, and per-type reward model are M7 (§3.6b), not started until the
  orchestrator design pass finishes.
- **Any purchase, currency, or store for boosts.** Earned-only, in-memory; monetisation is intent,
  not scope.
- **The block-dice boost, and any targeted / inter-player / duration-based boost — BENCHED.**
  Considered and parked as too big a stretch for now: unlike the self-affecting boosts (holder-spent,
  resolved at one's own stall), block is spent *on another player*, affects their *next* turn, and
  needs a target picker, a duration, and active-effect-on-target state — a whole subsystem the
  current architecture has nowhere to put. If it ever returns it is **its own future milestone**,
  and these open questions must be answered first: the two clocks ("one block per turn" vs "affects
  next turn"); whether a block on an already-single-die player is wasted or disallowed; whether/how
  the target is told they were blocked and by whom. Recorded so it is not lost; not built.
- **Further boost types beyond overpay + 1-for-2.** The system is typed and the reward model is
  per-type-pool, so more types are additive — but the scoped set is overpay (M6) + 1-for-2 (M7).
- **Cross-session persistence of boosts or player identity.** Boosts live only within a single
  app session and are lost on reload.
- **Sound and haptics.**
- **Character/mascot art on tiles.** Tiles show plain numerals (D-13) — unchanged and permanent.
  Flip the character is cut (D-53); Spudlings (the brand's characters) appear as avatars and on
  splash/wordmark, never on tiles.
- **Avatars — now IN, built in M13 (was future).** Resolved: a fixed set of 20 pre-made Spudling
  PNGs, random-assigned + cycle-through (D-55). No in-app avatar *creation* (the creator stays out
  of scope); no per-game character-creation gate (the risk that drove the original deferral). See
  M13.
- **The Spudling avatar creator, and any in-app avatar creation flow.** Only the creator's PNG
  output is used (the 20-set); the creator itself is never in or near the product.
- **Tile theme customisation UI.** The theme config hook exists in code (M1); no UI.
- **Monetisation, store presence, purchases of any kind.**
- **Unity or any 3D/native implementation.** A later product decision, not this prototype.
- **Persistence of a game in progress.** Reload starts fresh.
- **Remote or networked multiplayer.**
- **An enforced orientation.** Orientation is not locked (§4.3); portrait tested fine. The
  final orientation/layout is a design-session decision, subordinate to the handoff feel.
- **Dynamic/global overpay (the cut "mode C").** Overpay that switches on automatically for
  everyone past a threshold was considered and cut: the trigger could not be stated as a
  measurable rule and a silent mid-game rule change is illegible to players. The lesson —
  any active rule-changing mode must announce itself on screen — is carried into §3.6.
- **Licensing.** The repo ships with **no LICENSE file** — under default copyright this means
  all rights reserved, which is the correct posture for something that may become a paid
  product. Do not add a permissive license (MIT etc.) now: it would let anyone copy and ship
  the game, including a version that competes with a future paid release, and it cannot be
  cleanly walked back. Licensing is revisited if and when the product becomes real. Not this
  session's concern.

---

## 6a. Open design-session questions (external Claude Design)

Recorded so they are not lost and so no current decision forecloses them. **Not** for the Code
executor to resolve.

- **Final orientation and layout.** Portrait plays fine; landscape or portrait is a design
  call. Constraint: whatever is chosen must not disturb the verified shove/lift handoff feel
  (§4.3, D-26).
- **~~Avatars / Flip-vs-Spudling~~ — RESOLVED** (M13/M14/M15, D-53/54/55): Flip cut, Spudlings in as
  a 19-PNG avatar set (random-assign + cycle), name kept. No longer open.
- **Player colour #3 "Honey" (`#E4BE2F`) fails light-theme contrast** (3.59:1 vs a 4.5:1 target) —
  the only one of the 12 that fails. It is a shared identity/tile colour, so re-picking its edge or
  hue is a **design decision, not a code call** (flagged from M14). Needs a design ruling.
- **Per-turn shot-clock as a future game mode.** The current time challenge is a single whole-match
  countdown (anti-drag, no winner on timeout). A M15 mockup implied a *per-turn* shot clock instead —
  not built (semantics were kept whole-match), but flagged as a **plausible future alternative mode**
  worth designing deliberately if pursued. Not a bug; a mode idea parked for the design track.

---

## 6b. Parked — next milestone (NOT specified, do not build yet)

Captured so it survives; two open points and two knock-ons to settle before it becomes a milestone.

**Idea — mode cleanup + move mode choice to the launch screen.**
- **Overpay mode D moves out of Rules into the Dev menu.** D is effectively unused in play; it stops
  being a player-facing rules setting and becomes a dev/experimental toggle. Player-facing rules
  simplify to strict-A only.
- **The launch screen becomes the mode picker.** Rename "Tap to start" → **"Play"** (or "Normal
  play" — decide at build). Layout: **Play / + / [Timer toggle] [Boosts toggle]**, where the **"+"
  is a separator** (Play is the base game; the two are optional additive modifiers), **not** a reveal
  — both toggles are always visible.
- **Two independent toggles, both allowed on together** — giving all four states naturally: neither
  (plain A), timer-only, boosts-only, both. (Supersedes the earlier at-most-one three-button sketch,
  which had no clean path to plain-A.)
- **Play is the single commit action; the toggles are pure pre-selects** (flip them, then tap Play
  to start with those settings) — avoid any design where a toggle also starts the game.

**Open UX point to test (not decided):** whether putting mode choice on launch, while rack
size / placement / motion / theme stay in the tabbed menu, creates a confusing **two settings
locations** split — the launch screen must not read as "all the settings there are." Advice on
record: keep toggles always-visible (reads as options, not steps); one clear Play button. Build and
playtest before locking.

**Knock-on 1 — theme inversion.** With D gone, the theme flip stops being the overpay-D signal.
Repurpose it as the **boost signal**, kept **momentary** (flips during the overpay move a boost pays
for, reverts after — the existing D-34 boost-spend behaviour), NOT sustained-while-holding (which
would leave the screen inverted through most of the endgame). **The actual small gap to close: verify
the 1-for-2 boost triggers the flip, not just the overpay boost** — today the flip may be overpay-only.

**Knock-on 2 — reconciliation debt.** Building this rewrites **D-34** (its "mode D active" sustained
branch becomes dead code; only the boost-move branch survives) and re-frames **D-59**/the theme-flip
description from "overpay signal" to "boost-active signal." A supersession to write, not a silent edit.

---

## 7. Unmeasured values — do not estimate

The following must be measured in M0 and recorded in `config.js` with the measuring device
and date. Until then, no number for any of these may appear in code or in any document as
though it were known:

- gravity z-component threshold for "flat"
- x/y magnitude tolerance for "flat"
- motion magnitude threshold for "still"
- **rest-to-flip delay** (debounce before a rest flips the view — found too long in M4, must
  beat a fast tap while staying bump-safe; see M0 criterion 8)
- whether iOS motion permission persists across a Safari relaunch on the play origin
- whether device orientation is reliably readable during a lift

---

## 8. Decision log

| # | Decision | Status |
|---|---|---|
| D-01 | One roll per turn, round-robin, no re-rolling within a turn | Locked |
| D-02 | Win = shutting the box; remainders never affect winning, never shown as score, never rank a player. Remaining sum may be computed **internally, for boost eligibility only** (§3.4) | Locked |
| D-03 | Single-die endgame is mandatory, unlocking when all open tiles ≤ 6 | Locked |
| D-04 | Full-subset flips; no cap on tiles per flip | Locked |
| D-05 | Stalling passes the turn; it never eliminates a player | Locked |
| D-06 | Placement is finishing order; default `winner-only`; `all-places` ends at second-to-last shut | Locked |
| D-07 | n players, 2 or more, no upper cap | Locked |
| D-08 | ~~Always landscape~~ **Superseded by D-26:** no orientation lock; portrait tested fine; final orientation is a design-session call | Superseded |
| D-09 | Rack size 9 or 12, settings-selectable, default 9 (blocked mid-game) | Locked |
| D-10 | Plain static HTML/CSS/JS, no build step, no dependencies | Locked |
| D-11 | Play origin must be HTTPS; ngrok is a dev tool only | Locked |
| D-12 | Motion is an accelerator on a tap path that always works | Locked |
| D-13 | Tiles show plain numerals. **(Flip framing superseded by D-53: Flip the character is cut; tiles-stay-plain-numerals still holds regardless — characters and numbers are separate systems.)** | Locked (numerals); Flip part superseded |
| D-14 | Theme config hook exists from M1; no customisation UI | Locked |
| D-15 | Public GitHub repo `flip`, served by GitHub Pages | Locked |
| D-16 | Neutral landing page at `/`, app at a sub-path; presentational, not a security measure | Locked |
| D-17 | No real family or child names committed to a public repo | Locked |
| D-18 | Overpay is an A/D toggle (A strict default; D overpay ≤ total, **a whole-rack-shutting selection must be exact** — D-45); MVP ships A and D | Locked |
| D-19 | ~~B is a reserved slider position~~ **Superseded by D-27:** overpay is a toggle + a boost checkbox, not a 3-way slider; there is no B button | Superseded |
| D-20 | ~~max 3 per player~~ **Superseded by D-35:** inventory capped at 3 *total across types*; boosts never close the last tile; monetisation is intent not scope; in-memory session-only | Superseded |
| D-21 | Motion mechanic on/off toggle, default ON; OFF uses the existing tap-only path, not a new one | Locked |
| D-22 | "Dynamic overpay" (mode C) cut — trigger not measurable, silent rule change illegible | Locked |
| D-23 | ~~single overpay boost~~ **Superseded by D-35–D-38:** boost system is now two-type; spend is one/turn, no chain, offered not forced, never last-tile, session-only | Superseded |
| D-24 | Boost award criteria (MVP, shared by both types): dry streak (not 3 clean rolls in last 5) and trailing-at-finish (most open tiles when any player shuts) | Locked |
| D-25 | Leader is not excluded from earning boosts; no re-earn on the turn a boost is spent | Locked |
| D-26 | No orientation lock; portrait tested fine (M4); final orientation is a design-session call, subordinate to the verified shove/lift handoff feel | Locked |
| D-27 | Overpay UI is an A/D toggle plus a boost checkbox (checkbox live only when toggle = A); three reachable states A / A+boost / D; no D+boost | Locked |
| D-28 | ~~MVP has one boost type~~ **Superseded by D-35:** boost system is typed with two MVP types (overpay, 1-for-2), both A-only because redundant under D; future types may apply under D — never write "D has no boosts" | Superseded |
| D-29 | Tap-to-proceed toggle: default ON in development, OFF in final build; motion and tap can never both be effectively off; `effective_tap = user_pref OR (motion not working)` | Locked |
| D-30 | Settings reachable mid-game with three kinds: immediate (motion, tap), live-at-end-of-lap (placement, overpay, boost checkbox), blocked-until-next-game (rack size, roster) | Locked |
| D-31 | Rest-to-flip delay is an M0-measured constant with a debug slider; too long in M4; must beat a fast tap while staying bump-safe; crossed bounds = stop condition | Locked |
| D-32 | ~~Avatars are future; random-avatar start, customisation as a post-game reward; Flip-vs-avatar hierarchy open~~ **Superseded by D-55:** avatars are now IN as a fixed set of 20 pre-made Spudling PNGs — random-assign-without-replacement at start, cycle-through to change; the avatar creator is out of scope (only its PNG output is used). The "random at start" intent carries; "customise as reward" is moot (no creator in-product) | Superseded |
| D-33 | Lap boundary is anchored to the earliest active seat (P1 or earliest unfinished), not the requesting player's seat | Locked |
| D-34 | Theme flip is the overpay signal — inverted **exactly when an overpay move is currently legal** for the current player. Predicate: (mode D active AND current player has >1 tile open) OR a boost overpay move in progress. The >1-tile carve-out (commit `077dc7d`) prevents a false "you can overpay" signal at the whole-rack/last-tile exact-match point. Turn card / launch / boost banner stay theme-independent | Locked (rev per DECISIONS.md 2026-09-11) |
| D-35 | **(M7, not built)** Two boost types — overpay (voids some pips, subset ≤ total) and 1-for-2 (voids one whole die); typed inventory capped at 3 total across types; both self-affecting stall-rescues. Live build is single-type overpay only (M6) | Locked (M7) |
| D-36 | Built in M7. Spend is offered (spend-or-stay); type auto-selected, only boosts that resolve *this* stall are offered. **Partially superseded by D-56 (M18):** when both resolve, the player can now cycle to choose; auto-select becomes the *default*, not the only path. The applicable-set filter (only stall-resolving boosts) still holds | Locked; spend-choice part superseded by D-56 |
| D-37 | Built in M7. Auto-select prefers 1-for-2 when both resolve (conserve overpay); overpay strictly dominates 1-for-2 (both→1-for-2, only-overpay→overpay, neither→no offer). **Superseded by D-56 (M18):** conservation is now the *default* (1-for-2 shown first) but overridable by the player, not enforced | Superseded by D-56 |
| D-38 | **(M7, not built)** Reward model: each type owns a criteria pool (may overlap); shared-criterion awards pick a type by a configurable distribution variable (default 50/50); MVP both types share the D-24 criteria | Locked (M7) |
| D-39 | Block-dice and any targeted / inter-player / duration boost is benched; if revived it is its own milestone with targeting/duration state and the parked open questions answered first | Locked |
| D-40 | M4 (continuous-rotation handoff) CUT — never attempted, no open problem it solves; M3 tap/motion handoff feels fine; do not revisit without a new decision (per DECISIONS.md 2026-09-11) | Locked |
| D-41 | M6 CLOSED at single-type overpay scope (verified); the two-type expansion is split into M7, specified but not started until the orchestrator design pass finishes (per DECISIONS.md 2026-09-11) | Locked |
| D-42 | Dev-mode tab (M8) separates exploratory/debug controls from the clean production settings surface — **this part still holds.** ~~§3.3 unchanged, default one die, single-die endgame rule untouched; the once-per-game-toggle idea is not adopted as a production rule~~ **superseded by D-49:** production dice-count went through a further revision after this row — see D-49 for the current, twice-revised state | Partially superseded |
| D-43 | Time challenge (M9, dev-mode) is an anti-drag circuit-breaker: 15s-min picker + Set, HUD timer paused (visibly) on turn screens, on timeout the game ends with a deliberate **no-ranking** "Time's up" screen. Random placeholder rankings rejected | Locked |
| D-44 | Boost timing distinguishes **earned** (award criterion fires) from **granted** (credit delivered + announced at the start of the earning player's next turn); §3.6 "announced when granted" refers to the granted moment (per DECISIONS.md 2026-09-11) | Locked |
| D-45 | Overpay/boost may not close a selection that would **shut the whole rack** (any selection covering every open tile needs exact match) **when no boost is being spent**; generalising the earlier singular "final tile" wording; shipped commit `f262a7d` | Locked |
| D-46 | Reconciliation rule: DECISIONS.md entries are folded into this §8 at the start of each orchestrator session before new work; once folded, the entry is stamped "Reconciled into §8" so pending vs absorbed is visible | Locked (process) |
| D-47 | M10 dice animation is the face-cycle (+ optional CSS shake), result decided by `Math.random()` before the animation which only displays it; covers the single-die endgame; must not fight the theme-inversion signal; CSS-3D dice explicitly out of scope | Locked |
| D-48 | **Stricter than D-45:** a move made by spending a boost, of either type, may never close the whole rack — not even on an exact match. Principle: a boost may advance a player, never finish them. Found live via 1-for-2 on a {4,1}/5+2 case; generalizes to the overpay boost too, correcting M6's original enforcement, which only checked "must be exact," not "must not happen at all," for boost-spent moves | Locked |
| D-49 | **Supersedes the production-facing part of D-42.** Production dice-count once unlocked is a **silent single die, no player-facing choice, no toggle, no prompt** — not "chooses 1 or 2, default 1, changeable with a tap" as §3.3 originally read. The interactive per-turn choice model exists only as a dev-mode testing affordance (`devDiceChoice: 'ask'`, off by default). The last-tile-is-1 safety net remains unconditional and overrides every dev override | Locked |
| D-50 | Roster rotates by one seat after a **completed** game (the normal win screen's "New game" only — `roster.push(roster.shift())`) so a different player starts next by default; **not** applied on the M9 timeout screen's "New game," since a timeout is deliberately not treated as a completed round anywhere else (consistent with M9's no-ranking rule). Drag-to-reorder added to the setup roster list (Pointer Events, for touch support); disabled mid-game, matching existing roster-editability rules | Locked |
| D-51 | M11 (navigation/escape fixes), fully resolved: Pause button on Play reuses the existing tabbed Setup/Settings screen (not a new sheet); Restart match keeps roster/settings but **resets boosts to zero** (diverges deliberately from New Game, which still carries boosts forward); confirm guards wrap End/Restart/New-game while live; per-move undo confirmed **out of scope** (already ruled out pre-playtest, not a gap) | Locked |
| D-52 | M12 implements all four wireframed tabs (2a Rules, 3a Players, 3b App, 3c Dev) structurally now; skin lands the next day. Resolution rule: where the wireframe is silent on or conflicts with existing prototype functionality, the prototype wins and the mismatch is recorded for the design session — applied to keep drag-to-reorder (wireframe doesn't show it) and the full player-colour count (wireframe shows only 6 swatches). Time-challenge `0 seconds = off` adopted as a new clarifying detail. Dev-tab banner's "not shown in shipped build" claim flagged as undeliverable (no build step exists) and to be reworded. Supersedes M8's `<details>` container | Locked (structure); skin deferred |
| D-53 | Brand track resolved (M13). Flip the character is **cut**; name **"Flip the Number" kept** (flip = tile verb, no mascot dependency, zero repo/URL churn). Spudlings are **in as sidekicks + chosen avatars**, never as tile art (tiles stay plain numerals, D-13). Feel: warm handmade burlap storybook. Type: Bagel Fat One (display) + Figtree (UI) via network `<link>` — the §3.1 offline caveat is knowingly accepted | Locked |
| D-54 | Player palette (replaces the ad-hoc `theme.js` set): 8 CVD-safe hues + 4 graceful 9–12, each as `{fill, edge, ink}` (edge = dark partner = border + non-hue identity channel surviving the theme flip). Assign safe-8-first. Closed tiles use 3 individually-sufficient non-hue cues (desaturate + pressed inset + hollow numeral). Overpay XOR flips chrome only; player hues live outside the chrome-token system and never flip | Locked |
| D-55 | Avatars: a fixed set of Spudling PNGs in `app/avatars/` (**19 as shipped**, `config.js avatarCount`; the 20th was left ungenerated — no source asset and character art is barred), static, provisional/swappable (players hold an id/filename reference; a colour+monogram fallback `renderIdentityCircle` covers the pre-`assignAvatars` state). **Randomly assigned without replacement at game start** (unique per player, 19 ≥ 12 max), **cycle-through to change**. Avatar shows on the player screen (**gameplay chrome — supersedes the handoff's "never gameplay chrome" line**) and is the **primary 9–12 distinguisher** (avatar → name → colour past 8). The avatar creator itself is out of scope | Locked |
| D-56 | **Reverses D-36/D-37 (partially).** When a player holds both boost types and both resolve the stall, the player **chooses** which to spend via a one-button cycle-and-preview (Use boost → previews 1-for-2 → "Change boost" cycles → Confirm). Conservation is preserved as the **default** (1-for-2 shown first; tap-through = today's auto-select outcome), not enforced — so D-37's conservation is demoted from enforced to default, not deleted. No dropdown/multi-select. Only-one-applicable case unchanged. (M18) | Locked |
| D-57 | Boost-earned toast (M14, shipped) refined to **travel into its type's chip**: appears right-aligned, slides left + shrinks on a layer *under* the chips, arrives at the awarded type's specific chip, which pops and increments its count at arrival. Refinement of existing machinery, not a rebuild (M19) | Locked |
| D-58 | Two skins ship — Colorful (default) + Monochrome (`settings.skin`, cosmetic-only). Mono uses a computed HSL lightness ramp with reverse-engineered (unmeasured) starting values, flagged to revisit after a readability pass (M14) | Locked |
| D-59 | Time challenge is a **single whole-match countdown** ending the match with no winner (not a per-turn shot clock, despite an M15 mockup's copy implying otherwise). M15 restyled it; semantics unchanged. Per-turn shot clock parked as a future mode (§6a) (M15) | Locked |
| D-60 | Turn-card background history: full-bleed player colour (original) → themed surface (M15) → **reverted to full-bleed player colour (M17)**, theme-independent, chrome handled by scoped custom-property overrides on `#screen-turncard`. Current state = full-bleed | Locked |
| D-61 | Boost-earned toast (M19) flies **OVER** the chips, not under — reverses M19's own "beneath the chips" spec and the earlier conversation, per direct user request. z-index: toast 2, chips 1. Everything else in M19 (live-computed travel, arrival=bump, double-award shrink-in-place fallback) stands | Locked |
| D-62 | Avatar set grew 19 → **36** (`CONFIG.avatarCount`); six existing files replaced + 23 new 1024×1024 PNGs, zero-padded `NN.png`, no gaps. Assigned randomly without replacement (36 ≥ 12 max); larger set only lowers repeat-avatar odds across games. Avatars not persisted across games, so replaced filenames going to new art breaks no stored reference. Supersedes D-55's count | Locked |
| D-63 | Avatar grid picker (M20): tap = cycle (unchanged), **tap-and-hold = large modal grid** above the player screen (existing dialog idiom); visible hint label signposts both (not a hidden gesture). Tap-thumbnail = select-and-close. Grid states: own avatar = equipped yellow checkmark, all others normal + tappable, **no dimming**. **No uniqueness enforcement (soft)** — multiple players may share an avatar; colour + name + turn context carry identity. Random-assign stays the default; grid is opt-in. Deliberately differs from the dim-as-hint taken-*colour* behaviour | Locked |
