# Avatars (M13, D-55)

Currently holds **19** placeholder PNGs (`01.png`–`19.png`), one short of
D-55's locked count of 20 — flagged in `docs/DECISIONS.md`, not silently
fixed. Drop a 20th in as `20.png` whenever one's available; `CONFIG.
avatarCount` in `app/config.js` is the single place the actual count is
recorded, so adding it is a one-line change there plus the file itself,
nothing else.

This folder is served static, straight off GitHub Pages — no build
step, no manifest to regenerate.

**Naming convention:** `01.png` through `NN.png` (zero-padded, two
digits, `NN` = `CONFIG.avatarCount`). The code references avatars by
this filename directly (`avatars/01.png`, etc.) as the player's stored
avatar reference, per D-55's "each player holds an avatar id/filename,
so replacing the art later is a file swap, not a code change" - replace
any file's contents at will, no code change needed as long as the
filename stays.

**Per file:** square canvas (current placeholders are 1024×1024);
transparent background not required (the ones in here now don't have
one) but nice to have for the circular crop. Provisional/placeholder art
is fine - D-55 explicitly treats this set as swappable.
