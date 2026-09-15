import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));

test('canonical generate pipeline regenerates Rive source for drift detection', () => {
  const pkg = readJson('package.json');
  assert.match(pkg.scripts.generate, /generate-character-rive\.mjs/);
});

test('Rive CLI project is generated from canonical character contracts', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.scripts['character:rive:generate'], 'node scripts/generate-character-rive.mjs');
  assert.equal(pkg.scripts['character:rive:verify'], 'node scripts/verify-character-rive.mjs');
  assert.equal(pkg.scripts['character:rive:build'], 'node scripts/build-character-rive.mjs');
  assert.equal(pkg.scripts['character:rive:qa'], 'node scripts/verify-character-rive-runtime.mjs');

  for (const rel of [
    'characters/motion/rive/rive.yaml',
    'characters/motion/rive/scene.rml',
    'characters/motion/rive/actor-presence.luau',
    'characters/motion/rive/source-manifest.json',
  ]) assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);

  const scene = read('characters/motion/rive/scene.rml');
  assert.match(scene, /name="ActorPresence"/);
  assert.match(scene, /width="512" height="512"/);
  assert.match(scene, /ViewModelPropertyEnumCustom[^>]*name="role"/);
  assert.match(scene, /ViewModelPropertyEnumCustom[^>]*name="state"/);
  assert.match(scene, /ViewModelPropertyEnumCustom[^>]*name="attention"/);
  assert.match(scene, /ViewModelPropertyBoolean[^>]*name="reducedMotion"/);
  assert.match(scene, /<AnyState x="200" y="-120"\/>/);
  assert.match(scene, /<ExitState x="400" y="-120"\/>/);
  assert.match(scene, /<EntryState x="0" y="0"\/>/);
});
import os from 'node:os';
import {execFileSync} from 'node:child_process';

test('Rive verifier accepts a clean CLI problems summary instead of treating it as an error', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aftergraph-rive-test-'));
  const fake = path.join(tmp, 'rive');
  fs.writeFileSync(fake, `#!/bin/sh\nif [ "$1" = "--version" ]; then echo 'rive 1.0.3'; exit 0; fi\nif [ "$1" = "inspect" ]; then echo '{"problems":[]}'; exit 0; fi\nmkdir -p "$1/build"\necho '# rive generation 1 | 0 errors, 0 warnings | OK' > "$1/build/problems.log"\necho '{"success":true}'\n`);
  fs.chmodSync(fake, 0o755);
  assert.doesNotThrow(() => execFileSync(process.execPath, ['scripts/verify-character-rive.mjs'], {
    cwd: root,
    env: {...process.env, RIVE_CLI: fake},
    stdio: 'pipe',
  }));
});

test('Rive runtime source projects every governed role/state composition from the canonical generated vectors', () => {
  const roles = readJson('characters/roles.json').roles.map((x) => x.id);
  const states = readJson('characters/states.json').states.map((x) => x.id);
  const luau = read('characters/motion/rive/actor-presence.luau');
  assert.match(luau, /getEnum\('role'\)/);
  assert.match(luau, /getEnum\('state'\)/);
  assert.match(luau, /getBoolean\('reducedMotion'\)/);
  for (const role of roles) for (const state of states) {
    assert.match(luau, new RegExp(`role == '${role}' and state == '${state}'`), `${role}:${state} missing`);
  }
  assert.doesNotMatch(luau, /<image\b|\.png\b|\.webp\b/i);
});

test('Rive runtime dispatch calls the selected projection directly', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  assert.match(luau, /local function drawProjection\(renderer: Renderer, role: string, state: string\): boolean/);
  assert.match(luau, /local projected = drawProjection\(renderer, role, state\)/);
  assert.match(luau, /if not projected then\s+drawComposition1\(renderer\)\s+end/);
});


test('Rive verifier rejects resolved-scene inspect problems', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aftergraph-rive-problem-test-'));
  const fake = path.join(tmp, 'rive');
  fs.writeFileSync(fake, `#!/bin/sh
if [ "$1" = "--version" ]; then echo 'rive 1.0.3'; exit 0; fi
if [ "$1" = "inspect" ]; then echo '{"problems":[{"severity":"warning","kind":"states-overlap"}]}'; exit 0; fi
mkdir -p "$1/build"
echo '# rive generation 1 | 0 errors, 0 warnings | OK' > "$1/build/problems.log"
echo '{"success":true}'
`);
  fs.chmodSync(fake, 0o755);
  assert.throws(() => execFileSync(process.execPath, ['scripts/verify-character-rive.mjs'], {
    cwd: root,
    env: {...process.env, RIVE_CLI: fake},
    stdio: 'pipe',
  }), /Rive resolved scene reported 1 problem/);
});

test('Rive runtime projects governed motion and bypasses it under reduced motion', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  assert.match(luau, /local MOTION_PERIODS: \{\[string\]: number\} = \{/);
  assert.match(luau, /function motionTransform\(state: string, elapsed: number, attention: string\): Mat2D/);
  assert.match(luau, /if not reduced then\s+renderer:transform\(motionTransform\(state, self\.elapsed, attention\)\)/);
  assert.match(luau, /MOTION_PERIODS\[state\]/);
});

