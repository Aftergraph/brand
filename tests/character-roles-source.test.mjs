import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const svg = fs.readFileSync('characters/source/roles/roles.svg', 'utf8');
const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
const anchors = JSON.parse(fs.readFileSync('characters/source/master/anchors.json', 'utf8'));
const anchorIds = new Set(anchors.anchors.map((anchor) => anchor.id));

const expected = [
  ['entity', 'evidence_white', '#F5F7FA'],
  ['guide', 'control_cyan', '#42C7E8'],
  ['builder', 'decision_amber', '#F0A64A'],
  ['verifier', 'evidence_teal', '#24C4AD'],
  ['observer', 'system_blue', '#4C8BD8'],
  ['researcher', 'authority_violet', '#7759E8'],
];

test('roles source exposes exactly six governed prop symbols', () => {
  assert.equal((svg.match(/<symbol\b/g) || []).length, 6);
  for (const [role, token, hex] of expected) {
    const symbol = new RegExp(`<symbol[^>]+id="ag-role-${role}-prop"[^>]+data-accent-token="${token}"[^>]+data-accent="${hex}"`);
    assert.match(svg, symbol, role);
    assert.equal(tokens.colors[token], hex, `${role} must use Brand OS ${token}`);
  }
});

test('every role prop references a locked anatomy anchor', () => {
  const refs = [...svg.matchAll(/data-anchor-ref="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(refs.length, 6);
  for (const ref of refs) assert.ok(anchorIds.has(ref), `unknown role anchor ${ref}`);
});

test('role modules are native vector only', () => {
  assert.doesNotMatch(svg, /<image\b/i);
  assert.doesNotMatch(svg, /data:image\//i);
});
