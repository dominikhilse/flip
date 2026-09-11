# CLAUDE.md — Flip the Number

Read this file, `docs/DECISIONS.md`, and the current milestone section of
`docs/FlipTheNumber_MilestonePlan.md` before writing any code. The milestone plan is the
canonical spec and owns the locked decision log (§8, D-01…D-39) — this file does not repeat
it, only points at it and records the working conventions around it.

A pass-the-phone party game for 2+ players on one device, based on the traditional pub game
Shut the Box. Full product framing, rules, and milestone breakdown are in
`docs/FlipTheNumber_MilestonePlan.md` — read it, not just this file.

## Constraints (locked — do not relitigate)

- Plain static HTML/CSS/JS. No build step, no framework, no npm install, no bundler, no
  TypeScript, no third-party libraries of any kind.
- No server, no backend, no network calls at runtime. No service worker.
- `localStorage` for the roster and settings only, every access wrapped in `try/catch`. Never
  persist an in-progress game.
- Public GitHub repo (`dominikhilse/flip`), served by GitHub Pages, for the HTTPS secure
  context motion requires. **Never commit real family or child names** anywhere — not as
  default players, not in fixtures, not in comments or docs. Placeholder names only.
- No character/mascot art. Tiles are plain numerals; "Flip" is a name only in this prototype.

## Decision records — two files, different jobs

- **`docs/FlipTheNumber_MilestonePlan.md` §8** — the canonical, locked decision log
  (D-01…D-39). Only changes when the plan itself is deliberately revised (by the
  orchestrator/design track).
- **`docs/DECISIONS.md`** — an append-only, dated log for findings and decisions made
  *during* a Code session that the plan's D-## log hasn't caught up to yet: a bug fix that
  reinterprets a locked rule, a live-playtest call that contradicts written spec, a rule
  clarification, an explicit "don't build X yet" instruction. Its own header explains the
  convention in full. **This exists specifically to stop the Code session and the
  orchestrator/design session drifting out of sync** when they work in parallel — which
  already happened once this project (the M6 boost/theme playtest fixes landed several turns
  before the plan's next revision pass could fold them in).

**Every commit that decides something gets a `docs/DECISIONS.md` entry, written as part of
preparing that commit — not after, not "later if I remember."** Concretely, before staging:
ask whether this change (a) reinterprets or generalizes a locked rule, (b) contradicts
something written in the plan, (c) makes a judgment call the plan doesn't resolve, or (d) is
an explicit instruction to defer or not build something the plan currently specifies. If yes
to any of those, write the dated entry first, then stage `docs/DECISIONS.md` in the same
commit as the code it explains (or as its own commit if the finding has no code change, per
the two-commit precedent in this project's history — code change and doc-only findings are
easier to review separately). A plain bug fix or a UI tweak that doesn't touch a rule or a
plan claim doesn't need an entry — this is for things worth telling the orchestrator, not a
changelog of every commit.

## Verification convention

There is no test framework and no build step, so verification is live-browser-driven:
- Add a temporary `window.__debug` hook (exposing `getGame`/`getSettings`/the relevant
  action functions) to drive and inspect real game state through the Browser tools —
  never re-derive game logic by hand in a scratch script.
- Prefer forcing state through the actual functions (`onRoll`, `onConfirm`, etc.) over
  hand-writing `game.currentRoll = {...}` from scratch, so the real code paths run.
- Run at least one full automated game to completion (a small brute-force solver over
  `RULES.isValidSelection` is enough) and check the console for zero errors, in addition to
  the specific scenario under test.
- **Strip the debug hook before committing.** Never ship `window.__debug` in a commit.
- If the local dev server starts serving stale JS/HTML despite fresh files on disk (a
  recurring browser-HTTP-cache issue with plain `python3 -m http.server`), rotate the port in
  `.claude/launch.json` (gitignored) to a fresh, never-used-this-session value rather than
  trusting a reload — then revert it to `8123` before finishing.
- Never guess at unmeasured constants (motion thresholds, rest-to-flip delay) — see
  `FINDINGS.md` and plan §7. Re-measure via the M0 harness if a value is ever in doubt.

## Commit protocol

- Commit locally with a descriptive message (what changed, why, how it was verified).
  **Never push** — the user tests on their own phone against the real GitHub Pages origin and
  pushes themselves. Pushing is the one action in this project that is never this session's
  to take, regardless of how confident the local verification was.
- If the change needed a `docs/DECISIONS.md` entry (see above), that entry is written and
  staged as part of the same commit-preparation pass, before running `git commit`.
