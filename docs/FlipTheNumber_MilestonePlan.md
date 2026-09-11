# Flip the Number — Prototype Milestone Plan

**Document status:** canonical milestone plan for the web prototype.
**Audience:** a Claude Code session with no prior context. Everything needed is in this file.
**Supersedes:** nothing. This is the first plan for this project.

**Revision note (latest pass):** orientation lock removed (portrait tested fine; final
orientation deferred to the design session); rest-to-flip debounce added as an M0-tuned
constant with a debug slider; overpay restructured from a 3-position slider into an **A/D
toggle + a boost checkbox** (checkbox live only while overpay = A); boost system made
**typed** to keep future non-overpay boost types open, including under D; mid-game settings
changes specified with a lap-boundary fairness rule and blocked/live tags; motion and
tap-to-proceed given a mutual "at least one always live" invariant; tap-to-proceed default is
ON in development, OFF in the final build; avatars and the Flip/Spudling character question
recorded as open design-session items with the roster slot held open.

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
- Once unlocked, that player chooses **one die or two dice** before each roll.
  **Default the choice to one die**, changeable with a single tap.
- This rule is **mandatory, not optional, and must not be made a settings toggle.**
  Reason: two dice cannot total 1. A player whose only remaining open tile is `{1}` can
  never close it with two dice, and since the win condition is closing every tile (§3.4),
  the game would hang forever. The single-die endgame is the only thing that guarantees a
  rack can always be finished.

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
    **Mandatory exception, established in testing: the final remaining tile must still be paid
    exactly** — overpay may not close the last tile, or the endgame loses all tension.
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

**Note for M6 acceptance wording:** "select mode B" means "set the overpay toggle to `A` and
check the boost checkbox." There is no `B` button; the boost mode is an emergent state of two
controls.

### 3.6 Boost system (strict base + earned boosts) — SPECIFIED
The boost mode is strict base play (exact-sum, as `A`) plus earned, spendable **boosts** that
let a struggling player rescue a stall. It is the middle ground between A's friction and D's
looseness, and the comeback mechanic that keeps trailing kids in the game. Built in M6.
Reached via the overpay toggle = `A` with the boost checkbox on (§3.5).

**The system is a typed inventory with a pluggable reward model — this is the architecture.**
- A boost has a **type.** The MVP ships **two types** (both stall-rescues, both holder-spent,
  both self-affecting — no targeting, no durations, no inter-player effects):
  - **Overpay boost** — grants one move whose selected open tiles sum to **any value ≤ the roll
    total** (voids *some pips* of one die).
  - **1-for-2 boost** — grants one move that **ignores one whole die** and plays the other die
    as a single value (voids a *whole die*). E.g. rack {3,7,8,9}, roll 3+3 (total 6) stalls
    under strict rules; 1-for-2 lets the player play a single 3 and close the {3}.
- A player holds a **mixed, typed inventory** — model it as typed from day one (e.g.
  `{ overpay: n, oneForTwo: m }` or a list of typed boosts), **never a single bare integer.**
  Adding further types later must be additive.
- **Inventory cap: 3 boosts total across all types** (not 3 of each). A player may hold any mix
  summing to 3 — e.g. 2 overpay + 1 one-for-two. Awards beyond 3 total are discarded (no
  overflow store). The types compete for the same 3 slots.
- **Both current boost types are only meaningful under strict base play (`A`)**, because `D`
  already grants free overpay and 1-for-2 is strictly weaker than that. This is why the boost
  checkbox is A-only (§3.5). It is a property of *these two types' effects being redundant under
  `D`* — **not** a rule that `D` forbids boosts. A future type whose effect is not redundant
  under `D` may be offered under `D`. **Never write "D has no boosts."**

**Spending — offered, auto-selected type, one per turn:**
- **One boost per turn. No chaining.**
- **Never closes the final remaining tile.** The last-tile-exact rule holds absolutely for any
  boost.
