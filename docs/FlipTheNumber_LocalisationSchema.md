# Flip the Number — Localisation Schema & Conventions

**Status:** the contract that M24 Stage A (code extraction) and the translation Sheet both build to.
Settle this before extraction starts — re-keying after the fact is the expensive mistake.

**Audience:** the code executor doing the extraction, and Dominik (who owns the Sheet and proofs).

**Scope:** EFIGS — five locales: **EN, FR, IT, DE, ES.** English is the source of truth; the other
four are translated from it. Languages are added manually when scaling (no auto-detection, no locale
inference — a plain setting picks the active language).

---

## 1. Keys

Every user-facing string becomes a **stable key**. The key never changes once assigned (translations
are matched to it), so choose it for the string's *role*, not its current English text.

**Naming:** `area.element` or `area.element.detail`, lowercase, dot-separated, descriptive.
- `play.roll`, `play.confirm`, `play.selected` , `play.total`
- `turncard.header`, `turncard.instruction`, `turncard.continue`
- `settings.tab.players`, `settings.tab.rules`, `settings.language`, `settings.start`
- `result.winner`, `result.finisher`, `timeout.title`
- `boost.spend`, `boost.change`, `boost.overpay.name`, `boost.onefortwo.name`
- `dialog.endmatch.title`, `dialog.endmatch.body`, `dialog.confirm`, `dialog.cancel`

**Rules:**
- One key = one complete, self-contained user-facing string (see §3 — never a sentence fragment).
- Keys are grouped by `area` so the Sheet sorts into legible blocks.
- A string that genuinely appears in two places with identical meaning may share one key; if the two
  could ever need to differ by language or tone, give them separate keys (cheap insurance).
- Never key a string by its English value (`"time_s_up"` is bad — `timeout.title` is good).

**Do NOT key:** the tile digits (1–9 / 1–12 are numerals, not language), player names (user input),
and the Score *numbers* themselves (digits). The *labels* around all of these are keyed.

---

## 2. Interpolation (slots)

Many strings carry runtime values. These are **templates with named slots**, resolved by `t()`.

**Slot syntax:** `{name}` — curly braces, a lowercase name, no spaces.
- `turncard.header` → `"PLAYER {n} OF {total} · YOUR TURN"`
- `play.selected` → `"Selected: {sum} / {target}"`
- `play.total` → `"Total: {total}"`
- `turncard.instruction` → `"{name}, lay the phone flat to start your turn"`
- `boost.spend` → `"Spend {boost}?"` (where `{boost}` is itself a localised boost name, see §3)

**Rules:**
- `t("turncard.header", { n: 1, total: 2 })` fills the slots. Missing a slot is a bug, not a silent
  blank — the extraction must record every slot a template uses.
- **Slot names are part of the key's contract.** A translator may move a slot's *position* in the
  sentence (word order differs by language) but must never rename, drop, or invent one. German/French
  WILL reorder slots — that's expected and fine; `"PLAYER {n} OF {total}"` may become a form where
  `{total}` precedes `{n}`. The slot names stay `{n}` and `{total}`.
- **Numbers that are grammatically inert** (a score, a count shown as a bare figure) can be
  concatenated by the UI as before IF they're not inside a sentence. "Total: {total}" is a template;
  a Score cell showing just "17" is a raw number, not a string needing a key.

---

## 3. The concatenation rule (the one not to let slip)

**Never assemble a sentence from fragments in code.** Each full sentence is ONE template key with slots.

- WRONG: `t("boost.spend_a") + " " + boostName + " " + t("boost.boost_q")`
- RIGHT: `t("boost.spend", { boost: t("boost.onefortwo.name") })` against `"Spend a {boost} boost?"`

Reason: word order is not universal. German, French, and Italian reorder the pieces; a concatenated
English word order produces broken grammar in those languages, and it's un-fixable in the Sheet because
the order lives in JS, not the string. **During extraction, any string currently built by `+` or
template-literal gluing of a user-facing fragment must be converted to a single slotted template.**
This is a required part of Stage A, not optional cleanup.

Pluralisation note: EFIGS plural rules are simple (singular vs. plural), but if any string varies by
count ("1 player" vs "2 players"), give it two keys (`.one` / `.other`) and have `t()` pick by the
count value. Flag these during extraction; don't hardcode an English "(s)".

---

## 4. The Sheet

- **One row per key.** Columns: `key` | `en` | `fr` | `it` | `de` | `es` | `slots` | `notes`.
  - `key` — the stable key (§1).
  - `en` — the source English string (authoritative; filled by extraction).
  - `fr/it/de/es` — translations (filled in Stage B; empty after extraction).
  - `slots` — the slot names this string uses (e.g. `n, total`), or blank. Lets the proofer and the
    export verify no slot was dropped or renamed.
  - `notes` — context for the translator ("shown on a button, keep short"; "playful tone"; "appears on
    the turn card"). This is where the long-language warning lives per-string.
- **Sorted by key** so `area` blocks group together.
- **The Sheet is the authoring surface, never a runtime dependency.** It exports to JSON (§5); the app
  never reads the Sheet.
- Dominik owns/hosts the Sheet. The executor's extraction output is delivered as a CSV (key, en, slots,
  notes) that imports into the Sheet in one step — no re-typing.

---

## 5. Export → JSON

- **One file per language** in the repo: `lang/en.json`, `lang/fr.json`, `lang/it.json`, `lang/de.json`,
  `lang/es.json`. Not one combined file — the app loads only the active language, and adding a language
  is dropping in a file.
- Shape: a flat `{ "key": "value" }` map. (Flat, not nested — the key already encodes the hierarchy via
  dots; a flat map is simplest for `t()` to look up and for the Sheet to export.)
- Export is a **manual step** Dominik runs when strings change (Sheet → JSON), matching the deliberate,
  non-automated deploy style used elsewhere in this project. No build step, no runtime fetch of the
  Sheet.
- The English file is produced by extraction (Stage A); the other four are produced after proofing
  (Stage B). A missing key in a non-English file falls back to English at runtime (see §6) — so a
  half-translated language degrades gracefully rather than showing blank.

---

## 6. Runtime (what the code does)

- **`t(key, params?)`** — returns the active language's string for `key`, with `{slots}` filled from
  `params`. If the key is missing in the active language, **fall back to the English value** (never show
  the raw key or a blank). If the key is missing everywhere, that's a bug — surface the key itself so
  it's caught in QA, don't hide it.
- **Active language** is a persisted setting (same `localStorage` as other settings). Default: EN.
- **On language change**, load `lang/<code>.json` (cache in memory) and **re-render** so every visible
  string updates. Any string set once and never re-touched must also route through `t()`, or it won't
  update on switch — extraction must catch these.
- **No locale auto-detection.** The setting is the only input.

---

## 7. What to watch (QA, Stage B)

- **DE and FR are the overflow languages** (IT close behind) — they run 30–40% longer than EN. Dominik
  leads the German layout QA natively; FR is the second worst case. EN/ES fit inside whatever holds DE.
  Layout fixes (wrap, shrink, truncate-with-care) happen in Stage B, flagged per screen.
- **Slot integrity** — every translated string must carry the same slot names as its English source
  (positions may move, names may not). The `slots` column is the checklist; the export should verify it.
- **Tone, not just correctness** — machine translation is grammatically fine but flat. The German proof
  is a *rewrite-for-voice* pass (playful, light, kid-facing), not just a correctness check. The `notes`
  column carries tone guidance per string.
