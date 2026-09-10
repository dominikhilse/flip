// Colour config. This is the only place tile and player colours are defined.
// Swap these values to re-skin the game; nothing else reads a colour literal.
// Tile rack sizes up to 12 are supported here even though the current rack
// size setting only offers 9 or 12.
window.THEME = {
  tileColors: {
    1: '#e63946',
    2: '#f3722c',
    3: '#f9c74f',
    4: '#90be6d',
    5: '#43aa8b',
    6: '#4d908e',
    7: '#577590',
    8: '#277da1',
    9: '#5c4d9e',
    10: '#9d4edd',
    11: '#c9184a',
    12: '#ff6f59'
  },
  tileTextColor: '#ffffff',
  closedTileColor: '#2b2b2b',
  closedTileTextColor: '#666666',

  // Palette players choose their colour from during setup.
  // Player 4: more teal. Player 5: royal blue. Player 10: sky blue.
  playerColors: [
    '#e63946', '#f3722c', '#f9c74f', '#14b8a6',
    '#4169e1', '#9d4edd', '#c9184a', '#2b9348',
    '#e85d75', '#38bdf8'
  ],
  playerNameTextColor: '#ffffff'
};
