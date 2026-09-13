# Flip the Number — Brand-Track Design Brief

**Document status:** canonical brand-track brief. Sits alongside `FlipTheNumber_MilestonePlan.md`.
**Audience:** a design session (Claude Design or equivalent) with no prior context, plus a later
Nano Banana session that finishes the art. Everything needed is in this file.
**Track:** this is the **brand track** — the first of two. A separate **UI/layout track** brief is
written *after* this one lands, because it inherits this track's outputs (final characters, locked
palette, tokens). Do not attempt screen layouts here.

**STATUS — RESOLVED (2026-09-12).** The brand track is complete. The design session delivered a
grounded dev handoff (`DevHandoff_BrandSpec_dc.html`) settling every open question: name kept,
Spudlings in as a fixed 20-PNG avatar set, palette, type, and tokens. The outcomes are folded into
the milestone plan as **M13** and **D-53/54/55**. This brief is retained as the record of how the
direction was reached; the milestone plan §8 is now the canonical source for the settled decisions.
Sections below are preserved (with §2.1 updated to show the resolution); read them as history plus
the reasoning behind M13, not as still-open questions.

**Not yet reconciled into the milestone plan.** The core direction below (Flip cut; Spudlings carry
the game) reverses earlier plan decisions (D-13's Flip framing, D-32's avatar/character intent). By
deliberate choice, the milestone plan §8 is **left unchanged** until this design session returns —
recording the reversal now would lock a half-made decision. The plan gets one clean reconciliation
pass *after* the session resolves its open questions (name, hero pick, palette). Treat this brief as
the current source of truth for brand direction; treat the plan as the source of truth for game
rules and milestones.

---

## 1. Goal

Produce the **brand direction, reference concept art, and design-token spec** for the game, such
that (a) a Nano Banana session can finish the art on-model, and (b) the later UI track inherits a
settled visual system. **This track does not produce final production art** — it produces
specification + reference-grade concept art; finishing happens externally in Nano Banana.

Three deliverables (detail in §6): concept art (reference-grade), written art direction, and a
design-token spec. Plus a hero app icon and a name recommendation.

---

## 2. The core direction

**Decided, unconditionally — true whether or not Spudlings end up starring (see §2.1):**
- **Flip is CUT.** The earlier mascot "Flip" (a bent-numeral character) is dropped. Do not design,
  reference, or revive him.
- **The name stays "Flip the Number."** Settled in the design session: the name does **not** depend
  on Flip existing as a character — it reads fine as a plain description of the game's core verb
  (flipping tile numbers), no wordplay required. **Do not revisit the name further** unless the
  Spudling question below lands somewhere that makes a different name obviously better — the session
  is not obligated to find one.
- **Tiles stay plain numerals**, regardless of what (if anything) carries character identity
  elsewhere. Numerals and any character system are separate visual layers.
- **If any character is used, there is no host** — nothing announces turns or reacts to events. A
  character, if present, is a *face* (icon/avatar/flavour), not a narrator.

### 2.1 RESOLVED — Spudlings are IN, as a fixed avatar set

**This fork is closed (see milestone plan M13, D-53/54/55).** The design session delivered a grounded
dev handoff and the direction is settled: **Spudlings are included** — but as a **fixed set of 20
pre-made avatar PNGs** (random-assigned at game start, cycle-through to change) plus splash/loading/
wordmark presence, **not** the full avatar-creator flow. This is the resolution that keeps the charm
and the per-player avatar identity while avoiding the risk named below — because there is **no
in-product character creation** for kids to get stuck in; you tap/cycle to one of twenty and play.

The tile system is untouched: plain numerals, no Spudling-as-numeral. Name kept: "Flip the Number."

Superseded reasoning, kept for the record — the fork *was*:
- **Include** (charm + asset reuse, but a stretch) vs **exclude** (faster, and avoids the risk that
  **avatar *creation* competes with the core game** — amplified in a room of kids, per D-32's
  original reasoning). The chosen path (fixed 20-PNG set, no creator) **takes the include benefits
  without the creation-time risk**, resolving the tension rather than trading one cost for the other.

---

## 3. Fixed constraints (guardrails — not the session's to change)

- **Original apparel and props only — no identifiable real-world brands.** The reference character
  wears identifiable branded footwear/apparel. The game's own hero and cast assets must use
  **original, non-branded** clothing/props. Reason: the product may go commercial, and trademarked
  brand marks on the mascots would foreclose that path. Cheap to honour when designing fresh;
  expensive to discover later. This is a hard constraint, not a preference.
- **No-build static site.** The game is plain HTML/CSS/JS with no build step, no framework, no
  bundler. Any design must be implementable that way: no component-library dependencies, no assets
  that need a build to process.
