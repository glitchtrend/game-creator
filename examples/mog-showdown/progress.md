# Progress

## Game Concept
- **Name**: mog-showdown
- **Engine**: Phaser 3
- **Description**: Looksmaxxing arena dodge game — play as Clavicular, dodge Androgenic's attacks (wigs, hats), collect power-ups (protein shakes, dumbbells), fill the Mog Meter to trigger a devastating Frame Mog burst

## Step 1: Scaffold
- **Entities**: Clavicular (player), Androgenic (opponent NPC), Projectile (4 types: wig, hat, protein_shake, dumbbell)
- **Events**: GAME_START, GAME_OVER, GAME_RESTART, PLAYER_MOVE, PLAYER_DAMAGED, PLAYER_DIED, LIFE_LOST, SCORE_CHANGED, POWERUP_COLLECTED, ATTACK_HIT, MOG_LEVELUP, MOG_FRAMEMOG, ANDROGENIC_THROW, ANDROGENIC_WIG_EXPOSED, COMBO_BREAK, PARTICLES_EMIT, SPECTACLE_ENTRANCE/ACTION/HIT/COMBO/STREAK/NEAR_MISS, AUDIO_INIT/MUSIC_*/AUDIO_TOGGLE_MUTE
- **Constants keys**: GAME, SAFE_ZONE, CLAVICULAR, ANDROGENIC, PROJECTILE, MOG, SPAWN, LIVES, COLORS, UI, TRANSITION
- **Scoring system**: +1 per power-up collected, +5 bonus per Frame Mog trigger. Combo tracks consecutive catches without getting hit.
- **Fail condition**: 3 lives (hearts). Lose 1 life per attack hit. 0 lives = game over.
- **Input scheme**: Arrow keys left/right (desktop), tap zones left/right half (mobile)
- **Mog system**: Collect 5 power-ups to fill meter → Frame Mog burst clears attacks + exposes Androgenic's wig

## Characters
- clavicular: Tier 3 (3 unique images from Famous Birthdays, duplicated to 4 slots) — spritesheet built at public/assets/characters/clavicular/clavicular-expressions.png (800x300, 4 frames)
- androgenic: Tier 3 (3 unique images from Famous Birthdays, duplicated to 4 slots) — spritesheet built at public/assets/characters/androgenic/androgenic-expressions.png (800x300, 4 frames)

## QA Results
- Step 1: PASS — Build OK, runtime OK, scoring verified, entities visible, architecture 5/5
- Minor: characters slightly undersized (~8% vs recommended 12-15%), will address in design step

## Step 1.5: Assets
- **Character bobbleheads**: Both Clavicular and Androgenic rewritten as photo-composite bobblehead entities (cartoon South Park-style body + photo head spritesheet)
- **Spritesheet preloading**: BootScene now preloads both expression spritesheets (clavicular-head, androgenic-head) with 200x300 frame dimensions
- **Expression system**: Added EXPRESSION constants (NORMAL=0, HAPPY=1, ANGRY=2, SURPRISED=3) and EXPRESSION_HOLD_MS (600ms default), both characters have setExpression() method with auto-revert timer
- **Expression wiring in GameScene**: Clavicular goes HAPPY on powerup, ANGRY on hit, SURPRISED on frame mog. Androgenic goes ANGRY on powerup, HAPPY on hit, SURPRISED on frame mog. All listeners properly cleaned up on scene shutdown.
- **CHARACTER constants**: Added centralized bobblehead sizing unit system (_U based, with TORSO_H, SHOULDER_W, HEAD_H, FRAME_W/H, etc.)
- **Character scaling**: Clavicular WIDTH increased from 10% to 14% of canvas width, Androgenic from 12% to 16% (addresses QA note about undersized characters)
- **Androgenic wig mechanic**: Preserved and enhanced -- hat is now a separate Graphics object that animates flying off (upward + rotation + fade), surprised expression set on head sprite, hat restores after duration
- **Idle animations**: Both characters have breathing tweens (body bob) and bobblehead lag (head bobs with slight delay)
- **Projectile improvements**: All 4 projectile types sized up ~20% for visibility, each now has a subtle glow outline (lineStyle with 0.3 alpha)

## Decisions / Known Issues
- Gravity set to 0 — projectiles use custom velocity for falling
- No title screen — boots directly into gameplay
- No in-game score HUD — Play.fun widget handles score display
- 53 magic numbers flagged in architecture validation (rendering proportions in entity drawing code) — acceptable for Graphics API drawing, will be replaced by spritesheets in Step 1.5
