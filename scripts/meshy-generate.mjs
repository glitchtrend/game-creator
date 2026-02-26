#!/usr/bin/env node
/**
 * meshy-generate.mjs — Generate 3D models with Meshy AI, rig, and animate them.
 *
 * Zero npm dependencies. Uses Node.js built-in fetch, fs, path.
 *
 * Modes:
 *   text-to-3d   — Generate a 3D model from a text prompt (preview → refine)
 *   image-to-3d  — Generate a 3D model from an image
 *   rig          — Auto-rig a humanoid model for skeletal animation
 *   animate      — Apply an animation to a rigged model
 *   status       — Check the status of any task
 *
 * Usage:
 *   # Text to 3D (full pipeline: preview → wait → refine → wait → download)
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode text-to-3d --prompt "a cartoon knight with sword and shield" \
 *     --output public/assets/models/ --slug knight
 *
 *   # Image to 3D
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode image-to-3d --image "https://example.com/photo.png" \
 *     --output public/assets/models/ --slug character
 *
 *   # Rig an existing model (from Meshy task or external URL)
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode rig --task-id <meshy-task-id> \
 *     --output public/assets/models/ --slug character-rigged
 *
 *   # Animate a rigged model
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode animate --task-id <rig-task-id> --action-id 1 \
 *     --output public/assets/models/ --slug character-walk
 *
 *   # Check status of any task
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode status --task-id <task-id> --task-type text-to-3d
 *
 *   # Preview only (skip refine)
 *   MESHY_API_KEY=<key> node scripts/meshy-generate.mjs \
 *     --mode text-to-3d --prompt "a barrel" --preview-only \
 *     --output public/assets/models/ --slug barrel
 *
 * Output:
 *   {slug}.glb          — the 3D model file
 *   {slug}.meta.json    — source, prompt, task IDs, timestamps
 *
 * Environment:
 *   MESHY_API_KEY       — Required. Get one at https://app.meshy.ai → API Keys
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.meshy.ai/openapi';
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 360; // 30 minutes max

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getArg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

const hasFlag = (name) => args.includes(`--${name}`);

const mode = getArg('mode');
const prompt = getArg('prompt');
const imageUrl = getArg('image');
const outputDir = getArg('output', 'public/assets/models');
const slug = getArg('slug');
const taskId = getArg('task-id');
const taskType = getArg('task-type', 'text-to-3d');
const aiModel = getArg('ai-model', 'latest');
const actionId = parseInt(getArg('action-id', '0'), 10);
const previewOnly = hasFlag('preview-only');
const enablePbr = hasFlag('pbr');
const topology = getArg('topology', 'triangle');
const targetPolycount = parseInt(getArg('polycount', '30000'), 10);
const texturePrompt = getArg('texture-prompt');
const heightMeters = parseFloat(getArg('height', '1.7'));
const noPoll = hasFlag('no-poll');

const API_KEY = process.env.MESHY_API_KEY;

function requireApiKey() {
  if (!API_KEY) {
    throw new Error(
      'MESHY_API_KEY environment variable is required.\n' +
      'Get an API key at: https://app.meshy.ai → Settings → API Keys'
    );
  }
}

if (!mode) {
  console.error(`Usage: MESHY_API_KEY=<key> node scripts/meshy-generate.mjs --mode <mode> [options]

Modes:
  text-to-3d    Generate 3D model from text prompt
  image-to-3d   Generate 3D model from image
  rig           Auto-rig a humanoid model
  animate       Apply animation to rigged model
  status        Check task status

Options:
  --prompt <text>        Text prompt (text-to-3d)
  --image <url|path>     Image URL or base64 data URI (image-to-3d)
  --output <dir>         Output directory (default: public/assets/models)
  --slug <name>          Output filename slug
  --task-id <id>         Task ID (for refine, rig, animate, status)
  --task-type <type>     Task type for status check (text-to-3d, image-to-3d, rigging, animations)
  --ai-model <name>      AI model: meshy-5, meshy-6, latest (default: latest)
  --action-id <int>      Animation ID (animate mode)
  --preview-only         Skip refine step (text-to-3d)
  --pbr                  Enable PBR texture maps
  --topology <type>      quad or triangle (default: triangle)
  --polycount <n>        Target polygon count (default: 30000)
  --texture-prompt <t>   Additional texture guidance
  --height <meters>      Character height for rigging (default: 1.7)
  --no-poll              Submit task and exit without waiting

Environment:
  MESHY_API_KEY          API key from https://app.meshy.ai`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function headers() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${path} → HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} → HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function apiDelete(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DELETE ${path} → HTTP ${res.status}: ${text}`);
  }
  return res.status;
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status} from ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buffer);
  return buffer.length;
}

function writeMeta(outPath, meta) {
  writeFileSync(outPath, JSON.stringify(meta, null, 2) + '\n');
  console.log(`  meta → ${outPath}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Poll for task completion
// ---------------------------------------------------------------------------

async function pollTask(taskPath, label) {
  console.log(`  [meshy] Polling ${label}...`);
  let lastProgress = -1;

  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const task = await apiGet(taskPath);

    if (task.progress !== lastProgress) {
      lastProgress = task.progress;
      const bar = '█'.repeat(Math.floor(task.progress / 5)) + '░'.repeat(20 - Math.floor(task.progress / 5));
      process.stdout.write(`\r  [meshy] ${bar} ${task.progress}% — ${task.status}`);
    }

    if (task.status === 'SUCCEEDED') {
      console.log(`\n  [meshy] ${label} complete!`);
      return task;
    }

    if (task.status === 'FAILED') {
      const errMsg = task.task_error?.message || JSON.stringify(task.task_error) || 'Unknown error';
      throw new Error(`${label} failed: ${errMsg}`);
    }

    if (task.status === 'CANCELED') {
      throw new Error(`${label} was canceled`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`${label} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 60000} minutes`);
}

// ---------------------------------------------------------------------------
// Download model from completed task
// ---------------------------------------------------------------------------

async function downloadModel(task, outDir, fileSlug) {
  const modelUrls = task.model_urls || task.result || {};
  const glbUrl = modelUrls.glb || modelUrls.rigged_character_glb_url || modelUrls.animation_glb_url;

  if (!glbUrl) {
    console.log('  [meshy] No GLB URL in task result. Available URLs:');
    console.log(JSON.stringify(modelUrls, null, 2));
    return null;
  }

  const dest = join(outDir, `${fileSlug}.glb`);
  console.log(`  [meshy] Downloading GLB...`);
  const size = await downloadFile(glbUrl, dest);
  console.log(`  model → ${dest} (${formatBytes(size)})`);
  return dest;
}

// ---------------------------------------------------------------------------
// Text to 3D
// ---------------------------------------------------------------------------

async function textTo3D() {
  if (!prompt) {
    console.error('Error: --prompt is required for text-to-3d mode');
    process.exit(1);
  }

  const fileSlug = slug || slugify(prompt);
  const outDir = resolve(outputDir);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n=== Meshy Text-to-3D: "${prompt}" ===\n`);

  // Step 1: Create preview task
  console.log('  [meshy] Creating preview task...');
  const previewPayload = {
    mode: 'preview',
    prompt,
    ai_model: aiModel,
    topology,
    target_polycount: targetPolycount,
  };

  const previewResult = await apiPost('/v2/text-to-3d', previewPayload);
  const previewId = previewResult.result;
  console.log(`  [meshy] Preview task: ${previewId}`);

  if (noPoll) {
    console.log(`\n  Task submitted. Check status with:`);
    console.log(`  node scripts/meshy-generate.mjs --mode status --task-id ${previewId} --task-type text-to-3d`);
    return;
  }

  // Step 2: Poll preview
  const previewTask = await pollTask(`/v2/text-to-3d/${previewId}`, 'Preview');

  if (previewOnly) {
    const modelPath = await downloadModel(previewTask, outDir, fileSlug);
    writeMeta(join(outDir, `${fileSlug}.meta.json`), {
      slug: fileSlug,
      source: 'meshy-ai',
      mode: 'text-to-3d-preview',
      prompt,
      aiModel,
      previewTaskId: previewId,
      status: 'preview-only',
      modelPath: modelPath ? basename(modelPath) : null,
      thumbnail: previewTask.thumbnail_url || null,
      createdAt: new Date().toISOString(),
    });
    console.log(`\n=== Done (preview only): ${modelPath || 'no GLB'} ===\n`);
    return;
  }

  // Step 3: Create refine task
  console.log('\n  [meshy] Creating refine task...');
  const refinePayload = {
    mode: 'refine',
    preview_task_id: previewId,
    enable_pbr: enablePbr,
  };
  if (texturePrompt) refinePayload.texture_prompt = texturePrompt;

  const refineResult = await apiPost('/v2/text-to-3d', refinePayload);
  const refineId = refineResult.result;
  console.log(`  [meshy] Refine task: ${refineId}`);

  // Step 4: Poll refine
  const refineTask = await pollTask(`/v2/text-to-3d/${refineId}`, 'Refine');

  // Step 5: Download
  const modelPath = await downloadModel(refineTask, outDir, fileSlug);

  writeMeta(join(outDir, `${fileSlug}.meta.json`), {
    slug: fileSlug,
    source: 'meshy-ai',
    mode: 'text-to-3d',
    prompt,
    aiModel,
    previewTaskId: previewId,
    refineTaskId: refineId,
    enablePbr,
    topology,
    targetPolycount,
    modelUrls: refineTask.model_urls || {},
    textureUrls: refineTask.texture_urls || [],
    thumbnail: refineTask.thumbnail_url || null,
    modelPath: modelPath ? basename(modelPath) : null,
    createdAt: new Date().toISOString(),
  });

  console.log(`\n=== Done: ${modelPath || 'no GLB'} ===\n`);
}

// ---------------------------------------------------------------------------
// Image to 3D
// ---------------------------------------------------------------------------

async function imageTo3D() {
  if (!imageUrl) {
    console.error('Error: --image is required for image-to-3d mode');
    process.exit(1);
  }

  const fileSlug = slug || 'image-to-3d';
  const outDir = resolve(outputDir);
  mkdirSync(outDir, { recursive: true });

  // Handle local file paths — convert to base64 data URI
  let resolvedImageUrl = imageUrl;
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    const imagePath = resolve(imageUrl);
    if (!existsSync(imagePath)) {
      console.error(`Error: Image file not found: ${imagePath}`);
      process.exit(1);
    }
    const ext = imagePath.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const base64 = readFileSync(imagePath).toString('base64');
    resolvedImageUrl = `data:${mime};base64,${base64}`;
    console.log(`  [meshy] Converted local image to base64 data URI`);
  }

  console.log(`\n=== Meshy Image-to-3D ===\n`);

  console.log('  [meshy] Creating image-to-3d task...');
  const payload = {
    image_url: resolvedImageUrl,
    ai_model: aiModel,
    topology,
    target_polycount: targetPolycount,
    enable_pbr: enablePbr,
    should_texture: true,
  };

  const result = await apiPost('/v1/image-to-3d', payload);
  const taskIdResult = result.result;
  console.log(`  [meshy] Task: ${taskIdResult}`);

  if (noPoll) {
    console.log(`\n  Task submitted. Check status with:`);
    console.log(`  node scripts/meshy-generate.mjs --mode status --task-id ${taskIdResult} --task-type image-to-3d`);
    return;
  }

  const task = await pollTask(`/v1/image-to-3d/${taskIdResult}`, 'Image-to-3D');
  const modelPath = await downloadModel(task, outDir, fileSlug);

  writeMeta(join(outDir, `${fileSlug}.meta.json`), {
    slug: fileSlug,
    source: 'meshy-ai',
    mode: 'image-to-3d',
    imageUrl: imageUrl.startsWith('data:') ? '(base64)' : imageUrl,
    aiModel,
    taskId: taskIdResult,
    enablePbr,
    topology,
    targetPolycount,
    modelUrls: task.model_urls || {},
    textureUrls: task.texture_urls || [],
    thumbnail: task.thumbnail_url || null,
    modelPath: modelPath ? basename(modelPath) : null,
    createdAt: new Date().toISOString(),
  });

  console.log(`\n=== Done: ${modelPath || 'no GLB'} ===\n`);
}

// ---------------------------------------------------------------------------
// Rig
// ---------------------------------------------------------------------------

async function rigModel() {
  if (!taskId) {
    console.error('Error: --task-id is required for rig mode (Meshy task ID or model URL via --image)');
    process.exit(1);
  }

  const fileSlug = slug || 'rigged';
  const outDir = resolve(outputDir);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n=== Meshy Auto-Rig ===\n`);

  console.log('  [meshy] Creating rigging task...');
  const payload = {
    input_task_id: taskId,
    height_meters: heightMeters,
  };

  const result = await apiPost('/v1/rigging', payload);
  const rigTaskId = result.result;
  console.log(`  [meshy] Rig task: ${rigTaskId}`);

  if (noPoll) {
    console.log(`\n  Task submitted. Check status with:`);
    console.log(`  node scripts/meshy-generate.mjs --mode status --task-id ${rigTaskId} --task-type rigging`);
    return;
  }

  const task = await pollTask(`/v1/rigging/${rigTaskId}`, 'Rigging');

  // Download rigged GLB
  const rigResult = task.result || {};
  const glbUrl = rigResult.rigged_character_glb_url;
  let modelPath = null;

  if (glbUrl) {
    const dest = join(outDir, `${fileSlug}.glb`);
    console.log(`  [meshy] Downloading rigged GLB...`);
    const size = await downloadFile(glbUrl, dest);
    console.log(`  model → ${dest} (${formatBytes(size)})`);
    modelPath = dest;
  }

  // Also note basic animations that come with rigging
  const basicAnims = rigResult.basic_animations || {};

  writeMeta(join(outDir, `${fileSlug}.meta.json`), {
    slug: fileSlug,
    source: 'meshy-ai',
    mode: 'rigging',
    inputTaskId: taskId,
    rigTaskId,
    heightMeters,
    result: rigResult,
    basicAnimations: basicAnims,
    modelPath: modelPath ? basename(modelPath) : null,
    createdAt: new Date().toISOString(),
  });

  if (Object.keys(basicAnims).length > 0) {
    console.log(`\n  Basic animations included:`);
    for (const [name, url] of Object.entries(basicAnims)) {
      console.log(`    ${name}: ${url}`);
    }
  }

  console.log(`\n=== Done: ${modelPath || 'no GLB'} ===\n`);
  console.log(`  To animate, run:`);
  console.log(`  node scripts/meshy-generate.mjs --mode animate --task-id ${rigTaskId} --action-id <id> --slug ${fileSlug}-anim`);
}

// ---------------------------------------------------------------------------
// Animate
// ---------------------------------------------------------------------------

async function animateModel() {
  if (!taskId) {
    console.error('Error: --task-id is required (rig task ID)');
    process.exit(1);
  }
  if (!actionId) {
    console.error('Error: --action-id is required (animation ID number)');
    process.exit(1);
  }

  const fileSlug = slug || 'animated';
  const outDir = resolve(outputDir);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n=== Meshy Animate ===\n`);

  console.log(`  [meshy] Creating animation task (action ${actionId})...`);
  const payload = {
    rig_task_id: taskId,
    action_id: actionId,
  };

  const result = await apiPost('/v1/animations', payload);
  const animTaskId = result.result;
  console.log(`  [meshy] Animation task: ${animTaskId}`);

  if (noPoll) {
    console.log(`\n  Task submitted. Check status with:`);
    console.log(`  node scripts/meshy-generate.mjs --mode status --task-id ${animTaskId} --task-type animations`);
    return;
  }

  const task = await pollTask(`/v1/animations/${animTaskId}`, 'Animation');

  const animResult = task.result || {};
  const glbUrl = animResult.animation_glb_url;
  let modelPath = null;

  if (glbUrl) {
    const dest = join(outDir, `${fileSlug}.glb`);
    console.log(`  [meshy] Downloading animated GLB...`);
    const size = await downloadFile(glbUrl, dest);
    console.log(`  model → ${dest} (${formatBytes(size)})`);
    modelPath = dest;
  }

  writeMeta(join(outDir, `${fileSlug}.meta.json`), {
    slug: fileSlug,
    source: 'meshy-ai',
    mode: 'animation',
    rigTaskId: taskId,
    animTaskId,
    actionId,
    result: animResult,
    modelPath: modelPath ? basename(modelPath) : null,
    createdAt: new Date().toISOString(),
  });

  console.log(`\n=== Done: ${modelPath || 'no GLB'} ===\n`);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

async function checkStatus() {
  if (!taskId) {
    console.error('Error: --task-id is required');
    process.exit(1);
  }

  const pathMap = {
    'text-to-3d': `/v2/text-to-3d/${taskId}`,
    'image-to-3d': `/v1/image-to-3d/${taskId}`,
    'rigging': `/v1/rigging/${taskId}`,
    'animations': `/v1/animations/${taskId}`,
  };

  const path = pathMap[taskType];
  if (!path) {
    console.error(`Error: Unknown task type "${taskType}". Use: text-to-3d, image-to-3d, rigging, animations`);
    process.exit(1);
  }

  console.log(`\n=== Meshy Task Status ===\n`);
  const task = await apiGet(path);

  console.log(`  ID:       ${task.id}`);
  console.log(`  Status:   ${task.status}`);
  console.log(`  Progress: ${task.progress}%`);

  if (task.model_urls) {
    console.log(`  Model URLs:`);
    for (const [fmt, url] of Object.entries(task.model_urls)) {
      if (url) console.log(`    ${fmt}: ${url}`);
    }
  }

  if (task.result) {
    console.log(`  Result:`);
    for (const [key, val] of Object.entries(task.result)) {
      if (val && typeof val === 'string') console.log(`    ${key}: ${val}`);
    }
  }

  if (task.thumbnail_url) console.log(`  Thumbnail: ${task.thumbnail_url}`);
  if (task.task_error) console.log(`  Error: ${JSON.stringify(task.task_error)}`);

  console.log();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  requireApiKey();
  switch (mode) {
    case 'text-to-3d':
      return textTo3D();
    case 'image-to-3d':
      return imageTo3D();
    case 'rig':
      return rigModel();
    case 'animate':
      return animateModel();
    case 'status':
      return checkStatus();
    default:
      console.error(`Unknown mode: "${mode}". Use: text-to-3d, image-to-3d, rig, animate, status`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});
