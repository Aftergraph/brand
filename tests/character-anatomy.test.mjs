import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const svgPath = 'characters/source/master/base-character.svg';
const anchorsPath = 'characters/source/master/anchors.json';
const svg = fs.readFileSync(svgPath, 'utf8');
const anchors = JSON.parse(fs.readFileSync(anchorsPath, 'utf8'));

const requiredLayers = [
  'halo', 'head', 'face', 'torso',
  'arm-left', 'arm-right', 'hand-left', 'hand-right',
  'leg-left', 'leg-right', 'shading',
];

test('base anatomy uses the canonical 512x512 canvas and named editable layers', () => {
  assert.match(svg, /viewBox="0 0 512 512"/);
  for (const id of requiredLayers) assert.match(svg, new RegExp(`<g id="${id}"(?:\\s|>)`));
  assert.match(svg, /<linearGradient id="metal-highlight"/);
  assert.match(svg, /<radialGradient id="visor-glow"/);
  assert.doesNotMatch(svg, /<image\b/i);
});

test('anatomy colors stay within canonical Brand OS palette', () => {
  const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
  const allowed = new Set([...Object.values(tokens.colors), tokens.semantic.dark.danger].map((value) => value.toUpperCase()));
  for (const hex of svg.match(/#[0-9A-Fa-f]{6}/g) || []) {
    assert.ok(allowed.has(hex.toUpperCase()), `non-canonical anatomy color ${hex}`);
  }
});

test('anchors are unique, bounded, and form a valid parent graph', () => {
  assert.deepEqual(anchors.viewBox, { x: 0, y: 0, width: 512, height: 512 });
  const byId = new Map();
  for (const anchor of anchors.anchors) {
    assert.equal(byId.has(anchor.id), false, `duplicate anchor ${anchor.id}`);
    assert.ok(Number.isFinite(anchor.x) && anchor.x >= 0 && anchor.x <= 512, `x out of bounds: ${anchor.id}`);
    assert.ok(Number.isFinite(anchor.y) && anchor.y >= 0 && anchor.y <= 512, `y out of bounds: ${anchor.id}`);
    byId.set(anchor.id, anchor);
  }
  assert.equal(byId.get('root').parentJoint, null);
  for (const anchor of anchors.anchors) {
    if (anchor.parentJoint !== null) assert.ok(byId.has(anchor.parentJoint), `missing parent ${anchor.parentJoint} for ${anchor.id}`);
  }
});

test('rig-critical pivots are locked to the anatomy coordinates', () => {
  const byId = new Map(anchors.anchors.map((anchor) => [anchor.id, anchor]));
  const locked = {
    'head-center': [256, 190],
    'shoulder-left': [192, 280], 'elbow-left': [160, 314], 'wrist-left': [146, 349],
    'shoulder-right': [320, 280], 'elbow-right': [352, 314], 'wrist-right': [366, 349],
    'hip-left': [214, 352], 'knee-left': [190, 401], 'ankle-left': [169, 449],
    'hip-right': [298, 352], 'knee-right': [322, 401], 'ankle-right': [343, 449],
  };
  for (const [id, [x, y]] of Object.entries(locked)) assert.deepEqual([byId.get(id).x, byId.get(id).y], [x, y], id);
});
