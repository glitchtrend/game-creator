// --- Display ---

// Device pixel ratio (capped at 2 for mobile GPU performance)
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

// Orientation: landscape on desktop, portrait on mobile
const _isPortrait = window.innerHeight > window.innerWidth;

// Design dimensions (logical game units at 1x scale)
const _designW = _isPortrait ? 540 : 960;
const _designH = _isPortrait ? 960 : 540;
const _designAspect = _designW / _designH;

// Canvas dimensions = device pixel area, maintaining design aspect ratio.
// This ensures the canvas has enough resolution for the user's actual display
// so FIT mode never CSS-upscales (which causes blurriness on retina).
const _deviceW = window.innerWidth * DPR;
const _deviceH = window.innerHeight * DPR;

let _canvasW, _canvasH;
if (_deviceW / _deviceH > _designAspect) {
  _canvasW = _deviceW;
  _canvasH = Math.round(_deviceW / _designAspect);
} else {
  _canvasW = Math.round(_deviceH * _designAspect);
  _canvasH = _deviceH;
}

// PX = canvas pixels per design pixel. Scales all absolute values (sizes, speeds, etc.)
// from design space to canvas space. Gameplay proportions stay identical across all displays.
export const PX = _canvasW / _designW;

export const GAME = {
  WIDTH: _canvasW,
  HEIGHT: _canvasH,
  IS_PORTRAIT: _isPortrait,
  GRAVITY: 0, // No gravity — bits fall with custom velocity
};

// --- Safe Zone (Play.fun widget overlay) ---
// The Play.fun SDK widget renders a 75px fixed bar at top:0, z-index:9999.
// All UI text, buttons, and interactive elements must be positioned below SAFE_ZONE.TOP.
export const SAFE_ZONE = {
  TOP: GAME.HEIGHT * 0.08,
  BOTTOM: 0,
  LEFT: 0,
  RIGHT: 0,
};

// --- Player (Nick Land) ---

const SPRITE_ASPECT = 1.5;

export const PLAYER = {
  START_X: GAME.WIDTH * 0.5,
  START_Y: GAME.HEIGHT * 0.88,
  WIDTH: GAME.WIDTH * 0.12,
  HEIGHT: GAME.WIDTH * 0.12 * SPRITE_ASPECT,
  SPEED: 350 * PX,
  COLOR: 0x1a1a2e,         // Dark cloak body
  FACE_COLOR: 0xd4c5a9,    // Pale face
  EYE_COLOR: 0x00ff88,     // Glowing green eyes
  CLOAK_ACCENT: 0x2d1b4e,  // Deep purple accent on cloak
};

// --- Bits (falling obstacles) ---

export const BIT = {
  MIN_SIZE: GAME.WIDTH * 0.04,
  MAX_SIZE: GAME.WIDTH * 0.06,
  INITIAL_FALL_SPEED: 150 * PX,
  INITIAL_SPAWN_INTERVAL: 800,   // ms between spawns at start
  MIN_SPAWN_INTERVAL: 150,       // fastest spawn rate
  SPAWN_MARGIN: GAME.WIDTH * 0.05, // margin from edges
  POOL_SIZE: 40,                 // max bits in object pool
  CHARACTERS: ['0', '1', '\u221E', '\u03A9', '\u0394', '\u00A7', '//', '{}', '<>'],
};

// --- Acceleration ---

export const ACCELERATION = {
  SPEED_INCREMENT: 0.03,    // speed multiplier increase per second
  MAX_SPEED_MULTIPLIER: 4.0,
  SPAWN_RATE_DECAY: 0.985,  // spawn interval multiplied by this each second
  MILESTONES: [2.0, 3.0, 4.0], // emit SPEED_INCREASED at these multipliers
};

// --- Colors (Cyberpunk theme) ---

export const COLORS = {
  // Gameplay
  BG_DARK: 0x0a0a0f,       // Near-black background
  GRID_LINE: 0x1a1a2e,     // Subtle grid color
  GRID_ALPHA: 0.3,

  // Neon bit colors
  NEON_GREEN: '#00ff88',
  NEON_CYAN: '#00e5ff',
  NEON_MAGENTA: '#ff00ff',
  NEON_YELLOW: '#ffff00',
  NEON_COLORS: ['#00ff88', '#00e5ff', '#ff00ff', '#ffff00', '#ff3366'],

  // Neon hex values for graphics
  NEON_GREEN_HEX: 0x00ff88,
  NEON_CYAN_HEX: 0x00e5ff,
  NEON_MAGENTA_HEX: 0xff00ff,

  // UI text
  UI_TEXT: '#ffffff',
  UI_SHADOW: '#000000',
  MUTED_TEXT: '#8888aa',
  SCORE_GOLD: '#ffd700',

  // Menu / GameOver gradient backgrounds
  BG_TOP: 0x0a0a0f,
  BG_BOTTOM: 0x1a0a2e,

  // Buttons
  BTN_PRIMARY: 0x6c00ff,
  BTN_PRIMARY_HOVER: 0x8533ff,
  BTN_PRIMARY_PRESS: 0x5a00d5,
  BTN_TEXT: '#ffffff',

  // Player
  PLAYER: 0x1a1a2e,
};

// --- UI sizing (proportional to game dimensions) ---

export const UI = {
  FONT: '"Courier New", Courier, monospace',
  TITLE_RATIO: 0.08,          // title font size as % of GAME.HEIGHT
  HEADING_RATIO: 0.05,        // heading font size
  BODY_RATIO: 0.035,          // body/button font size
  SMALL_RATIO: 0.025,         // hint/caption font size
  BTN_W_RATIO: 0.45,          // button width as % of GAME.WIDTH
  BTN_H_RATIO: 0.075,         // button height as % of GAME.HEIGHT
  BTN_RADIUS: 12 * PX,        // button corner radius
  MIN_TOUCH: 44 * PX,         // minimum touch target
  // Score HUD omitted — Play.fun widget displays score in SAFE_ZONE.TOP area
};

// --- Transitions ---

export const TRANSITION = {
  FADE_DURATION: 350,
};

// --- Near-miss detection ---

export const NEAR_MISS = {
  THRESHOLD: 0.20, // 20% of player width
};
