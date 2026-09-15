import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=(p)=>JSON.parse(read(p));

test('Rive import manifest maps canonical SVG anatomy, rig, roles, states, and expressions without claiming a .riv artifact exists',()=>{
  const m=readJson('characters/motion/rive-import-manifest.json');
  assert.equal(m.canonicalSource,'characters/source/master/base-character.svg');
  assert.deepEqual(m.artboard,{name:'ActorPresence',width:512,height:512});
  assert.equal(m.runtimeFile.status,'not-authored');
  assert.equal(m.runtimeFile.path,null);
  for(const id of ['halo','head','face','torso','arm-left','arm-right','hand-left','hand-right','leg-left','leg-right','shading']) assert.ok(m.layerMap.includes(id));
  assert.equal(m.inputs.role.type,'enum');
  assert.equal(m.inputs.state.type,'enum');
  assert.equal(m.inputs.reducedMotion.type,'boolean');
  assert.ok(m.sources.includes('characters/source/rig/rig.json'));
  assert.ok(m.sources.includes('characters/source/expressions/expressions.svg'));
});

test('Rive authoring contract keeps SVG source-of-truth separate from editor-authored runtime binary',()=>{
  const doc=read('characters/motion/RIVE-AUTHORING.md');
  assert.match(doc,/SVG.*source of truth/is);
  assert.match(doc,/converted into native Rive vector objects/is);
  assert.match(doc,/\.riv.*binary runtime format/is);
  assert.match(doc,/Rive Editor.*export/is);
  assert.match(doc,/do not.*generate.*\.riv.*runtime/is);
});
