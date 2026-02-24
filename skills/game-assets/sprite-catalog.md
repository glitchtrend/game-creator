# Sprite Catalog

Complete catalog of sprite archetypes for pixel art game assets. Grid sizes vary by archetype — from 8x8 for tiny pickups to 32x48 for personality characters. The default scale is 3 (each pixel becomes 3x3 on screen).

When creating sprites for a game, match the archetype to the entity type.

## Design Philosophy: Push the Pose

Before choosing an archetype, consider what each entity represents thematically:

- **Real people** → Always use the Personality Character archetype. Exaggerate their most recognizable feature until it's almost a caricature. Recognition is everything.
- **Companies/brands** → Incorporate logo shapes into the sprite. Use brand colors as the primary palette. Consider anthropomorphizing the logo (add limbs, face, expressions).
- **Game objects** → Must be instantly recognizable real-world objects, never abstract shapes. A collectible representing "creative output" could be a painting, a polaroid, a film reel — not a generic diamond or spark.
- **Opponents** → Each must be visually distinct. Different silhouettes, color palettes, and proportions. If they represent specific entities (rival companies, other people), build that identity into the sprite.

When in doubt, make it MORE recognizable, MORE exaggerated, MORE character-driven. We dial back, never up.

## Personality Character (Caricature)

For games featuring real people or named personalities (Karpathy, Altman, Amodei, etc.). Recognition IS the meme hook — the character must dominate the screen.

- **Grid**: 32x48 (wide enough for facial detail, tall for caricature proportions)
- **Scale**: 4 (renders to 128x192px = ~35% of 540px canvas height)
- Head occupies 60%+ of sprite height; exaggerate signature features (hair, glasses, facial hair) at 4-6px
- Must be the largest entity on screen — supporting entities stay at Medium (16x16) or Small (12x12)
- Body is stubby (40% of height) to maximize head real estate

```js
// sprites/personality.js — 32x48 caricature template
// Head: rows 0-28 (60%), Body: rows 29-40, Legs: rows 41-47
// 1=outline, 2=shadow, 3=skin, 4=hair, 5=highlight, 6=shirt, 7=pants, 8=white(eyes/teeth), 9=glasses/accessory
export const PERSONALITY_IDLE = [
  [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,4,4,4,4,4,5,4,4,4,4,4,4,5,4,4,4,4,4,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,3,9,9,9,9,3,3,3,3,9,9,9,9,3,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,9,9,8,8,9,9,3,3,9,9,8,8,9,9,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,9,9,1,8,9,9,3,3,9,9,1,8,9,9,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,9,9,9,9,9,9,3,3,9,9,9,9,9,9,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
  [0,0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0],
  [0,0,0,0,0,1,3,3,3,3,3,3,3,1,1,1,1,1,3,3,3,3,3,3,3,3,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,3,3,3,3,3,3,8,8,8,8,8,3,3,3,3,3,3,3,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,2,3,3,3,3,3,3,3,3,2,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,3,6,6,6,6,6,6,6,6,6,6,3,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,3,6,6,6,6,6,6,6,6,6,6,3,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,1,1,6,6,6,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,1,1,6,6,6,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,1,1,7,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,1,1,7,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,1,1,7,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,1,0,0,1,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,1,0,0,1,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,7,7,1,0,0,1,7,7,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
];

export const PERSONALITY_FRAMES = [PERSONALITY_IDLE];
```

Customize per personality: change hair color/style (index 4), add glasses (index 9), adjust facial hair. The head rows (0-28) are where all recognition lives — spend your detail budget there.

### Character Feature Reference

Physical descriptions for commonly-appearing tech figures. Use these to customize the personality template — every field maps to sprite design decisions.

