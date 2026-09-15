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
    assert.match(luau, new RegExp(`\\["${role}:${state}"\\]\\s*=`), `${role}:${state} missing`);
  }
  assert.doesNotMatch(luau, /<image\b|\.png\b|\.webp\b/i);
});

test('Rive runtime dispatch narrows the selected composition before calling it', () => {
  const luau = read('characters/motion/rive/actor-presence.luau');
  assert.match(luau, /local COMPOSITIONS: \{\[string\]: \(Renderer\) -> \(\)\} = \{/);
  assert.match(luau, /if fn ~= nil then\s+fn\(renderer\)\s+end/);
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