- **Type is inherited from the Spudling project (see §3.1).**
- **Skin within the existing theme system, don't replace it.** Light and dark themes already exist
  and are implemented, plus a signature **overpay theme-inversion** mechanic (the whole UI flips
  light↔dark to signal overpay rules are active). The palette and visuals must work in **both**
  themes and survive the inversion (§3.2). Do not redesign the theme mechanic.
- **Do not reopen locked game rules or the verified pass-the-phone handoff feel.** This is a visual
  brief; game mechanics (in `FlipTheNumber_MilestonePlan.md` §3) and the motion/tap handoff are
  fixed. Visual work dresses them; it does not change them.

### 3.1 Typography — inherited, values fixed
- `--font-display: "Bagel Fat One", system-ui, sans-serif;` — tile numerals, hero numbers, titles.
  (Heavy, rounded, inflated display face — a strong fit for big chunky tile digits and the soft
  Spudling world.)
- `--font-ui: "Figtree", system-ui, sans-serif;` — all UI and body text.
- Both are **Google Fonts** (the `system-ui` entries are fallbacks only). Load via a `<link>` in the
  HTML `<head>` — that is static-site-compatible and needs no build.
- **[FLAGGED DECISION — resolve before/at build, not a blocker for design]** A `<link>` to Google
  Fonts is a *runtime network dependency*, which conflicts with the plan's "runs offline once loaded"
  goal (`FlipTheNumber_MilestonePlan.md` §2). Two options: (a) accept the network font-load with a
  `system-ui` fallback (simplest, tiny risk on home wifi), or (b) self-host the two font files in the
  repo for true offline. Record the choice; do not silently assume either.

### 3.2 Palette — REFINE FRESH, within a working system
The player-colour palette is **open to be redesigned** (the current in-code colours accreted ad hoc
and are not a designed system). Design a fresh, coherent palette — but it must satisfy a real
multi-job system, because colour carries player identity, tile state, *and* brand feel at once:
- **Colour-blind-safe and maximally distinct for up to 8 players** — this is the hard target,
  optimise it fully. (8 is at the practical ceiling of robust colour-blind-safe qualitative
  palettes; do not exceed it on hue alone.)
- **Support up to 12 players gracefully** — colours 9–12 exist and are as distinct as feasible, but
  are **not** held to the same safe-distinctness bar. Beyond 8, the **avatar + name carry the
  distinguishing load** (both are on the player screen). State this plainly; never imply 12
  independently-safe hues exist.
- **Distinguish open vs closed tiles by more than hue.** Current build: closed = grey, open = player
  colour. "Greyed" vs "coloured" can be near-identical for some colour-vision types. Add a
  non-hue cue (brightness, pattern, icon, or label) so tile state survives colour-blindness.
- **Every colour must remain legible under BOTH themes, including the inversion.** A colour tuned for
  the light (brownish-white) background that turns muddy on the dark (brownish-black) background
  breaks the signature mechanic. This is a harder brief than a normal palette — colours must hold up
  inverted.

### 3.3 Inherit-vs-redo principle
Where the session must choose whether to inherit from Spudling or design fresh, the rule is:
**inherit what ties the products together; design fresh only where this game has needs Spudling
doesn't cover.** Concretely:
- **Inherit:** type (fixed above), character rendering/finish, general warmth and style, the
  light/dark *approach*.
- **Design fresh (needs Spudling lacks):** the player-colour **palette** (§3.2), the
  **overpay theme-inversion behaviour** (Spudling has light/dark but not this flip — it is this
  game's own and must be designed to survive), and the entire **board / tile / dice** surface
  (Spudling has no board; nothing to inherit).

---

## 4. Reference material — the canonical anchor

**[SETUP DEPENDENCY — the client is providing these; needed only if §2.1 resolves toward
"include."]**

- **Spudling reference characters** — the existing designed Spudlings. If included, these are the
  **locked visual anchor**: the hero and cast are drawn from this set, and the written direction
  (§6) points to them as "match this." One reference already seen: a burlap/sackcloth figure with
  stitched seams, sparkle button eyes, a simple stitched smile, dressed in streetwear. (Note the
  branded-apparel constraint, §3 — the game's own assets must swap identifiable brands for original
  apparel.)
- **The Spudling avatar creator — output range.** If included, the session must review its **actual
  variation range** as an early step (see §5.4, the 9–12 distinguishability question) — how much
  avatars can carry per-player distinction depends on how *different* the creator's outputs are.
  **This review is also part of the §2.1 weighing itself** — seeing the creator's actual UX (how
  many taps, how much time it invites per player) informs whether the "competes with the core game"
  risk is real or manageable.

