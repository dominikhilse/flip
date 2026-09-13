# Avatars (M13, D-55)

Drop the 20 pre-made Spudling avatar PNGs here. This folder is served
static, straight off GitHub Pages — no build step, no manifest to
regenerate.

**Naming convention:** `01.png` through `20.png` (zero-padded, two
digits). M13's code will reference avatars by this filename directly
(`avatars/01.png`, etc.) as the player's stored avatar reference, per
D-55's "each player holds an avatar id/filename, so replacing the art
later is a file swap, not a code change."

**Expected per file:**
- Square canvas, transparent background (PNG alpha).
- Provisional/placeholder art is fine — D-55 explicitly treats this set
  as swappable; nothing about the code will depend on the art itself.

If you'd rather use different filenames or a different count, flag it
before M13's code lands (`RULES`/`app.js` will read from whatever
convention exists here at that point) — 20 is D-55's locked number
(covers the 12-player max with room to spare, unique-without-replacement
per game).
