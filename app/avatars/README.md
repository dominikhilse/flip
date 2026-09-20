# Avatars (M13, D-55)

Currently holds **36** PNGs (`01.png`–`36.png`). `CONFIG.avatarCount` in
`app/config.js` is the single place the actual count is recorded, so adding
or removing one is a one-line change there plus the file itself, nothing
else.

This folder is served static, straight off GitHub Pages — no build
step, no manifest to regenerate.

**Naming convention:** `01.png` through `NN.png` (zero-padded, two
digits, `NN` = `CONFIG.avatarCount`), no gaps. The code references avatars
by this filename directly (`avatars/01.png`, etc.) as the player's stored
avatar reference, per D-55's "each player holds an avatar id/filename,
so replacing the art later is a file swap, not a code change" - replace
any file's contents at will, no code change needed as long as the
filename stays.

**Per file:** square canvas (1024×1024); transparent background not
required but nice to have for the circular crop.