Character consistency across *separate* Nano Banana generations is the known weak spot **if this
branch is taken**, so the written direction (§6) must lean hard on explicit "always / never" rules
plus these locked references, so the hero and cast stay on-model when generated in separate passes.

---

## 5. Open questions — the session decides these

The name is **settled** (§2: "Flip the Number," no further debate needed). Everything below is
genuinely open, and #1 gates #2–#4.

1. **Include or exclude Spudlings (§2.1) — the primary fork.** Weigh charm-and-reuse against
   faster-to-finished-product-and-avoids-competing-with-play, and **recommend a direction with
   reasoning.** This is the one question that reshapes everything else in this brief.
2. **If included: which Spudling is the hero.** Pick or designate the single hero from the Spudling
   set. Must read well **small** (app-icon legibility — one clear subject at ~60px, not a crowd) and
   carry the game's feel. Treat as a real deliverable, not an afterthought.
3. **The refined palette itself** (within §3.2's constraints) — needed either way, but if Spudlings
   are excluded, §3.2's "beyond 8 players, avatar + name carry the load" fallback **no longer has an
   avatar to lean on** — the session must propose a different non-colour distinguishing cue (e.g.
   player name alone, a simple shape/icon system) for 9–12 players in that branch.
4. **If included: do avatars alone carry 9–12 player distinction?** Review the avatar creator's real
   output range (§4) and confirm whether avatar + name give enough per-player distinction beyond 8
   players, or whether an additional non-colour cue is still needed. Report the finding.

---

## 6. Deliverables

- **A recommendation on §2.1** (include or exclude Spudlings), with reasoning — this is now the
  first deliverable; everything below depends on which way it lands.
- **If included:**
  - **Concept art (reference-grade, Nano-Banana-finishable).** Enough to see the direction — the
    hero Spudling and a sense of the cast — not final pixels. Anchored to the §4 references.
  - **Written art direction.** The "always / never" rules that keep Spudlings on-model across
    separate Nano Banana generations: what a Spudling always is, never is, proportions, texture,
    finish, the original-apparel rule, how the hero relates to the cast, how characters sit against
    both themes. Carries unusual weight because finishing is Nano-Banana-external.
  - **Hero app icon.** The hero Spudling as a single, high-contrast, small-size-legible subject.
- **If excluded:** a brief statement of what carries the app icon and identity instead (the board /
  tile / colour system itself is the expected answer — no character deliverable needed).
- **Design-token spec (needed either way).** The refined palette (with the 8-safe / 12-graceful
  properties documented, and — if Spudlings are excluded — the alternate 9–12 distinguishing cue
  from §5.3), the type tokens (§3.1), and the theme/colour rules. This is what the code and the UI
  track consume directly.

---

## 7. Out of scope for the brand track

- **All screen layout** — that is the UI track (written after this one). Do not lay out the title,
  player setup, rack, settings, turn card, or end screens here.
- **A host character / event-driven expressions** — cut with Flip; if any character is used, the
  game has no host (§2).
- **Bending Spudlings into numerals (if included)** — tiles stay plain digits (§2) regardless.
- **Sound.**
- **Redesigning the theme mechanic or any game rule** (§3).
- **Final production art** — this track is direction + reference; Nano Banana finishes (if included).
- **The avatar creator's internals** — if included, it is an existing asset to be used and reviewed,
  not rebuilt.
- **Re-litigating the name** — settled (§2).

---

## 8. Setup dependencies (resolve before this brief is final)

1. **Attach the Spudling reference characters and the avatar creator's output range** (§4) — needed
   to *make* the §2.1 recommendation, not just to execute an "include" outcome, since seeing the
   actual creator UX is part of what informs whether it competes with the core game.
2. **Confirm the Spudling type-loading method fits a no-build static site** (§3.1) and record the
   offline-vs-network font decision. Needed either way — type is inherited regardless of §2.1.

---

## 9. Reconciliation note (for the orchestrator, after the session)

The **name is already settled** ("Flip the Number," no character dependency) and needs no
reconciliation beyond confirming D-13's Flip framing is superseded (Flip cut, name stands on its
own). When the design session returns with the §2.1 recommendation (and, if included, the hero pick,
palette, and distinguishability finding), run **one** clean reconciliation pass on
`FlipTheNumber_MilestonePlan.md`: fold in whichever direction was chosen, revise or supersede the
affected D-rows (D-13 Flip framing, D-32 avatars), and add the palette/type tokens as decisions. Do
**not** do
this before the session runs — the direction is intent until the session resolves its open questions.
