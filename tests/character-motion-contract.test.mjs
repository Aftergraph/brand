import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));

test('motion contract covers every state with normal and reduced-motion behavior',()=>{
  const states=readJson('characters/states.json').states.map((x)=>x.id);
  const motion=readJson('characters/motion/motion.json');
  assert.deepEqual(Object.keys(motion.states).sort(),[...states].sort());
  for(const state of states){
    const spec=motion.states[state];
    assert.ok(spec.mode);
    assert.ok(spec.normal);
    assert.ok(spec.reduced);
    assert.equal(spec.reduced.loop,false);
  }
});

test('motion semantics never create verification or approval truth',()=>{
  const motion=readJson('characters/motion/motion.json');
  assert.equal(motion.invariants.motionCanEstablishVerification,false);
  assert.equal(motion.invariants.motionCanEstablishApproval,false);
  assert.equal(motion.invariants.motionCanEstablishEvidence,false);
  assert.equal(motion.states.completed.outcomeSemantics,'execution-complete-only');
  assert.equal(motion.states.verifying.outcomeSemantics,'activity-only');
});

test('state-machine transition contract only references canonical states',()=>{
  const stateSet=new Set(readJson('characters/states.json').states.map((x)=>x.id));
  const motion=readJson('characters/motion/motion.json');
  for(const transition of motion.transitions){
    assert.ok(stateSet.has(transition.from)||transition.from==='*');
    assert.ok(stateSet.has(transition.to));
    assert.ok(transition.durationMs>=0&&transition.durationMs<=500);
  }
});
