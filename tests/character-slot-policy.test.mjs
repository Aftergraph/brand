import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

test('prop-slot policy is explicit, anchor-backed, and state-priority', () => {
  const slots = readJson('characters/source/rig/slots.json');
  const anchors = readJson('characters/source/master/anchors.json').anchors;
  const anchorMap = new Map(anchors.map((a) => [a.id, a]));
  assert.equal(slots.collisionPolicy.priority, 'state');
  assert.equal(slots.collisionPolicy.roleFallback['prop-right'], 'prop-left');
  for (const [id, slot] of Object.entries(slots.slots)) {
    const anchor = anchorMap.get(id);
    assert.ok(anchor, id);
    assert.deepEqual({x: slot.x, y: slot.y}, {x: anchor.x, y: anchor.y});
  }
});

test('only declared role fallback rules may relocate a colliding role prop', () => {
  const slots = readJson('characters/source/rig/slots.json');
  assert.deepEqual(Object.keys(slots.collisionPolicy.roleFallback).sort(), ['prop-right']);
});
