# Flip the Number — Brand-Track Design Brief

**Document status:** canonical brand-track brief. Sits alongside `FlipTheNumber_MilestonePlan.md`.
**Audience:** a design session (Claude Design or equivalent) with no prior context, plus a later
Nano Banana session that finishes the art. Everything needed is in this file.
**Track:** this is the **brand track** — the first of two. A separate **UI/layout track** brief is
written *after* this one lands, because it inherits this track's outputs (final characters, locked
palette, tokens). Do not attempt screen layouts here.

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

## 2. The core direction — DECIDED, validate don't reopen

These are settled. The session's job is to **execute** them and to **sanity-check** them once —
raise a concrete objection only if something genuinely breaks, otherwise proceed.

- **Flip is CUT.** The earlier mascot "Flip" (a bent-numeral character) is dropped. Do not design,
  reference, or revive him.
- **Spudlings carry the game.** The existing, already-designed Spudling characters (see §4
  reference) become the game's visual identity. This reuses proven production value — including an
  existing **Spudling avatar creator** — which is the reason for the direction.
- **One hero Spudling anchors recognition; the cast fills the world.** A single hero Spudling is the
  face on the **app icon** and the primary recognition point. The broader cast populates splash,
  loading, marketing, and the **player-screen avatars** (via the creator). *Which* Spudling is the
  hero is the session's to decide (§5).
- **No host character.** The game has **no** character that announces turns or reacts to events. The
  hero Spudling is a *face*, not a host — it appears as identity, it does not narrate gameplay. There
  is therefore **no event-driven expression set** to design.
- **Tiles stay plain numerals.** Spudlings are **not** bent, shaped, or stylised into numbers. The
  board tiles are legible plain digits (this is locked game-side as D-13). Keep characters and
  numerals as separate visual systems.
- **The Spudling aesthetic is canonical as drawn** (see §4): a warm burlap/sackcloth-textured figure,
  stitched seams, sparkle button eyes, simple stitched smile, dressed in apparel. Describe and match
  this on its own terms.

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

**[SETUP DEPENDENCY — the client is providing these; the brief is not final until they are attached.]**

- **Spudling reference characters** — the existing designed Spudlings. These are the **locked visual
  anchor**: the hero and cast are drawn from this set, and the written direction (§6) points to them
  as "match this." One reference already seen: a burlap/sackcloth figure with stitched seams, sparkle
  button eyes, a simple stitched smile, dressed in streetwear. (Note the branded-apparel constraint,
  §3 — the game's own assets must swap identifiable brands for original apparel.)
- **The Spudling avatar creator — output range.** The creator generates the cast/avatars. The session
  must review its **actual variation range** as an early step (see §5, the 9–12 distinguishability
  question) — because how much avatars can carry per-player distinction depends on how *different* the
  creator's outputs are (outfit/colour variation on one base vs. distinct characters).

Character consistency across *separate* Nano Banana generations is the known weak spot, so the written
direction (§6) must lean hard on explicit "always / never" rules plus these locked references, so the
hero and cast stay on-model when generated in separate passes.

---

## 5. Open questions — the session decides these

Stated with the client's leans on record. These are genuinely the design session's to resolve.

1. **The game's name.** Working title "Flip the Number" — but it was named around Flip, who is now
   cut, so the "Flip"-as-character wordplay is gone. Options: keep "Flip the Number" as a plain
   game-verb name (flipping tiles still justifies it — this is the safe fallback), adjust (e.g.
   "Number Flip"), or a new name the hero Spudling / cast suggests. Client is relaxed about it and
   wants the name settled *with* the hero pick, since they inform each other. **Recommend a name.**
   Note: a name *change* (vs. keeping "Flip the Number") has downstream cost — repo (`flip`), Pages
   URL, plan title, D-rows — so a change is a conscious trade, not free; flag it, don't block on it.
2. **Which Spudling is the hero.** Pick or designate the single hero from the Spudling set. Must read
   well **small** (app-icon legibility — one clear subject at ~60px, not a crowd) and carry the
   game's feel. This is the one character choice that survives cutting Flip; treat it as a real
   deliverable, not an afterthought.
3. **The refined palette itself** (within §3.2's constraints).
4. **Do avatars alone carry 9–12 player distinction?** Review the avatar creator's real output range
   (§4) and confirm whether avatar + name give enough per-player distinction beyond 8 players, or
   whether an additional non-colour cue is still needed. Report the finding.

---

## 6. Deliverables

- **Concept art (reference-grade, Nano-Banana-finishable).** Enough to see the direction — the hero
  Spudling and a sense of the cast — not final pixels. Anchored to the §4 references.
- **Written art direction.** The "always / never" rules that keep Spudlings on-model across separate
  Nano Banana generations: what a Spudling always is, never is, proportions, texture, finish, the
  original-apparel rule, how the hero relates to the cast, how characters sit against both themes.
  This document carries unusual weight because finishing is Nano-Banana-external and cross-generation
  consistency is the known risk.
- **Design-token spec.** Implementable values: the refined palette (with the 8-safe / 12-graceful and
  both-themes-including-inversion properties documented), the type tokens (§3.1), and the theme/colour
  rules. This is what the code and the UI track consume directly.
- **Hero app icon.** The hero Spudling as a single, high-contrast, small-size-legible subject. This is
  the one asset the neutral landing page doesn't cover.
- **Name recommendation** (per §5.1).

---

## 7. Out of scope for the brand track

- **All screen layout** — that is the UI track (written after this one). Do not lay out the title,
  player setup, rack, settings, turn card, or end screens here.
- **A host character / event-driven expressions** — cut with Flip; the game has no host (§2).
- **Bending Spudlings into numerals** — tiles stay plain digits (§2).
- **Sound.**
- **Redesigning the theme mechanic or any game rule** (§3).
- **Final production art** — this track is direction + reference; Nano Banana finishes.
- **The avatar creator's internals** — it is an existing asset to be used and reviewed, not rebuilt.

---

## 8. Setup dependencies (resolve before this brief is final)

1. **Attach the Spudling reference characters** (§4) — the locked anchor.
2. **Provide the avatar creator's output range** (§4) — for the 9–12 distinguishability review (§5.4).
   May be shown at session time rather than embedded here, but the session must review it early.
3. **Confirm the Spudling type-loading method fits a no-build static site** (§3.1) and record the
   offline-vs-network font decision.

---

## 9. Reconciliation note (for the orchestrator, after the session)

When the design session returns with name, hero pick, palette, and the distinguishability finding,
run **one** clean reconciliation pass on `FlipTheNumber_MilestonePlan.md`: fold in the Flip-cut /
Spudling direction, revise or supersede the affected D-rows (D-13 Flip framing, D-32 avatars), record
the chosen name (and any repo/URL cost), and add the palette/type tokens as decisions. Do **not** do
this before the session runs — the direction is intent until the session resolves its open questions.
