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
§3.6), and `D` (overpay). There is deliberately no "`D` + overpay-boost" state in the MVP,
because that boost would do nothing under `D`. Future boost *types* whose effect is not
redundant under `D` are not precluded (§3.6).

**Note for M6 acceptance wording:** "select mode B" means "set the overpay toggle to `A` and
check the boost checkbox." There is no `B` button; the boost mode is an emergent state of two
controls.

### 3.6 Boost mode (strict base + earned overpay boosts) — SPECIFIED
The boost mode is strict base play (exact-sum, as `A`) plus earned, spendable **boosts** that
let a struggling player avoid a stall. It is the middle ground between A's friction and D's
looseness, and the comeback mechanic that keeps trailing kids in the game. Built in M6.
Reached via the overpay toggle = `A` with the boost checkbox on (§3.5).

**Boosts are a typed system — this is a structural requirement, not a detail.**
- A boost has a **type**. The MVP ships exactly one type: the **overpay boost**.
- A player holds boosts **of a type** — model the holding as typed from day one (e.g.
  `{ overpay: n }` or a list of typed boosts), **never a single bare integer count.** Adding a
  second boost type later must be additive, not a schema change and refactor.
- The **overpay boost** is only meaningful under strict base play, because `D` already grants
  overpay for free. That is why its checkbox is A-only (§3.5). This scoping is a property of
  the overpay boost's *effect*, and does **not** generalise to future boost types: a later
  boost whose effect is not redundant under `D` may be offered under `D`. **Do not write any
  rule that says "D has no boosts."** Write only that the *overpay boost* is not offered under
  `D` because its effect already applies.

**The overpay boost — definition and spending:**
- One overpay boost grants exactly **one overpay move** — one move whose selected open tiles
  sum to **any value ≤ the roll total** (same relaxation as `D`), spent to resolve a turn that
  would otherwise stall.
- **One boost per turn. No chaining.** At most one boost spent on a single turn.
- **Offered, never auto-spent.** When a player would otherwise stall and holds ≥1 overpay
  boost, the game **asks** whether to spend one. Declining leaves them stalled, boost retained.
  The offer prompt doubles as the on-screen announcement required below.
- **Never closes the final remaining tile.** The last-tile-exact rule holds absolutely.
- A player may **hold up to 3 boosts** (of the overpay type in the MVP). Awards beyond 3 are
  discarded (no overflow store).

**Boost lifetime:**
- Held **in the in-memory roster**, stacking across replays **within one app session only.** A
  fresh app launch starts everyone at zero. **No cross-session persistence, no stored player
  identity, no returning-player balance.**

**Award conditions — a player is awarded one overpay boost when either fires:**
1. **Dry streak.** The player has **not had three clean (legally resolvable) rolls within their
   last 5 rolls** — i.e. they are stalling often. Evaluated per player on each of their rolls,
   over their own rolling window of 5. (A "clean roll" is one where a legal exact move existed,
   whether or not a boost was involved.)
2. **Trailing at a finish.** The moment any player shuts their rack, the player with the **most
   tiles still open** is awarded a boost. Ties: all tied players get one. Reads remaining-tile
   counts internally, permitted by §3.4.

**No eligibility floor.** The leader is **not** excluded from earning boosts. Rationale, so it
is not "fixed" later by mistake: if the front-runner becomes eligible it means even they are
stalling, so the game is dragging — a boost there speeds it toward an end, which is desirable.
Do not add a "leader cannot earn boosts" rule.

**No re-earn on spend.** A player is **not** awarded a boost on the same turn they spend one.
Prevents a spend→still-struggling→immediate-re-earn loop that would drift toward `D`.

**Visibility (mandatory):**
- Each player's current boost count is visible on their own screen.
- **Every boost award is announced on screen** at the moment it is granted (icon lighting up,
  distinct feedback). A rule-affecting change the player cannot see is a defect.

**Still tunable after playtest (not blocking M6, change in place when observed):** the exact
dry-streak ratio (3-in-5 vs alternatives) and whether condition 2 should also fire mid-game
rather than only at a finish. Feel calls to settle against a real session; the values above
are the labelled starting point in `config.js`.

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
some changes take effect **without restarting the match.** Not every setting is safe to change
mid-game, so each is tagged.