test('Rive runtime QA proves active motion changes pixels while reduced motion stays static', () => {
  const qa = read('scripts/verify-character-rive-runtime.mjs');
  assert.match(qa, /from 'pixelmatch'/);
  assert.match(qa, /from 'pngjs'/);
  assert.match(qa, /--advance=400ms/);
  assert.match(qa, /active motion produced too little pixel delta/);
  assert.match(qa, /reduced motion was not static/);
});


test('GitHub CI pins the official Rive CLI and enforces runtime QA', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /RIVE_VERSION:\s*["']?1\.0\.3["']?/);
  assert.match(ci, /releases\.rive\.app\/cli\/install\.sh/);
  assert.match(ci, /rive --version/);
  assert.match(ci, /npm run character:rive:verify/);
  assert.match(ci, /npm run character:rive:qa/);
});


test('Rive motion pixel QA covers every governed runtime state', () => {
  const qa = read('scripts/verify-character-rive-runtime.mjs');
  assert.match(qa, /const motionCases = cases;/);
  assert.match(qa, /motionEvidence\.push/);
});


test('GitHub CI provisions the runtime libraries required by the pinned Rive CLI on hosted Ubuntu', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /node-version:\s*24/);
  assert.match(ci, /apt-get install[^\n]*libegl1[^\n]*libgles2[^\n]*libx11-6[^\n]*libwayland-egl1[^\n]*libxkbcommon0/);
});


test('GitHub CI isolates Rive runtime QA on Ubuntu 26.04 while keeping core verification on the GA runner', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /verify:\n\s+runs-on:\s*ubuntu-latest/);
  assert.match(ci, /rive-runtime:\n\s+runs-on:\s*ubuntu-26\.04/);
  assert.match(ci, /rive-runtime:[\s\S]*npm run character:rive:verify && npm run character:rive:qa/);
  assert.match(ci, /rive-runtime:[\s\S]*git diff --exit-code/);
});


test('Rive headless render validity is based on decoded visible pixels, not PNG byte size', async () => {
  const helper = path.join(root, 'scripts/lib/rive-render-validation.mjs');
  assert.ok(fs.existsSync(helper), 'missing pixel-based Rive render validator');
  const {assertVisiblePng} = await import(`file://${helper}`);
  const {PNG} = await import('pngjs');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aftergraph-rive-png-'));
  const visible = new PNG({width:512, height:512});
  for (let i = 0; i < 64; i++) visible.data[i * 4 + 3] = 255;
  const visiblePath = path.join(tmp, 'visible.png');
  fs.writeFileSync(visiblePath, PNG.sync.write(visible));
  assert.ok(fs.statSync(visiblePath).size < 4096, 'fixture must reproduce small valid PNG');
  assert.doesNotThrow(() => assertVisiblePng(visiblePath, 32));
  const blankPath = path.join(tmp, 'blank.png');
  fs.writeFileSync(blankPath, PNG.sync.write(new PNG({width:512, height:512})));
  assert.throws(() => assertVisiblePng(blankPath, 32), /visible pixels/);
  fs.rmSync(tmp, {recursive:true, force:true});
});


test('reduced-motion runtime invalidates once when bound projection data changes', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  const qa = read('scripts/verify-character-rive-runtime.mjs');
  assert.match(luau, /lastProjectionKey: string\?/);
  assert.match(luau, /local changed = projectionKey ~= self\.lastProjectionKey/);
  assert.match(luau, /self\.lastProjectionKey = projectionKey/);
  assert.match(luau, /return changed or not reduced/);
  assert.match(qa, /--advance=1ms/);
});


test('Rive projection dispatch avoids dynamic function-table lookup', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  assert.match(luau, /local function drawProjection\(renderer: Renderer, role: string, state: string\): boolean/);
  assert.match(luau, /if role == 'entity' and state == 'idle' then drawComposition1\(renderer\); return true end/);
  assert.match(luau, /if role == 'researcher' and state == 'failed' then drawComposition66\(renderer\); return true end/);
  assert.doesNotMatch(luau, /COMPOSITIONS\[role \.\. ':' \.\. state\]/);
});


test('Rive applies scale and motion transforms before drawing the selected projection', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  const drawStart = luau.indexOf('function draw(self: ActorPresence, renderer: Renderer)');
  const drawEnd = luau.indexOf("return function(context: Context): Layout<ActorPresence>", drawStart);
  const draw = luau.slice(drawStart, drawEnd);
  const saveAt = draw.indexOf('renderer:save()');
  const scaleAt = draw.indexOf('renderer:transform(Mat2D.withScale(sx, sy))');
  const motionAt = draw.indexOf('renderer:transform(motionTransform(state, self.elapsed, attention))');
  const projectionAt = draw.indexOf('drawProjection(renderer, role, state)');
  assert.ok(saveAt >= 0 && scaleAt > saveAt && motionAt > scaleAt && projectionAt > motionAt, 'projection must render inside scale/motion transforms');
});
