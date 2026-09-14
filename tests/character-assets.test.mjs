import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const roles = readJson('characters/roles.json');
const states = readJson('characters/states.json');
const manifest = readJson('characters/manifest.json');
const tokens = readJson('tokens.json');
const canonicalHex = new Set([...Object.values(tokens.colors), tokens.semantic.dark.danger].map((x) => x.toUpperCase()));

test('character roles stay generic and governance-safe', () => {
  assert.deepEqual(roles.roles.map((x) => x.id), ['entity','guide','builder','verifier','observer','researcher']);
  assert.ok(roles.roles.every((x) => x.accentToken && !x.accentToken.startsWith('#')));
  assert.equal(JSON.stringify(roles).toLowerCase().includes('sentinel'), false);
});

test('character states do not conflate completion with verification', () => {
  const ids = states.states.map((x) => x.id);
  assert.deepEqual(ids, ['idle','thinking','planning','executing','inspecting','waiting','blocked','approval-required','verifying','completed','failed']);
  assert.equal(ids.includes('succeeded'), false);
  assert.match(states.states.find((x) => x.id === 'completed').meaning, /does not imply independent verification/i);
});

test('character sprite is native, bounded SVG with every registered symbol', () => {
  assert.equal(manifest.status, 'candidate-vector');
  assert.equal(manifest.sourceClass, 'native-svg');
  assert.equal(manifest.assets.length, 23);
  assert.equal(manifest.sprite, 'characters/character-sprite.svg');
  assert.ok(fs.existsSync(manifest.sprite));
  const svg = fs.readFileSync(manifest.sprite, 'utf8');
  assert.match(svg, /^<svg\b/);
  assert.match(svg, /aria-hidden="true"/);
  assert.doesNotMatch(svg, /<image\b/i);
  assert.equal((svg.match(/<symbol\b/g) || []).length, 23);
  for (const asset of manifest.assets) {
    assert.match(asset.symbol, /^ag-(role|avatar|state)-/);
    assert.match(svg, new RegExp(`id="${asset.symbol}"`));
  }
  for (const hex of svg.match(/#[0-9A-Fa-f]{6}/g) || []) assert.ok(canonicalHex.has(hex.toUpperCase()), `sprite uses non-canonical ${hex}`);
});

test('character semantic bindings reuse canonical Brand OS symbols', () => {
  for (const file of Object.values(manifest.semanticIconBindings)) {
    assert.ok(file.startsWith('semantics/icons/'));
    assert.ok(fs.existsSync(file), `missing canonical semantic icon ${file}`);
  }
});

test('character generator derives palette from canonical Brand OS tokens', () => {
  const source = fs.readFileSync('scripts/generate-characters.mjs', 'utf8');
  assert.match(source, /tokens\.json/);
  assert.doesNotMatch(source, /#[0-9A-Fa-f]{6}/);
});