**Every setting is one of two kinds:**
- **live-at-end-of-lap** — the change is accepted immediately but **applied at the top of the
  next full lap**, i.e. after every remaining player has completed the turn they are currently
  on. This is a **fairness rule, not a nicety:** if overpay flipped from A to D while player 3
  of 4 was mid-turn, players 1–2 would have played that lap under A and 3–4 under D. Deferring
  to the lap boundary keeps everyone on one ruleset per lap.
- **blocked-until-next-game** — the control is **visibly disabled** during a match (greyed,
  with a short "applies next game" note — disabled and labelled, **not hidden**, so a parent
  looking for it doesn't think it's missing). The new value takes effect only when a new game
  starts.

**Tags:**
| Setting | Mid-game | Reason |
|---|---|---|
| Placement mode (winner-only / top-2 / all-places) | **live-at-end-of-lap** | Pure end-condition change; no rack impact |
| Overpay toggle (A / D) | **live-at-end-of-lap** | Changes legality of future moves only; flipped tiles untouched |
| Boost checkbox (on/off, A only) | **live-at-end-of-lap** | Turns the boost mode on/off for subsequent laps |
| Motion toggle | **live-at-end-of-lap** | Input-path change; no game state (respect the §3.9 invariant) |
| Tap-to-proceed toggle | **live-at-end-of-lap** | Input-path change (respect the §3.9 invariant) |
| Rack size (9 / 12) | **blocked-until-next-game** | Racks are already built and half-flipped; no coherent in-place change |
| Add / remove player | **blocked-until-next-game** | Same class as rack size — corrupts the match in progress |

Rack-size and roster changes are **not needed mid-game** and are explicitly blocked; do not
try to make them work in place. Placement, overpay (incl. boost checkbox), and the two input
toggles are the desired mid-game changes and are all live-at-end-of-lap.

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

### M4 — Continuous-rotation handoff (spike, cuttable)

**Goal.** Find out whether the phone can be picked up, turned 180°, and set down again with
the game staying in play — no turn card at all.

**Status: UNVERIFIED. This milestone may be cut in full without affecting anything built in
M0–M3.** Do not refactor M3's handoff to accommodate it. If it fails, delete it.

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

---

### M5 — (reserved / no-op)

The motion on/off toggle originally imagined as its own milestone is **not a separate
milestone.** The setting is built in M2 (stored) and given its runtime effect in M3 (read).
Nothing remains for an M5. This heading exists only so the numbering is not misread as a gap.
Do not create work here.

---

### M6 — Boost mode (strict + earned overpay boosts)

**Goal.** The boost checkbox (available while overpay = `A`) becomes functional: strict base
rules with earned, spendable overpay boosts, per §3.6. There is no `B` button — the mode is
reached by toggle `A` + boost checkbox on (§3.5).

**Sequencing note.** M6 is intended to come *after* real multi-kid sessions on `A` and `D`, so
the dry-streak ratio and finish-trailing behaviour can be tuned against observed stall
frequency. Build the §3.6 values as the labelled starting point; expect to adjust. Sequencing
preference, not a hard block — the mode is fully specified.

**Scope.**
- Make the boost checkbox (built inert in M2) functional while overpay = `A`.
- **Typed** per-player in-memory boost holding (§3.6) — e.g. `{ overpay: 0..3 }`, **never a
  bare integer** — so future boost types are additive. MVP has the one type. Lost on reload;
  no persistence, no identity, no store.
- Award logic: both conditions in §3.6 — dry streak (per-player rolling window of 5 rolls) and
  trailing-at-finish (most open tiles when any player shuts; ties all awarded).
- The "no re-earn on the turn a boost is spent" suppression.
- Spend flow: when a player holding ≥1 overpay boost would otherwise stall, offer to spend one;
  on accept, allow one overpay move (subset ≤ roll total, last-tile-exact still enforced); one
  boost per turn, no chaining; on decline, normal stall, boost retained.
- On-screen: per-player boost count always visible on that player's screen; a distinct,
  legible announcement at the moment a boost is awarded.
- All tunable constants (window size, streak count) named in `config.js` with a "starting
  value, tune after playtest" comment.

**Out of scope.** Any purchase, currency, or store. Cross-session persistence. Other boost
types. Changes to `A`/`D` rules, placement, motion, or the roster model beyond the typed boost
holding. Reason: M6 adds a mode; it must not disturb the shipped MVP.

