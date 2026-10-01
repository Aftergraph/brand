import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const roles = JSON.parse(read('characters/roles.json')).roles.map((x) => x.id);
const states = JSON.parse(read('characters/states.json')).states.map((x) => x.id);

test('human review surface covers every role, state, theme, and composition', () => {
  execFileSync(process.execPath, ['scripts/generate-character-review.mjs'], {cwd: root, stdio: 'pipe'});
  const html = read('characters/review/index.html');
  assert.match(html, /Aftergraph Character System Review/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /data-theme="light"/);
  for (const role of roles) assert.ok(html.includes(`data-role="${role}"`), role);
  for (const state of states) assert.ok(html.includes(`data-state="${state}"`), state);
  assert.equal((html.match(/class="composition-card"/g) || []).length, roles.length * states.length * 2);
});

test('review surface eagerly loads every SVG so full-page visual inspection is complete', () => {
  const html = read('characters/review/index.html');
  assert.doesNotMatch(html, /loading="lazy"/);
});

test('review surface is part of deterministic generation and external preflight is an explicit command', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.generate, /generate-character-review\.mjs/);
  assert.equal(pkg.scripts['character:review:generate'], 'node scripts/generate-character-review.mjs');
  assert.match(pkg.scripts['character:authoring:preflight'], /prepare-character-authoring-evidence\.mjs/);
});

test('review surface includes avatars, supporting icons, and only existing local asset paths', () => {
  const html = read('characters/review/index.html');
  assert.equal((html.match(/class="avatar-card"/g) || []).length, roles.length * 2);
  assert.equal((html.match(/class="icon-card"/g) || []).length, 11);
  const srcs = [...html.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length > 0);
  for (const src of srcs) {
    const abs = path.resolve(root, 'characters/review', src);
    assert.ok(fs.existsSync(abs), src);
  }
});

test('review capture command is explicit and uses the governed browser QA runtime', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['character:review:capture'], 'node characters/ci/capture-review.mjs');
  const source = read('characters/ci/capture-review.mjs');
  assert.match(source, /launchBrowser/);
  assert.match(source, /review-dark\.png/);
  assert.match(source, /review-light\.png/);
});