- **Offered, never force-spent.** When a player would otherwise stall and holds ≥1 boost that
  would *actually resolve this stall*, the game shows a single **spend-or-stay** choice (as in
  the current build: "Spend … / Stay stalled"). Declining leaves them stalled, inventory
  retained.
- **The type is auto-selected, not chosen by the player.** There is never a which-boost picker;
  there is only ever one usable option plus "stay stalled." Selection rule:
  - Compute which of the player's held boost types would resolve the current stall.
  - **If both an overpay and a 1-for-2 would resolve it, auto-select the 1-for-2** — the weaker,
    less versatile boost — to **conserve the more powerful overpay** for a stall only it can
    rescue.
  - If only one type would resolve it, select that one.
  - If none would resolve it (or the player holds none), **no boost is offered** and the player
    stalls normally.
  - **This is provably total:** overpay's reachable set (any subset ≤ roll total) is a superset
    of 1-for-2's (a single die's value is always ≤ the two-die total), so **whenever 1-for-2
    resolves a stall, overpay resolves it too.** The three live branches are therefore: both
    resolve → 1-for-2; only overpay resolves → overpay; overpay doesn't resolve → no offer.
- **The offer names the boost being spent** ("Spend a 1-for-2 boost?" / "Spend an overpay
  boost?") so the player sees which of their inventory is going — the visibility rule below.
- **Accepted by-design edge case:** a player who could reach a marginally better rack state by
  spending overpay instead of the auto-selected 1-for-2 does not get to choose. Conservation of
  the stronger boost wins; locked.

**Boost lifetime:**
- Held **in the in-memory roster**, stacking across replays **within one app session only.** A
  fresh app launch starts everyone at zero. No cross-session persistence, no stored identity.

**Reward model — per-boost criteria pools, random tie-break:**
- **Each boost type owns its own pool of award criteria.** Pools may overlap fully, partly, or
  not at all.
- **When a criterion fires that is shared by more than one boost type, one of those types is
  awarded at random.** The distribution is a **single configurable variable in code** (default
  **50/50**; any split is allowed and valid — e.g. weighting toward the weaker 1-for-2 to keep
  overpay scarce is a legitimate later tune).
- **MVP configuration:** both types (overpay and 1-for-2) share the **same** criteria set — the
  existing overpay criteria below. So in the MVP **every boost award is a 50/50 roll between the
  two types.** The per-type-pool machinery is built but not yet exercised with divergent
  criteria; that divergence is a later tune, not MVP work.

**Award criteria (shared by both types in the MVP) — a boost is awarded when either fires:**
1. **Dry streak.** The player has **not had three clean (legally resolvable) rolls within their
   last 5 rolls.** Evaluated per player on each of their rolls, over their own rolling window of
   5. (A "clean roll" is one where a legal exact move existed, boost or not.)
2. **Trailing at a finish.** The moment any player shuts their rack, the player with the **most
   tiles still open** is awarded a boost. Ties: all tied players get one. Reads remaining-tile
   counts internally, permitted by §3.4.

When a criterion fires, apply the reward model above to decide *which type* is granted (MVP:
50/50), then apply the cap (3 total; discard if full).

**No eligibility floor.** The leader is **not** excluded from earning boosts. If the
front-runner becomes eligible it means even they are stalling, so the game is dragging — a boost
there speeds it toward an end. Do not add a "leader cannot earn boosts" rule.

**No re-earn on spend.** A player is **not** awarded a boost on the same turn they spend one.

**Visibility (mandatory):**
- Each player's **typed inventory** is visible on their own screen — how many of each type, not
  a single undifferentiated count. (The current "Overpay boosts: N" counter must become
  type-aware; the exact visual is a design-session item.)
- **Every boost award is announced on screen** at the moment it is granted, **naming the type
  awarded** (the 50/50 outcome is a rule-affecting event the player must see).
- The spend offer names the type being spent (above).

**Still tunable after playtest (not blocking M6):** the dry-streak ratio; whether condition 2
fires mid-game rather than only at a finish; the award-type distribution variable; and,
eventually, giving the two types divergent criteria pools. All are labelled starting points in
`config.js`.

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
- **Mode `D` → sustained inversion.** While overpay-`D` is the active ruleset, the theme stays
  inverted for the **whole duration `D` is on** (respecting the lap-boundary timing of the
  overpay setting, §3.10). This is an ambient "you are playing in overpay mode" cue that persists
  between rolls — it is a **mode-state** signal, not a per-move flash. Turning `D` off (at the
  lap boundary) reverts the theme.
- **Boost spend → momentary inversion.** A boost is a per-move event, not a mode, so its signal
  is momentary: the theme inverts **for the duration of the overpay move a boost pays for**, then
  reverts. It does not persist, because nothing is "in overpay" between boost-spends.

**Do not** invert the theme merely because a given roll *happens* to be overpay-resolvable, or
during the stall/boost-offer decision before a boost is actually spent — the signal tracks
"overpay rules are in force" (mode `D` on, or a boost being spent now), not per-roll
resolvability. The single predicate is: overpay-`D` active **OR** a boost overpay move in
progress.

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
  `D`, a move is legal if selected tiles sum to ≤ the roll total, except the final tile which
  must be exact. The **boost checkbox** is present and interactable only while the toggle is
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
   flip tiles summing to 9) — **except** I cannot close my final remaining tile unless the
   roll can pay it exactly.
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