| Person | Hair | Face | Clothing | Palette accent | Key feature |
|--------|------|------|----------|----------------|-------------|
| Sam Altman | Short sandy/light brown, side-parted | Clean-shaven, round face | Gray hoodie | `0xC4A882` (sandy) | The hoodie + round face combo |
| Dario Amodei | Dark curly hair, voluminous | Beard/stubble, rectangular glasses | Blazer over casual shirt | `0x3D2B1F` (dark brown) | Curly hair + glasses + beard |
| Elon Musk | Receding hairline, short | Broad face, clean-shaven | Black t-shirt | `0x2A2A2A` (charcoal) | Receding hairline + broad jaw |
| Mark Zuckerberg | Short curly brown hair | Clean-shaven, narrow face | Simple gray/blue t-shirt | `0x4267B2` (Facebook blue) | Curly top + blank expression |
| Satya Nadella | Bald | Glasses, warm smile | Dark suit and tie | `0x00A4EF` (Microsoft blue) | Bald + glasses |
| Sundar Pichai | Dark hair, neatly styled | Clean-shaven, slim face | Casual button-down shirt | `0x4285F4` (Google blue) | Slim face + neat dark hair |
| Jensen Huang | Dark hair, swept back | Clean-shaven, square jaw | Black leather jacket (signature) | `0x76B900` (NVIDIA green) | Leather jacket is instant recognition |
| Andrej Karpathy | Dark wavy hair | Stubble, friendly face | Casual (t-shirt/hoodie) | `0x5C5C5C` (neutral gray) | Wavy hair + stubble |

When building a personality sprite for any of these people:
1. Start from `PERSONALITY_IDLE` template
2. Set hair color (index 4) to their palette accent
3. Add/remove glasses (index 9) per the table
4. Adjust hair shape in rows 0-7 (curly = wider irregular edges, receding = narrower top rows, bald = skip hair rows)
5. Add facial hair in rows 17-19 if applicable (beard = fill chin area with dark index)
6. Set shirt color (index 6) to match their typical clothing

## Humanoid (Player, NPC, Warrior)

Key features: Head (2-3px wide), body (3-4px wide), legs (2 columns). Arms optional at 16x16. Distinguish characters via hair/hat color and body color.

```js
// sprites/player.js
import { PALETTE } from './palette.js';

export const PLAYER_PALETTE = PALETTE.DARK;

// Idle frame — standing, sword at side
export const PLAYER_IDLE = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,1,5,1,5,5,1,5,1,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,0,1,5,3,5,5,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,5,6,6,6,6,6,6,5,1,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,0,1,7,7,1,1,7,7,1,0,0,0,0],
  [0,0,0,0,1,7,7,1,1,7,7,1,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
];

// Walk frame 1 — left leg forward
export const PLAYER_WALK1 = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,1,5,1,5,5,1,5,1,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,0,1,5,3,5,5,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,5,6,6,6,6,6,6,5,1,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,1,7,7,1,0,0,1,7,7,1,0,0,0],
  [0,0,1,7,7,1,0,0,0,0,1,7,1,0,0,0],
  [0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0],
];

// Walk frame 2 — right leg forward (mirror of walk1)
export const PLAYER_WALK2 = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,1,5,1,5,5,1,5,1,0,0,0,0],
  [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
  [0,0,0,0,0,1,5,3,5,5,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
  [0,0,0,1,5,6,6,6,6,6,6,5,1,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,1,0,0,0,0],
  [0,0,0,1,7,1,0,0,1,7,7,1,0,0,0,0],
  [0,0,0,1,7,1,0,0,0,1,7,7,1,0,0,0],
  [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
];

export const PLAYER_FRAMES = [PLAYER_IDLE, PLAYER_WALK1, PLAYER_IDLE, PLAYER_WALK2];
```

## Flying Creature (Bat, Ghost, Bird)

Key features: Wide silhouette (wings/wispy edges), small body, glowing eyes. Wings swap between up/down for animation.

```js
// In sprites/enemies.js
export const BAT_IDLE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0],
  [0,1,9,9,1,0,0,0,0,0,1,9,9,1,0,0],
  [1,9,9,9,9,1,0,0,0,1,9,9,9,9,1,0],
  [1,9,9,9,9,9,1,1,1,9,9,9,9,9,1,0],
  [0,1,9,9,9,9,9,9,9,9,9,9,9,1,0,0],
  [0,0,1,9,9,3,9,9,9,3,9,9,1,0,0,0],
  [0,0,0,1,9,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,0,0,1,9,9,8,9,9,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Wings down frame — alternate with idle for flapping
export const BAT_FLAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,1,0,0,0,0,0],
  [0,0,0,1,9,9,3,9,3,9,9,1,0,0,0,0],
  [0,0,1,9,9,9,9,9,9,9,9,9,1,0,0,0],
  [0,1,9,9,9,9,9,8,9,9,9,9,9,1,0,0],
  [1,9,9,9,9,9,1,1,1,9,9,9,9,9,1,0],
  [1,9,9,9,9,1,0,0,0,1,9,9,9,9,1,0],
  [0,1,9,9,1,0,0,0,0,0,1,9,9,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
```

