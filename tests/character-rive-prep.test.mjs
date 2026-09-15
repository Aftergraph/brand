import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=(p)=>JSON.parse(read(p));
const sha256=(p)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');

test('Rive runtime manifest points at a real CLI-authored deterministic runtime asset',()=>{
  const m=readJson('characters/motion/rive-import-manifest.json');
  assert.equal(m.canonicalSource,'characters/source/master/base-character.svg');
  assert.deepEqual(m.artboard,{name:'ActorPresence',width:512,height:512});
  assert.equal(m.runtimeFile.status,'verified');
  assert.equal(m.runtimeFile.authoringMode,'rive-cli-rml-luau');
  assert.equal(m.runtimeFile.path,'characters/motion/rive/build/aftergraph_actor_presence.riv');
  assert.ok(fs.existsSync(path.join(root,m.runtimeFile.path)));
  for(const id of ['halo','head','face','torso','arm-left','arm-right','hand-left','hand-right','leg-left','leg-right','shading']) assert.ok(m.layerMap.includes(id));
  assert.equal(m.inputs.role.type,'enum');
  assert.equal(m.inputs.state.type,'enum');
  assert.equal(m.inputs.reducedMotion.type,'boolean');
});

test('tracked Rive runtime manifest cryptographically binds binary to generated sources',()=>{
  const runtime=readJson('characters/motion/rive/runtime-manifest.json');
  assert.equal(runtime.artifact.path,'characters/motion/rive/build/aftergraph_actor_presence.riv');
  assert.equal(runtime.artifact.sha256,sha256(runtime.artifact.path));
  assert.equal(runtime.sources.sourceManifest.sha256,sha256(runtime.sources.sourceManifest.path));
  assert.equal(runtime.sources.scene.sha256,sha256(runtime.sources.scene.path));
  assert.equal(runtime.sources.script.sha256,sha256(runtime.sources.script.path));
  assert.match(runtime.riveCliVersion,/^rive /);
});

test('Rive authoring contract documents CLI authoring without moving the source-of-truth boundary',()=>{
  const doc=read('characters/motion/RIVE-AUTHORING.md');
  assert.match(doc,/SVG.*source of truth/is);
  assert.match(doc,/Rive CLI/is);
  assert.match(doc,/RML.*Luau/is);
  assert.match(doc,/--once/);
  assert.match(doc,/\.riv.*derived runtime artifact/is);
  assert.doesNotMatch(doc,/not-authored/);
});
