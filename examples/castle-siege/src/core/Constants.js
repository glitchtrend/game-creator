// =============================================================================
// Constants.js — All magic numbers for Castle Siege Defense
// Zero hardcoded values in game logic.
// =============================================================================

export const GAME = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 500,
  MAX_DELTA: 0.05,
  MAX_DPR: 2,
};

export const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1);

// Play.fun SDK widget renders a 75px fixed bar at top:0, z-index:9999.
// All HTML overlays must account for this with padding-top or safe offset.
export const SAFE_ZONE = {
  TOP_PX: 75,          // pixels — use for CSS/HTML overlays
  TOP_PERCENT: 8,      // percent of viewport height
};

// ---------------------------------------------------------------------------
// Camera — isometric-like perspective behind and above the castle
// ---------------------------------------------------------------------------
export const CAMERA = {
  POSITION_X: 0,
  POSITION_Y: 35,
  POSITION_Z: 35,
  LOOK_AT_X: 0,
  LOOK_AT_Y: 0,
  LOOK_AT_Z: -5,
};

// ---------------------------------------------------------------------------
// Level / Battlefield
// ---------------------------------------------------------------------------
export const LEVEL = {
  GROUND_SIZE: 80,
  GROUND_COLOR: 0x4a7c2e,
  PATH_COLOR: 0x8B7355,
  PATH_WIDTH: 12,
  FOG_COLOR: 0x87ceeb,
  FOG_NEAR: 60,
  FOG_FAR: 200,
};

// ---------------------------------------------------------------------------
// Castle geometry
// ---------------------------------------------------------------------------
export const CASTLE = {
  // Position — castle sits at the near (positive Z) end of the battlefield
  POSITION_Z: LEVEL.GROUND_SIZE / 2 - 8,
  POSITION_Y: 0,

  // Main keep
  KEEP_WIDTH: 8,
  KEEP_HEIGHT: 10,
  KEEP_DEPTH: 8,
  KEEP_COLOR: 0xA0A0A0,

  // Corner towers
  TOWER_RADIUS: 2.5,
  TOWER_HEIGHT: 12,
  TOWER_SEGMENTS: 8,
  TOWER_COLOR: 0x909090,
  TOWER_ROOF_COLOR: 0x8B0000,
  TOWER_ROOF_HEIGHT: 3,
  TOWER_SPREAD_X: 10,
  TOWER_SPREAD_Z: 5,

  // Connecting walls
  WALL_HEIGHT: 7,
  WALL_THICKNESS: 1.5,
  WALL_COLOR: 0x989898,

  // Battlements (crenellations)
  MERLON_SIZE: 0.8,
  MERLON_SPACING: 1.6,
  MERLON_COLOR: 0x888888,

  // Gate
  GATE_WIDTH: 4,
  GATE_HEIGHT: 5,
  GATE_COLOR: 0x4a3728,

  // Damage feedback
  DAMAGE_FLASH_DURATION: 0.15,
  DAMAGE_FLASH_COLOR: 0xff3333,
};

// ---------------------------------------------------------------------------
// Enemies
// ---------------------------------------------------------------------------
export const ENEMY = {
  // Body dimensions
  BODY_WIDTH: 0.8,
  BODY_HEIGHT: 1.6,
  BODY_DEPTH: 0.6,
  HEAD_RADIUS: 0.35,
  HEAD_Y_OFFSET: 1.3,

  // Colors
  BODY_COLOR: 0x8B0000,
  HEAD_COLOR: 0xd4a574,
  SHIELD_COLOR: 0x555555,

  // Movement
  BASE_SPEED: 4,
  SPEED_INCREASE_PER_WAVE: 0.1,  // multiplier added per wave

  // Spawn
  SPAWN_Z: -(LEVEL.GROUND_SIZE / 2 - 5),
  SPAWN_X_RANGE: LEVEL.GROUND_SIZE / 2 - 10,
  LANE_COUNT: 5,

  // Health
  HEALTH: 1,

  // Castle damage
  CASTLE_DAMAGE: 10,

  // Score
  KILL_POINTS: 10,

  // Y position (half body height)
  GROUND_Y: 0.8,
};

// ---------------------------------------------------------------------------
// Projectiles
// ---------------------------------------------------------------------------
export const PROJECTILE = {
  RADIUS: 0.4,
  COLOR: 0xff8800,
  GLOW_COLOR: 0xffaa33,
  ARC_HEIGHT: 15,
  TRAVEL_TIME: 0.8,
  COOLDOWN: 0.35,
  SPLASH_RADIUS: 3.5,

  // Launch position (from castle top)
  LAUNCH_Y: 12,
  LAUNCH_Z: LEVEL.GROUND_SIZE / 2 - 8,

  // Impact effect
  IMPACT_RADIUS: 2.0,
  IMPACT_DURATION: 0.3,
  IMPACT_COLOR: 0xff6600,
};

// ---------------------------------------------------------------------------
// Wave system
// ---------------------------------------------------------------------------
export const WAVE = {
  BASE_ENEMY_COUNT: 5,
  ENEMY_INCREMENT: 3,
  SPAWN_INTERVAL: 0.8,        // seconds between each enemy spawn
  PAUSE_BETWEEN_WAVES: 3.0,   // seconds between waves
  COMPLETION_BONUS: 50,        // bonus points per wave completed
};

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const COLORS = {
  SKY: 0x87ceeb,
  AMBIENT_LIGHT: 0xffffff,
  AMBIENT_INTENSITY: 0.7,
  DIR_LIGHT: 0xfff5e0,
  DIR_INTENSITY: 1.0,
  HEMISPHERE_SKY: 0x87ceeb,
  HEMISPHERE_GROUND: 0x4a7c2e,
  HEMISPHERE_INTENSITY: 0.3,
};