## Ground Creature (Zombie, Slime, Skeleton)

Key features: Wider base, heavier silhouette, shambling posture. Animate by shifting body weight side to side.

```js
// Zombie — hunched, arms forward
export const ZOMBIE_IDLE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,10,10,10,10,10,1,0,0,0,0,0],
  [0,0,0,0,1,10,3,10,3,10,1,0,0,0,0,0],
  [0,0,0,0,1,10,10,10,10,10,1,0,0,0,0,0],
  [0,0,0,0,0,1,10,1,10,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,7,7,7,7,7,1,0,0,0,0,0],
  [0,0,0,1,7,7,7,7,7,7,7,1,0,0,0,0],
  [0,0,1,10,7,7,7,7,7,7,10,10,1,0,0,0],
  [0,1,10,1,7,7,7,7,7,7,1,10,10,1,0,0],
  [0,0,0,0,1,7,7,7,7,7,1,0,0,0,0,0],
  [0,0,0,0,1,7,7,1,7,7,1,0,0,0,0,0],
  [0,0,0,0,1,7,1,0,1,7,1,0,0,0,0,0],
  [0,0,0,0,1,10,1,0,1,10,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,1,1,1,0,0,0,0,0],
];
```

## Item / Pickup (Gem, Coin, Heart, Orb)

Key features: Small (8x8 or 12x12), bright colors, simple symmetric shape. Often animated with a bob tween rather than frame animation.

```js
// XP Gem — diamond shape, 8x8
export const XP_GEM = [
  [0,0,0,4,4,0,0,0],
  [0,0,4,4,4,4,0,0],
  [0,4,4,8,4,4,4,0],
  [4,4,8,4,4,4,4,4],
  [4,4,4,4,4,8,4,4],
  [0,4,4,4,4,4,4,0],
  [0,0,4,4,4,4,0,0],
  [0,0,0,4,4,0,0,0],
];

// Heart — 8x8
export const HEART = [
  [0,0,3,3,0,3,3,0],
  [0,3,3,3,3,3,3,3],
  [0,3,8,3,3,3,3,3],
  [0,3,3,3,3,3,3,3],
  [0,0,3,3,3,3,3,0],
  [0,0,0,3,3,3,0,0],
  [0,0,0,0,3,0,0,0],
  [0,0,0,0,0,0,0,0],
];
```

## Projectile (Bullet, Fireball, Magic Bolt)

Key features: Very small (4x4 to 8x8), bright, high contrast. Often just a few pixels with a glow color.

```js
// Fireball — 8x8
export const FIREBALL = [
  [0,0,0,4,4,0,0,0],
  [0,0,4,4,4,4,0,0],
  [0,3,4,8,4,4,3,0],
  [3,3,4,4,4,4,3,3],
  [0,3,3,4,4,3,3,0],
  [0,0,3,3,3,3,0,0],
  [0,0,0,3,3,0,0,0],
  [0,0,0,0,0,0,0,0],
];

// Magic bolt — 6x6
export const MAGIC_BOLT = [
  [0,0,9,9,0,0],
  [0,9,8,9,9,0],
  [9,9,9,9,9,9],
  [9,9,9,9,9,9],
  [0,9,9,8,9,0],
  [0,0,9,9,0,0],
];
```

## Background Tile (Ground, Floor, Terrain)

Key features: Seamless tiling, subtle variation between tiles, low contrast so entities stand out. Use 16x16 tiles at scale 2 (32x32px each).