### M4 — Continuous-rotation handoff (spike, cuttable) — **CUT (D-40)**

**Status: CUT. Not built, not scheduled, do not revisit without a new decision to do so.**
M0's orientation-during-lift finding (readable and meaningful — FINDINGS.md criterion 6) kept
this spike *viable*, but it was never attempted: the M3 tap/motion turn-card handoff was
tested in real multi-kid play and the feel is good as shipped. There is no open problem this
milestone would fix, so there is nothing to spend the build-and-verify cost on. See D-40.

The original scope is kept below for the record only — **none of it is built:**

<details>
<summary>Original goal, scope, and acceptance criteria (historical — cut before attempting)</summary>

**Goal.** Find out whether the phone can be picked up, turned 180°, and set down again with
the game staying in play — no turn card at all.

**Scope.**
- During a lift, read device orientation (§4.3) and latch the last valid landscape
  orientation at the moment the phone returns to flat.
- If the latched orientation differs from the previous one, treat the set-down as a
  completed handoff and advance the turn without showing a turn card.

**Acceptance criteria:**
1. Picking the phone up, rotating it 180°, and setting it down advances to the next
   player's rack, correctly oriented, without a turn card.
2. Picking the phone up and setting it down **without** rotating does not advance the turn.
3. Ten consecutive handoffs performed at natural speed give ten correct results.

**Stop conditions.** If criterion 3 cannot be met, **cut the milestone and report.** This
is explicitly an enhancement. A wrong-player-advance is a far worse outcome than a turn
card.

</details>

---

### M5 — (reserved / no-op)

The motion on/off toggle originally imagined as its own milestone is **not a separate
milestone.** The setting is built in M2 (stored) and given its runtime effect in M3 (read).
Nothing remains for an M5. This heading exists only so the numbering is not misread as a gap.
Do not create work here.

---

### M6 — Boost system (strict + earned overpay boost) — **CLOSED at single-type scope (D-41)**

**Status: CLOSED.** M6 shipped and is complete as the **single-type** boost system (the
overpay boost only) — the scope it had before the plan revision that added the two-type
design (D-35–D-38) below. That expansion is real, still wanted, and **not built** — it is
its own milestone now, **M7**, not started, design still pending from the orchestrator (see
`docs/DECISIONS.md`). Splitting it out is what lets M6 close: nothing currently shipped
needs the second boost type to be correct or complete on its own terms.

