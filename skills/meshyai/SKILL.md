---
name: meshyai
description: Generate custom 3D models from text or images using Meshy AI, then auto-rig and animate them for Three.js games. Use when existing free model libraries don't have what you need.
user-invocable: false
---

# Meshy AI — 3D Model Generation, Rigging & Animation

You are an expert at generating custom 3D models with Meshy AI and integrating them into Three.js browser games. Use this when free model libraries (Sketchfab, Poly Haven, Poly.pizza, three.js repo) don't have the exact model needed — Meshy generates it from a text description or reference image.

## When to Use Meshy vs Free Libraries

| Need | Use | Reason |
|------|-----|--------|
| Generic props (barrel, tree, house) | `find-3d-asset.mjs` | Free, instant, no credits |
| Animated humanoids (walk/run/idle) | `3d-character-library/` | Pre-built, no auth |
| Custom character matching a specific description | **Meshy text-to-3d** | Nothing like it exists |
| Turn concept art / photo into 3D model | **Meshy image-to-3d** | Unique asset from image |
| Rig a generated model for animation | **Meshy rig** | Auto-skeleton for humanoids |
| Stylized / branded assets | **Meshy text-to-3d** | Exact art direction |

**Cost awareness:** Meshy uses credits. Preview = 5-20 credits, refine = 10 credits, image-to-3d = 5-20 credits. Don't burn credits on models you can find for free.

## Authentication

All Meshy API calls require `MESHY_API_KEY`. If the key is not set, **ask the user**:

> I need a Meshy AI API key to generate custom 3D models. You can get one at:
> 1. Sign in at https://app.meshy.ai
> 2. Go to Settings → API Keys
> 3. Create a new API key
>
> What is your Meshy API key?

Then pass it as: `MESHY_API_KEY=<key> node scripts/meshy-generate.mjs ...`

## CLI Script — `scripts/meshy-generate.mjs`

Zero-dependency Node.js script. Handles the full lifecycle: submit task → poll → download GLB → write meta.json.

### Text to 3D (full pipeline)

Generates a 3D model from a text prompt. Two-step process: preview (geometry) → refine (texturing).

```bash
# Full pipeline: preview → refine → download
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode text-to-3d \
  --prompt "a cartoon knight with sword and shield" \
  --output public/assets/models/ \
  --slug knight

# Preview only (faster, untextured — good for geometry check)
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode text-to-3d \
  --prompt "a wooden barrel" \
  --preview-only \
  --output public/assets/models/ \
  --slug barrel

# With PBR textures and specific polycount
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode text-to-3d \
  --prompt "a sci-fi hover bike" \
  --pbr \
  --polycount 15000 \
  --ai-model meshy-6 \
  --output public/assets/models/ \
  --slug hoverbike
```

### Image to 3D

Turn a reference image into a 3D model. Supports URLs, local files, and base64 data URIs.

```bash
# From URL
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode image-to-3d \
  --image "https://example.com/character-concept.png" \
  --output public/assets/models/ \
  --slug character

# From local file (auto-converts to base64)
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode image-to-3d \
  --image "./concept-art/hero.png" \
  --output public/assets/models/ \
  --slug hero
```

### Auto-Rig (humanoids only)

Adds a skeleton to a generated humanoid model. The input task ID comes from a completed text-to-3d or image-to-3d task.

```bash
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode rig \
  --task-id <meshy-task-id> \
  --height 1.8 \
  --output public/assets/models/ \
  --slug hero-rigged
```

**Limitations:** Rigging works only on textured humanoid (bipedal) models with clearly defined limbs. Won't work on animals, vehicles, abstract shapes, or untextured meshes.

### Animate

Apply an animation to a rigged model. Requires a completed rig task ID and an animation action ID.

```bash
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode animate \
  --task-id <rig-task-id> \
  --action-id 1 \
  --output public/assets/models/ \
  --slug hero-walk
```

### Check Status

Poll any task's current status.

```bash
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode status \
  --task-id <task-id> \
  --task-type text-to-3d   # or: image-to-3d, rigging, animations
```

### Non-blocking Mode

Submit a task without waiting. Useful in pipelines.

```bash
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode text-to-3d \
  --prompt "a crystal sword" \
  --no-poll

# Later:
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode status --task-id <id> --task-type text-to-3d
```

## API Reference

Base URL: `https://api.meshy.ai/openapi`

### Text to 3D

**POST** `/v2/text-to-3d` — Create preview or refine task

Preview payload:
```json
{
  "mode": "preview",
  "prompt": "a cartoon knight with sword and shield",
  "ai_model": "latest",
  "topology": "triangle",
  "target_polycount": 30000
}
```

Refine payload:
```json
{
  "mode": "refine",
  "preview_task_id": "<preview-task-id>",
  "enable_pbr": true,
  "texture_prompt": "hand-painted fantasy style"
}
```

**GET** `/v2/text-to-3d/:id` — Retrieve task (poll this)

Response when complete:
```json
{
  "id": "task-uuid",
  "status": "SUCCEEDED",
  "progress": 100,
  "model_urls": {
    "glb": "https://assets.meshy.ai/...",
    "fbx": "https://assets.meshy.ai/...",
    "obj": "https://assets.meshy.ai/...",
    "usdz": "https://assets.meshy.ai/..."
  },
  "texture_urls": [
    { "base_color": "https://..." }
  ],
  "thumbnail_url": "https://..."
}
```

Optional parameters:
- `ai_model`: `meshy-5`, `meshy-6`, `latest` (default: `latest`)
- `model_type`: `standard` or `lowpoly`
- `topology`: `quad` or `triangle` (default: `triangle`)
- `target_polycount`: 100–300,000 (default: 30,000)
- `symmetry_mode`: `off`, `auto`, `on` (default: `auto`)
- `pose_mode`: `a-pose`, `t-pose`, or empty string
- `enable_pbr`: generates metallic, roughness, and normal maps

