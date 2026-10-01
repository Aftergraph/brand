import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const svg = fs.readFileSync('characters/source/states/states.svg', 'utf8');
const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
const stateRegistry = JSON.parse(fs.readFileSync('characters/states.json', 'utf8'));
const anchors = JSON.parse(fs.readFileSync('characters/source/master/anchors.json', 'utf8'));
const anchorIds = new Set(anchors.anchors.map((anchor) => anchor.id));

const resolveToken = (token) => {
  if (token.startsWith('semantic.dark.')) return token.split('.').slice(2).reduce((value, key) => value?.[key], tokens.semantic.dark);
  return tokens.colors[token];
};

test('states source exposes exactly the governed eleven state symbols', () => {
  assert.equal((svg.match(/<symbol\b/g) || []).length, 11);
  for (const state of stateRegistry.states) {
    const expectedHex = resolveToken(state.signalToken);
    assert.ok(expectedHex, `unresolved token ${state.signalToken}`);
    const symbol = new RegExp(`<symbol[^>]+id="ag-state-${state.id}-prop"[^>]+data-state="${state.id}"[^>]+data-anchor-ref="([^"]+)"[^>]+data-signal-token="${state.signalToken.replaceAll('.', '\\.')}"[^>]+data-signal="${expectedHex}"[^>]+data-pose="[^"]+"`);
    assert.match(svg, symbol, state.id);
  }
});

test('every state module references a locked anatomy anchor', () => {
  const refs = [...svg.matchAll(/data-anchor-ref="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(refs.length, 11);
  for (const ref of refs) assert.ok(anchorIds.has(ref), `unknown state anchor ${ref}`);
});

test('state source preserves completion versus verification boundary', () => {
  assert.doesNotMatch(svg, /succeeded/i);
  assert.match(svg, /data-state="completed"/);
  assert.match(svg, /data-state="verifying"/);
  assert.doesNotMatch(svg, /data-state="verified"/);
});

test('state modules are native vector only', () => {
  assert.doesNotMatch(svg, /<image\b/i);
  assert.doesNotMatch(svg, /data:image\//i);
});
