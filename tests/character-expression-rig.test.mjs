import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const readJson = (p) => JSON.parse(read(p));
const stateIds = readJson('characters/states.json').states.map((s)=>s.id);
const anchors = new Set(readJson('characters/source/master/anchors.json').anchors.map((a)=>a.id));

test('expression source exposes a stable operational expression vocabulary', () => {
  const source = read('characters/source/expressions/expressions.svg');
  const registry = readJson('characters/source/expressions/expressions.json');
  assert.deepEqual(registry.expressions.map((x)=>x.id), ['neutral','focus-left','focus-right','blink','attentive','narrowed']);
  assert.deepEqual(Object.keys(registry.stateDefaults).sort(), [...stateIds].sort());
  for (const expression of registry.expressions) {
    assert.ok(source.includes(`id="ag-expression-${expression.id}"`));
    assert.ok(source.includes(`data-expression="${expression.id}"`));
  }
  assert.doesNotMatch(source, /<image\b/i);
});

test('rig contract references only locked anchors and valid named anatomy groups', () => {
  const rig = readJson('characters/source/rig/rig.json');
  const base = read('characters/source/master/base-character.svg');
  const jointIds = new Set(rig.joints.map((j)=>j.id));
  for (const joint of rig.joints) {
    assert.ok(anchors.has(joint.anchor), `unknown anchor ${joint.anchor}`);
    if (joint.parent) assert.ok(jointIds.has(joint.parent), `unknown parent joint ${joint.parent}`);
    assert.ok(joint.rotationDeg.min <= joint.rotationDeg.rest && joint.rotationDeg.rest <= joint.rotationDeg.max);
    for (const group of joint.groups) assert.ok(base.includes(`id="${group}"`), `missing anatomy group ${group}`);
  }
});

test('all authored state arm rotations stay inside rig limits', () => {
  const source = read('characters/source/states/states.svg');
  const rig = readJson('characters/source/rig/rig.json');
  const byId = new Map(rig.joints.map((j)=>[j.id,j]));
  for (const match of source.matchAll(/<symbol id="ag-state-[^"]+"([^>]*)>/g)) {
    const attrs = match[1];
    for (const [attr,jointId] of [['data-arm-left-angle','shoulder-left'],['data-arm-right-angle','shoulder-right']]) {
      const m = attrs.match(new RegExp(`${attr}="(-?\\d+(?:\\.\\d+)?)"`));
      if (!m) continue;
      const angle = Number(m[1]);
      const limit = byId.get(jointId).rotationDeg;
      assert.ok(angle >= limit.min && angle <= limit.max, `${attr}=${angle} exceeds ${jointId}`);
    }
  }
});

test('composition engine resolves expression from state without duplicating a second face system', () => {
  execFileSync(process.execPath,['scripts/compose-characters.mjs'],{cwd:root,stdio:'pipe'});
  const registry = readJson('characters/source/expressions/expressions.json');
  for (const [state, expression] of Object.entries(registry.stateDefaults)) {
    const svg = read(`characters/generated/compositions/guide--${state}.svg`);
    assert.match(svg,new RegExp(`data-expression="${expression}"`));
    assert.equal((svg.match(/id="face"/g)||[]).length,1);
  }
});
