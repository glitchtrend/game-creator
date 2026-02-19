export const GAME = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 200,
  MAX_DELTA: 0.05,
  MAX_DPR: 2,
};

export const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1);

export const RUNNER = {
  LANE_WIDTH: 2.5,
  LANES: [-1, 0, 1],
  LANE_SWITCH_SPEED: 10,
  START_SPEED: 15,
  MAX_SPEED: 40,
  ACCELERATION: 0.3,
  JUMP_FORCE: 12,
  GRAVITY: 30,
  SLIDE_DURATION: 0.6,
};

export const PLAYER = {
  WIDTH: 0.8,
  HEIGHT: 1.6,
  DEPTH: 0.6,
  COLOR: 0x00ffcc,
  GLOW_COLOR: 0x00ff88,
};

export const OBSTACLE = {
  SPAWN_DISTANCE: 60,
  DESPAWN_DISTANCE: -10,
  MIN_GAP: 8,
  BARRIER_WIDTH: 2,
  BARRIER_HEIGHT: 2,
  OVERHEAD_HEIGHT: 1.0,
  OVERHEAD_Y: 1.5,
  GROUND_OBSTACLE_HEIGHT: 1.5,
  COLOR: 0xff3333,
};

export const COLLECTIBLE = {
  SIZE: 0.5,
  COLOR: 0x00ff00,
  GLOW_COLOR: 0x88ff88,
  ROTATION_SPEED: 2,
  HOVER_AMPLITUDE: 0.3,
  HOVER_SPEED: 3,
  POINTS: 10,
  SPAWN_CHANCE: 0.4,
};

export const TUNNEL = {
  WIDTH: 8,
  HEIGHT: 6,
  SEGMENT_LENGTH: 10,
  VISIBLE_SEGMENTS: 15,
  COLOR: 0x00ff00,
  WIREFRAME: true,
  OPACITY: 0.15,
  FLOOR_COLOR: 0x001a00,
};

export const CAMERA = {
  OFFSET_Y: 3,
  OFFSET_Z: 7,
  LOOK_AHEAD: -5,
};

export const COLORS = {
  SKY: 0x000000,
  AMBIENT_LIGHT: 0x003300,
  AMBIENT_INTENSITY: 0.3,
  DIR_LIGHT: 0x00ff66,
  DIR_INTENSITY: 0.6,
  FOG_COLOR: 0x000000,
  FOG_NEAR: 30,
  FOG_FAR: 100,
};