**Do-not-touch on entry.** The `A` and `D` rules, placement logic, the motion/tap paths, and
the roster model (beyond adding the typed in-memory boost holding) must be unchanged.

**Acceptance criteria — checkable by playing with overpay `A` and the boost checkbox on:**
1. With overpay `A` and boost checkbox on, the game starts with strict (exact-sum) base rules;
   a player with zero boosts who cannot make an exact move stalls exactly as in plain `A`.
2. When I stall three-plus times across my last five rolls, I am awarded a boost and the award
   is announced on screen.
3. When another player shuts their box, whichever remaining player has the most open tiles
   receives a boost right then, announced on screen; if two are tied for most, both receive one.
4. Holding a boost, on a turn I would otherwise stall, the game offers to spend it. Accepting
   lets me flip tiles summing to less than my roll — except I still cannot close my final tile
   unless the roll pays it exactly. Declining leaves me stalled with the boost still in hand.
5. I can never spend two boosts on the same turn.
6. I never rise above 3 boosts however many I earn.
7. On a turn where I spend a boost, I am not also awarded one.
8. My boost count shows on my screen and resets to zero for everyone after an app reload.
9. The leader is able to earn boosts — playing a game where the front-runner starts stalling,
   they do receive boosts under the same conditions.
10. Switching the overpay toggle to `D` greys out the boost checkbox and no boost prompts
    appear (the overpay boost is redundant under `D`).

**Stop conditions.** If awarding under both conditions floods a game with boosts to the point
that stalling never meaningfully happens, **stop and report the observed award rate** rather
than silently tightening constants — the tuning is the human's call against real play.

---

## 6. Explicitly out of scope for this prototype

- **Single-player mode.** Playable in principle but the design has not been worked out.
- **The boost mode is a post-MVP milestone (M6), not part of the A/D MVP.** Fully specified
  (§3.6), but built after the MVP ships and is played. In M2 the boost checkbox exists but is
  inert.
- **Any purchase, currency, or store for boosts.** Boosts are earned-only and in-memory for
  now; their eventual monetisation is intent, not scope.
- **Other boost types.** The boost system is typed to allow them later (including types usable
  under `D`), but the MVP ships only the overpay boost.
- **Cross-session persistence of boosts or player identity.** Boosts live only within a
  single app session and are lost on reload.
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
| D-20 | Boosts are in-memory, session-only, max 3 per player, never close the last tile; monetisation is intent not scope | Locked |
| D-21 | Motion mechanic on/off toggle, default ON; OFF uses the existing tap-only path, not a new one | Locked |
| D-22 | "Dynamic overpay" (mode C) cut — trigger not measurable, silent rule change illegible | Locked |
| D-23 | Boost mode B fully specified: 1 boost = 1 overpay, ≤3 held, one/turn no chain, offered not auto, no last-tile, session-only | Locked |
| D-24 | Boost award conditions: dry streak (not 3 clean rolls in last 5) and trailing-at-finish (most open tiles when any player shuts) | Locked |
| D-25 | Leader is not excluded from earning boosts; no re-earn on the turn a boost is spent | Locked |
| D-26 | No orientation lock; portrait tested fine (M4); final orientation is a design-session call, subordinate to the verified shove/lift handoff feel | Locked |
| D-27 | Overpay UI is an A/D toggle plus a boost checkbox (checkbox live only when toggle = A); three reachable states A / A+boost / D; no D+overpay-boost | Locked |
| D-28 | Boost system is **typed**; MVP has one type (overpay boost), which is A-only because redundant under D; future boost types may apply under D — never write "D has no boosts" | Locked |
| D-29 | Tap-to-proceed toggle: default ON in development, OFF in final build; motion and tap can never both be effectively off; `effective_tap = user_pref OR (motion not working)` | Locked |
| D-30 | Settings reachable mid-game; each setting tagged live-at-end-of-lap or blocked-until-next-game; placement/overpay/boost-checkbox/motion/tap are live-at-lap; rack size and roster are blocked | Locked |
| D-31 | Rest-to-flip delay is an M0-measured constant with a debug slider; too long in M4; must beat a fast tap while staying bump-safe; crossed bounds = stop condition | Locked |
| D-32 | Avatars are future; roster models an avatar as an assignable attribute from day one; random-avatar start, customisation as a post-game reward; Flip-vs-avatar hierarchy is an open design question | Locked (intent) |
