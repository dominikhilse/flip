// Colour config. This is the only place tile and player colours are defined.
// Swap these values to re-skin the game; nothing else reads a colour literal.
// Tile rack sizes up to 12 are supported here even though the current rack
// size setting only offers 9 or 12.
//
// M13/D-53-55 brand drop: tileColors moved from a flat hex string per value
// to { fill, edge, ink } - edge is the dark partner used as the tile border
// and (on light fills) the numeral colour, a second non-hue identity channel
// that survives the theme flip; ink is the numeral colour on the fill itself.
// closedTileColor/closedTileTextColor folded into closedTile the same way.
// M14 brand pass: tile colour moved behind a "skin" layer (a skin is a tile
// palette only, independent of light/dark and of player identity - see
// DECISIONS.md). Two skins ship this pass: colorful (this file's original,
// unchanged CVD-safe 12) and mono (derived at render from the active
// player's own colour - see monoRampTiles in app.js - so it carries no
// static table here). settings.skin (storage.js) picks between them; there
// is no activeSkin field in this file, matching how settings.theme (not a
// field here) already drives the light/dark split.
window.THEME = {
  skins: {
    colorful: {
      tiles: {
        1: { fill: '#D34D4D', edge: '#99302F', ink: '#FBF5E9' },  // Chili
        2: { fill: '#E5842A', edge: '#A45610', ink: '#3A2408' },  // Marigold
        3: { fill: '#E4BE2F', edge: '#9C7F16', ink: '#3A2E06' },  // Honey
        4: { fill: '#7E9E38', edge: '#4C641F', ink: '#FBF5E9' },  // Moss
        5: { fill: '#26A69A', edge: '#146B62', ink: '#FBF5E9' },  // Teal
        6: { fill: '#3D7BC0', edge: '#21507E', ink: '#FBF5E9' },  // Denim
        7: { fill: '#6A5AC8', edge: '#3E3583', ink: '#FBF5E9' },  // Indigo
        8: { fill: '#B45699', edge: '#77335F', ink: '#FBF5E9' },  // Plum
        // 9-12: graceful, NOT CVD-safe. Avatar + name disambiguate.
        9: { fill: '#A65E38', edge: '#6E3A1F', ink: '#FBF5E9' },  // Rust
        10: { fill: '#6CB7E2', edge: '#2E6E96', ink: '#0E2A3A' },  // Sky
        11: { fill: '#E08AA1', edge: '#A24C63', ink: '#3A1420' },  // Rose
        12: { fill: '#8CA07D', edge: '#56674A', ink: '#1E2617' }   // Sage
      }
    },
    mono: { derive: 'player-tonal' } // see monoRampTiles() in app.js
  },
  // Closed tile ignores hue: desaturate + darken (fill), pressed inset in
  // CSS (.tile.closed), dim hollow numeral (ink). One non-hue cue is enough
  // on its own to read "closed" without colour. Shared by every skin.
  closedTile: { fill: '#5C625F', edge: '#3F4442', ink: '#9AA19D' },

  // Palette players choose their colour from during setup, and that also
  // colours the turn card / player name / (M14) the whole active-turn
  // chrome. Drawn in safe-8-first order so the first 8 seated always land
  // on the CVD-safe set; 9-12 are graceful only. Deliberately theme- and
  // skin-independent constants (a player is "the teal one" regardless of
  // which skin or theme is active) - kept as flat fill hexes, not
  // {fill,edge,ink} triples, so existing persisted rosters (storage.js,
  // plain hex strings) keep loading unchanged; see playerEdge() in
  // app.js for the light-theme text partner, looked up from colorful.tiles
  // by matching fill rather than stored on the player.
  playerColors: [
    '#D34D4D', '#E5842A', '#E4BE2F', '#7E9E38', '#26A69A',
    '#3D7BC0', '#6A5AC8', '#B45699', '#A65E38', '#6CB7E2',
    '#E08AA1', '#8CA07D'
  ],
  playerNameTextColor: '#FBF5E9'
};