### Image to 3D

**POST** `/v1/image-to-3d` — Create task

```json
{
  "image_url": "https://example.com/photo.png",
  "ai_model": "latest",
  "enable_pbr": false,
  "should_texture": true,
  "topology": "triangle",
  "target_polycount": 30000
}
```

**GET** `/v1/image-to-3d/:id` — Retrieve task

Supports `image_url` as public URL, base64 data URI (`data:image/png;base64,...`), or multi-image via **POST** `/v1/multi-image-to-3d` (1–4 images from different angles).

### Rigging

**POST** `/v1/rigging` — Create rigging task

```json
{
  "input_task_id": "<text-to-3d or image-to-3d task id>",
  "height_meters": 1.7
}
```

**GET** `/v1/rigging/:id` — Retrieve task

Result includes:
- `rigged_character_glb_url` — rigged GLB ready for Three.js
- `rigged_character_fbx_url` — rigged FBX
- `basic_animations` — walking/running GLB URLs included free

### Animation

**POST** `/v1/animations` — Create animation task

```json
{
  "rig_task_id": "<rigging-task-id>",
  "action_id": 1
}
```

**GET** `/v1/animations/:id` — Retrieve task

Result includes `animation_glb_url`, `animation_fbx_url`.

### Task Statuses

All tasks progress through: `PENDING` → `IN_PROGRESS` → `SUCCEEDED` / `FAILED` / `CANCELED`

Poll at 5-second intervals. Tasks typically complete in 30s–5min depending on complexity.

### Asset Retention

Meshy retains generated assets for **3 days** (unlimited for Enterprise). Download promptly.

## Full Pipeline: Generate → Rig → Integrate

The most common workflow for game characters:

### Step 1: Generate the model

```bash
MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode text-to-3d \
  --prompt "a stylized goblin warrior with a wooden club, low poly game character" \
  --pbr \
  --polycount 15000 \
  --output public/assets/models/ \
  --slug goblin
```

### Step 2: Rig for animation (humanoid only)

Read the meta.json to get the refine task ID:
```bash
# Get the refine task ID from meta
cat public/assets/models/goblin.meta.json | grep refineTaskId

MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
  --mode rig \
  --task-id <refine-task-id> \
  --height 1.2 \
  --output public/assets/models/ \
  --slug goblin-rigged
```

### Step 3: Integrate into Three.js game

Use the same `AssetLoader.js` pattern from the `game-3d-assets` skill:

```js
import { loadAnimatedModel, loadModel } from './level/AssetLoader.js';

// For rigged/animated models (from Meshy rig output)
const { model, clips } = await loadAnimatedModel('assets/models/goblin-rigged.glb');
const mixer = new THREE.AnimationMixer(model);

// Log clip names to build clipMap
console.log('Clips:', clips.map(c => c.name));

// For static models (from text-to-3d or image-to-3d, no rig)
const prop = await loadModel('assets/models/crystal-sword.glb');
scene.add(prop);
```

### Step 4: Wire animations

If rigging returned `basic_animations`, download those GLBs and load their clips:

```js
// basic_animations from rig step often include walk/run
const walkGltf = await loadAnimatedModel('assets/models/goblin-walk.glb');
const walkClip = walkGltf.clips.find(c => c.name.includes('walk') || c.name.includes('Walk'));
if (walkClip) {
  const walkAction = mixer.clipAction(walkClip);
}
```

## Prompt Engineering Tips

Good prompts produce better models:

| Goal | Prompt | Why |
|------|--------|-----|
| Game character | "a stylized goblin warrior, low poly game character, full body" | "low poly" + "game character" = game-ready topology |
| Prop | "a wooden treasure chest, stylized, closed" | Simple, specific, single object |
| Environment piece | "a fantasy stone archway, low poly, game asset" | "game asset" signals clean geometry |
| Vehicle | "a sci-fi hover bike, side view, clean topology" | "clean topology" = fewer artifacts |

**Avoid:**
- Multiple objects in one prompt ("a knight AND a dragon") — generate separately
- Vague prompts ("something cool") — be specific about style and form
- Interior/architectural scenes — Meshy is best for single objects

## Integration with Existing Pipeline

Meshy-generated models slot into the existing 3D asset pipeline:

```
┌─────────────────────────────────────────────────────┐
│                 3D Asset Sources                     │
├──────────────┬──────────────┬───────────────────────┤
│ Free Libraries│ Character Lib │     Meshy AI          │
│ find-3d-asset │ 3d-char-lib/ │ meshy-generate.mjs    │
│   .mjs       │              │ text/image → 3D       │
│              │              │ rig → animate         │
├──────────────┴──────────────┴───────────────────────┤
│              AssetLoader.js                         │
│         loadModel() / loadAnimatedModel()           │
├─────────────────────────────────────────────────────┤
│              Three.js Game                          │
└─────────────────────────────────────────────────────┘
```

All sources output GLB files into `public/assets/models/`. The `AssetLoader.js` doesn't care where the GLB came from — it loads them all the same way.

## Checklist

- [ ] `MESHY_API_KEY` is set (or prompted user for it)
- [ ] Checked free libraries first before burning Meshy credits
- [ ] Prompt is specific (style, poly count, single object)
- [ ] Downloaded GLB before 3-day expiration
- [ ] Static models use `loadModel()` (regular clone)
- [ ] Rigged models use `loadAnimatedModel()` (SkeletonUtils.clone)
- [ ] Clip names logged and `clipMap` defined for animated models
- [ ] `.meta.json` saved alongside GLB with task IDs for traceability
- [ ] `npm run build` succeeds
