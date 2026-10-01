import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const roles = readJson('characters/roles.json').roles.map((x) => x.id);
const states = readJson('characters/states.json').states.map((x) => x.id);
const generatedRoot = path.join(root, 'characters', 'generated');

test('composition engine generates the full role/state matrix and standalone sources', () => {
  execFileSync(process.execPath, ['scripts/compose-characters.mjs'], {cwd: root, stdio: 'pipe'});
  const manifest = readJson('characters/generated/manifest.json');
  assert.equal(manifest.compositions.length, roles.length * states.length);
  assert.equal(manifest.roles.length, roles.length);
  assert.equal(manifest.states.length, states.length);
  assert.equal(manifest.avatars.length, roles.length);
  for (const role of roles) assert.ok(fs.existsSync(path.join(generatedRoot, 'roles', `${role}.svg`)));
  for (const state of states) assert.ok(fs.existsSync(path.join(generatedRoot, 'states', `${state}.svg`)));
  for (const role of roles) for (const state of states) {
    assert.ok(fs.existsSync(path.join(generatedRoot, 'compositions', `${role}--${state}.svg`)));
  }
});

test('generated compositions are self-contained native vectors with role and state provenance', () => {
  for (const role of roles) for (const state of states) {
    const svg = fs.readFileSync(path.join(generatedRoot, 'compositions', `${role}--${state}.svg`), 'utf8');
    assert.match(svg, /viewBox="0 0 512 512"/);
    assert.match(svg, /data-generated="aftergraph-character-composition-v1"/);
    assert.match(svg, new RegExp(`data-role="${role}"`));
    assert.match(svg, new RegExp(`data-state="${state}"`));
    assert.doesNotMatch(svg, /<image\b/i);
    assert.doesNotMatch(svg, /(?:href|xlink:href)="(?:https?:|\.\.\/|\/)/i);
  }
});

test('role avatars derive from the same head anatomy instead of a separate drawing', () => {
  for (const role of roles) {
    const svg = fs.readFileSync(path.join(generatedRoot, 'avatars', `${role}.svg`), 'utf8');
    assert.match(svg, /viewBox="96 36 320 280"/);
    assert.match(svg, /id="halo"/);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="face"/);
    assert.doesNotMatch(svg, /id="torso"/);
    assert.doesNotMatch(svg, /<image\b/i);
  }
});

test('generated outputs are deterministic and reject manual drift', () => {
  execFileSync(process.execPath, ['scripts/compose-characters.mjs', '--check'], {cwd: root, stdio: 'pipe'});
});

test('composition engine resolves prop-slot collisions without moving state semantics off their canonical anchor', () => {
  const builderThinking = fs.readFileSync(path.join(generatedRoot, 'compositions', 'builder--thinking.svg'), 'utf8');
  assert.match(builderThinking, /id="role-prop"[^>]*data-source-anchor="prop-right"[^>]*data-resolved-anchor="prop-left"[^>]*transform="translate\(-308 0\)"/);
  assert.match(builderThinking, /id="state-prop"[^>]*data-anchor-ref="prop-right"/);

  const guideThinking = fs.readFileSync(path.join(generatedRoot, 'compositions', 'guide--thinking.svg'), 'utf8');
  assert.match(guideThinking, /id="role-prop"[^>]*data-source-anchor="prop-left"[^>]*data-resolved-anchor="prop-left"/);
  assert.doesNotMatch(guideThinking, /id="role-prop"[^>]*transform=/);
});