```js
// sprites/tiles.js — background tile variants

// Ground tile — base terrain (dark earth / stone)
export const GROUND_BASE = [
  [2,2,2,1,2,2,2,2,2,2,1,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2],
  [2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2],
  [2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2],
  [2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

// Variant tiles — alternate with GROUND_BASE for variety
export const GROUND_VAR1 = [ /* same size, different speckle pattern */ ];
export const GROUND_VAR2 = [ /* ... */ ];
```

## Decorative Elements (8x8 to 16x16)

Small props scattered on the ground at random positions. Not tiles — placed once during scene creation.

```js
// Gravestone — 8x12
export const GRAVESTONE = [
  [0,0,1,1,1,1,0,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,8,8,18,1,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,18,18,18,1,0],
  [0,1,18,18,18,18,1,0],
  [1,18,18,18,18,18,18,1],
  [1,18,18,18,18,18,18,1],
  [1,1,1,1,1,1,1,1],
];

// Bone pile — 8x6
export const BONE_PILE = [
  [0,0,8,0,0,8,0,0],
  [0,8,8,8,8,8,8,0],
  [8,18,8,8,8,18,8,8],
  [0,8,8,8,8,8,8,0],
  [0,8,18,8,8,18,8,0],
  [0,0,8,8,8,8,0,0],
];

// Torch — 6x12 (flickering tip animated via tween tint, not extra frame)
export const TORCH = [
  [0,0,4,4,0,0],
  [0,4,12,12,4,0],
  [0,0,4,4,0,0],
  [0,0,1,1,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,19,19,0,0],
  [0,0,1,1,0,0],
];
```

## Tiled Background Rendering

Use `renderPixelArt()` to create tile textures, then fill the world with `tileSprite`:

```js
// In the game scene's create():
import { renderPixelArt } from '../core/PixelRenderer.js';
import { GROUND_BASE, GROUND_VAR1, GROUND_VAR2 } from '../sprites/tiles.js';
import { PALETTE } from '../sprites/palette.js';

// Render tile textures
renderPixelArt(scene, GROUND_BASE, PALETTE, 'tile-ground-0', 2);
renderPixelArt(scene, GROUND_VAR1, PALETTE, 'tile-ground-1', 2);
renderPixelArt(scene, GROUND_VAR2, PALETTE, 'tile-ground-2', 2);

// Option A: TileSprite for infinite seamless ground
const bg = scene.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'tile-ground-0');
bg.setOrigin(0, 0);
bg.setDepth(-10);

// Option B: Random tile grid for variety (better visual result)
const tileSize = 32; // 16px * scale 2
for (let y = 0; y < WORLD_HEIGHT; y += tileSize) {
  for (let x = 0; x < WORLD_WIDTH; x += tileSize) {
    const variant = Math.random() < 0.7 ? 'tile-ground-0'
                  : Math.random() < 0.5 ? 'tile-ground-1'
                  : 'tile-ground-2';
    scene.add.image(x + tileSize / 2, y + tileSize / 2, variant).setDepth(-10);
  }
}

// Scatter decorative elements
const decorTypes = ['deco-gravestone', 'deco-bones', 'deco-torch'];
for (let i = 0; i < 40; i++) {
  const dx = Phaser.Math.Between(100, WORLD_WIDTH - 100);
  const dy = Phaser.Math.Between(100, WORLD_HEIGHT - 100);
  const type = Phaser.Utils.Array.GetRandom(decorTypes);
  const deco = scene.add.image(dx, dy, type);
  deco.setDepth(-5);
  deco.setAlpha(0.6 + Math.random() * 0.4);
}
```

## Background Design Rules

1. **Low contrast** — background tiles should be 2-3 shades of the same dark color. Entities must pop against the background.
2. **Subtle variation** — use 2-3 tile variants with different speckle patterns. Random placement breaks repetition.
3. **Decorative props** — scatter 20-50 small decorations across the world. Low alpha (0.5-0.8) keeps them subtle.
4. **Match the theme** — gothic games: gravestones, bones, dead trees. Sci-fi: metal panels, pipes, lights. Nature: grass tufts, flowers, rocks.
5. **Depth layering** — tiles at depth -10, decorations at -5, entities at 5-15. Never let background compete with gameplay.