**Shipped, verified scope (this is what "M6 done" means now):**
- Boost checkbox (built inert in M2) is functional whenever overpay = `A`; greys out and its
  value is ignored the moment the toggle reads `D`.
- Single boost type, `{ overpay: n }` — typed as an object from day one (D-35's typing intent
  honoured even though only one type exists yet), capped at **3 held**, in-memory only, lost
  on reload.
- Award criteria (D-24): dry streak (fewer than 3 clean rolls in the last 5) and
  trailing-at-finish (most open tiles the moment any other player shuts, ties all awarded).
  No re-earn on the turn a boost is spent.
- Spend is **offered, never forced** (spend-or-stay), and only when holding ≥1 boost would
  *actually resolve* the current stall — never a dead offer. One spend per turn, no chaining,
  never closes the final remaining tile (and, per the whole-rack generalization below, never
  closes the whole rack imprecisely even across several tiles).
- **Award timing (reconciles with §3.6's "announced at the moment granted"):** a boost is
  *earned* the instant its condition fires, but *granted* — credited to the spendable
  inventory and announced on screen — at the start of the earning player's next turn, the
  first moment it's actually usable. Multiple credits can stack before delivery; a credit is
  silently dropped if the game has left boost mode before its delivery turn arrives. See
  `docs/DECISIONS.md`, 2026-09-11.
- **Overpay resolution generalized beyond the original wording:** the exact-match exception
  applies to any selection that would shut the whole rack, not only a literal single
  remaining tile — closing several tiles at once via a big overpaid roll is blocked the same
  way, with an on-screen message telling the player to exclude a tile. See
  `docs/DECISIONS.md`, 2026-09-11.
- Boost count visible on the player's own screen; replaced with an explicit "No boosts for
  the last number" note while down to one tile, rather than showing a count that implies a
  boost could help there.

**Verified:** via temporary debug hooks and full automated playthroughs across this session
(zero console errors), plus real playtesting that surfaced and closed the two fixes above.

The original goal/scope/acceptance-criteria text is kept below for the historical record —
**the two-type-specific items in it (criteria 4, 7, 9, and the typed-inventory/auto-select/
reward-model scope bullets) now belong to M7, not M6:**

<details>
<summary>Original M6 text, as written before this split (historical)</summary>

**Goal.** The boost checkbox (available while overpay = `A`) becomes functional: strict base
rules with a **two-type earned boost inventory** (overpay + 1-for-2), per §3.6. There is no `B`
button — reached by toggle `A` + boost checkbox on (§3.5).

**Sequencing note.** M6 comes *after* real multi-kid sessions on `A` and `D`, so the criteria
and award distribution can be tuned against observed stall frequency. Build the §3.6 values as
labelled starting points; expect to adjust. Sequencing preference, not a hard block.

**Scope.**
- Make the boost checkbox (built inert in M2) functional while overpay = `A`.
- **Typed inventory** per player (§3.6) — e.g. `{ overpay: n, oneForTwo: m }` or a typed list,
  **never a bare integer.** Capped at **3 total across both types** (mixed holdings allowed).
  In-memory, lost on reload; no persistence, no identity, no store.
- **Two boost effects:** overpay (subset ≤ roll total, voids some pips) and 1-for-2 (ignore one
  whole die, play the other as a single value). Both: one per turn, no chaining, never close the
  final tile.
- **Auto-select spend (§3.6), no which-boost picker.** At a stall, compute which held types would
  resolve *this* stall; if both overpay and 1-for-2 would, offer the **1-for-2** (conserve
  overpay); if only one would, offer that; if none, no offer. Single spend-or-stay choice; the
  offer **names** the type being spent.
- **Reward model (§3.6):** each type owns a criteria pool; when a fired criterion is shared,
  pick the awarded type by a **configurable distribution variable (default 50/50)**. MVP: both
  types share the existing criteria (dry streak + trailing-at-finish), so every award is a 50/50
  roll. Apply the 3-total cap after selection.
- The "no re-earn on the turn a boost is spent" suppression.
- On-screen: per-player **typed inventory** visible (counts per type, not one number); a distinct
  announcement at each award **naming the type**; the spend offer names the type.
- All tunable constants (window size, streak count, award distribution) named in `config.js` with
  a "starting value, tune after playtest" comment.

**Out of scope.** Any purchase, currency, or store. Cross-session persistence. The **block-dice**
boost and any targeted / inter-player / duration-based boost (benched — §6, its own future
milestone with its own targeting/duration system). Changes to `A`/`D` rules, placement, or
motion. Reason: M6 adds the self-affecting boost inventory; targeted effects are a separate build.

**Do-not-touch on entry.** The `A` and `D` rules, placement logic, and the motion/tap paths must
be unchanged. The roster gains only the typed in-memory inventory.

**Acceptance criteria — checkable by playing with overpay `A` and the boost checkbox on:**
1. With overpay `A` and boost checkbox on, the game starts strict; a player with zero boosts who
   cannot make an exact move stalls exactly as in plain `A`.
2. When I stall three-plus times across my last five rolls, I am awarded a boost; the award is
   announced on screen and **names which type** (overpay or 1-for-2) I received.
3. When another player shuts, the remaining player with the most open tiles is awarded a boost
   right then (ties: all get one), announced with its type.
4. Over many awards, I receive a mix of both types roughly in line with the configured
   distribution (default ~50/50) — not always the same type.
5. My inventory shows **how many of each type** I hold, not a single undifferentiated count.
6. I never hold more than **3 boosts total** across both types, however many I earn.
7. **1-for-2 works:** with a rack like {3,7,8,9} and a roll of 3+3 that stalls under strict
   rules, spending a 1-for-2 lets me play a single 3 and close the {3}.
8. **Overpay works:** on a stall where a smaller subset than my roll total would close tiles,
   spending an overpay lets me flip that subset — except I still cannot close my final tile
   unless the roll pays it exactly.
9. **Auto-select conserves overpay:** on a stall where *both* an overpay and a 1-for-2 I hold
   would resolve it, the game offers to spend the **1-for-2**, and my overpay count is unchanged
   after.
10. **Only-overpay case:** on a stall only overpay can resolve, the game offers overpay.
11. **No-op case:** on a stall neither held boost can resolve, no spend is offered and I stall.
12. I get a single spend-or-stay choice (never a two-boost picker or dropdown); declining leaves
    me stalled with my inventory intact.
13. I can never spend two boosts on the same turn.
14. On a turn where I spend a boost, I am not also awarded one.
15. My inventory resets to empty for everyone after an app reload.
16. The leader is able to earn boosts when the front-runner starts stalling.
17. Switching the overpay toggle to `D` greys out the boost checkbox and no boost prompts appear
    (both MVP types are redundant under `D`).

**Stop conditions.** If awards flood a game so stalling never meaningfully happens, **stop and
report the observed award rate** rather than silently tightening constants. If the auto-select
rule ever offers a boost that does **not** resolve the current stall, **stop and report** — the
usable-here filter is wrong and must be fixed, not worked around.

</details>

---

### M7 — Two-type boost system (overpay + 1-for-2)

**Status: NOT STARTED.** Split out of M6 so M6 could close (D-41). **Design not yet finished
by the orchestrator** — per `docs/DECISIONS.md` (2026-09-11), do not start building this
without an explicit go-ahead; the two-type design (D-35–D-38) is written into §3.6 but has
not been prepped for a build session the way M6's original single-type scope was.

**Goal.** Extend M6's shipped single-type boost mode into the full two-type inventory per
§3.6/D-35–D-38: a second boost type (1-for-2 — ignores one whole die, plays the other as a
single value), a typed `{ overpay: n, oneForTwo: m }` inventory, auto-selected spend that
conserves the stronger overpay type, and a per-type reward-model split (MVP: 50/50, shared
criteria).

**Do-not-touch on entry.** Everything M6 shipped (the overpay boost's own logic, its award
timing, the whole-rack-close generalization) stays as-is; this milestone only adds the second
type and the machinery to arbitrate between two held types. The `A`/`D` rules, placement
logic, and motion/tap paths are untouched, same as M6's own constraint.

**Scope** (moved from M6's original text above, unchanged in substance):
- Typed inventory, `{ overpay: n, oneForTwo: m }` or equivalent, cap raised to **3 total
  across both types** (not 3 of each) — `boostMaxHeld`'s cap check in code is currently
  single-type and will need reworking to sum across types.
- The 1-for-2 effect itself: ignore one whole die, play the other as a single value.
- Auto-select spend: compute which held types would resolve the current stall; both resolve
  → offer 1-for-2 (conserve overpay); only one resolves → offer that one; none resolve → no
  offer. Never a which-boost picker. The offer names the type being spent.
- Reward model: each type owns a criteria pool (may overlap); a criterion shared by both
  types picks the awarded type via a configurable distribution variable (default 50/50); MVP
  both types share the existing D-24 criteria.
- On-screen: per-player inventory shows counts **per type**, not one undifferentiated number;
  the award announcement **names the type** granted.

**Acceptance criteria** (moved from M6's original numbering — criteria 4, 7, 9, plus the
type-aware framing of 2, 5, and 17):
- Over many awards, the mix of both types roughly matches the configured distribution
  (default ~50/50) — not always the same type.
- **1-for-2 works:** with a rack like {3,7,8,9} and a roll of 3+3 that stalls under strict
  rules, spending a 1-for-2 lets the player play a single 3 and close the {3}.
- **Auto-select conserves overpay:** on a stall where both a held overpay and a held 1-for-2
  would resolve it, the game offers to spend the 1-for-2, and the overpay count is unchanged
  after.
- Award announcements and the spend offer both name which type is involved.
- Inventory display shows a count per type.
- Switching the overpay toggle to `D` greys out the boost checkbox and suppresses prompts for
  both types (both are redundant under `D`, same as M6's single type already is).

**Stop conditions** (carried from M6): if awards flood a game so stalling never meaningfully
happens, stop and report the observed award rate rather than silently tightening constants.
If auto-select ever offers a boost that does not resolve the current stall, stop and report.

---

## 6. Explicitly out of scope for this prototype

- **Single-player mode.** Playable in principle but the design has not been worked out.
- **The boost system is a post-MVP milestone (M6), not part of the A/D MVP.** Fully specified
  (§3.6): two self-affecting stall-rescue boosts (overpay + 1-for-2), a typed inventory capped at
  3 total, and a per-type criteria-pool reward model. In M2 the boost checkbox exists but is inert.
- **Any purchase, currency, or store for boosts.** Earned-only, in-memory; monetisation is intent,
  not scope.
- **The block-dice boost, and any targeted / inter-player / duration-based boost — BENCHED.**
  Considered and parked as too big a stretch for now: unlike the two MVP boosts (holder-spent,
  self-affecting, resolved at one's own stall), block is spent *on another player*, affects their
  *next* turn, and needs a target picker, a duration, and active-effect-on-target state — a whole
  subsystem the current architecture has nowhere to put. If it ever returns it is **its own future
  milestone**, and these open questions must be answered first: the two clocks ("one block per
  turn" vs "affects next turn"); whether a block on an already-single-die player is wasted or
  disallowed; whether/how the target is told they were blocked and by whom. Recorded so it is not
  lost; not built.
- **Further boost types beyond the two MVP ones.** The system is typed and the reward model is
  per-type-pool, so more types are additive — but the MVP ships exactly overpay + 1-for-2.
- **Cross-session persistence of boosts or player identity.** Boosts live only within a single
  app session and are lost on reload.
- **Sound and haptics.**
- **Character/mascot art on tiles.** Tiles show plain numerals (D-13). "Flip" is a name only in
  this prototype; the character design is a separate design-session track.
- **Avatars for the player screen — FUTURE, doors kept open (see §9 open design questions).**
  Not built now. The intent recorded so nothing forecloses it: start players with **random**
  avatars (no pre-game character-creation gate — that was the known cost), and possibly hand
  out avatar customisation to the winner(s) as a post-game reward. The only forward-compat cost
  paid now is that the roster models an avatar as an **assignable attribute from day one** (it
  can be just a colour today); adding real avatars later must not be a schema change.
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
- **Avatars, and the Flip-vs-Spudling character question.** There is a potential collision: Flip
  is the game's intended carrying character, while the Spudling project could supply player
  avatars. Two mascot systems in one product competes for the same identity role. The likely
  resolution to explore is a **hierarchy** — Flip as the game's host/character, Spudlings (or
  other avatars) as the *players'* avatars, a clean host-vs-guests split — but this is a design
  decision, not decided here. Spudling's known standalone weakness (content-production cost) may
  be acceptable at this finite scope; that too is for the design track to weigh.

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
| D-13 | Tiles show plain numerals; Flip does not appear on tiles in this prototype | Locked |
| D-14 | Theme config hook exists from M1; no customisation UI | Locked |
| D-15 | Public GitHub repo `flip`, served by GitHub Pages | Locked |
| D-16 | Neutral landing page at `/`, app at a sub-path; presentational, not a security measure | Locked |
| D-17 | No real family or child names committed to a public repo | Locked |
| D-18 | Overpay is an A/D toggle (A strict default; D overpay ≤ total, last tile exact); MVP ships A and D | Locked |
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
| D-32 | Avatars are future; roster models an avatar as an assignable attribute from day one; random-avatar start, customisation as a post-game reward; Flip-vs-avatar hierarchy is an open design question | Locked (intent) |
| D-33 | Lap boundary is anchored to the earliest active seat (P1 or earliest unfinished), not the requesting player's seat | Locked |
| D-34 | Theme flip is the overpay signal: sustained inversion while mode D is active, momentary inversion during a boost-spend overpay move; predicate is "D active OR boost overpay move in progress", never per-roll resolvability; turn card / launch / boost banner stay theme-independent | Locked |
| D-35 | Two MVP boost types — overpay (voids some pips, subset ≤ total) and 1-for-2 (voids one whole die); typed inventory capped at 3 total across types; both self-affecting stall-rescues | Locked |
| D-36 | Spend is offered (spend-or-stay) with the type **auto-selected**, never a player which-boost picker; offer names the type; only boosts that resolve *this* stall are offered | Locked |
| D-37 | Auto-select prefers 1-for-2 when both resolve (conserve overpay); overpay strictly dominates 1-for-2, so branches are: both→1-for-2, only-overpay→overpay, neither→no offer; the "could-score-higher" case is locked as by-design | Locked |
| D-38 | Reward model: each type owns a criteria pool (may overlap); shared-criterion awards pick a type by a configurable distribution variable (default 50/50); MVP both types share the D-24 criteria | Locked |
| D-39 | Block-dice and any targeted / inter-player / duration boost is benched; if revived it is its own milestone with targeting/duration state and the parked open questions answered first | Locked |
| D-40 | M4 (continuous-rotation handoff) is cut, not merely deferred: M3's tap/motion turn-card handoff feel is confirmed good in real multi-kid play, so there is no open problem left for M4 to solve; not built, not scheduled | Locked |
| D-41 | M6 is closed at single-type (overpay-only) scope; the two-type boost expansion (D-35–D-38) is split into a new milestone M7, not started, design still pending from the orchestrator | Locked |
