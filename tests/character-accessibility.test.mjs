import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=(p)=>JSON.parse(read(p));

test('accessibility contract covers all states with text and reduced-motion fallbacks',()=>{
  const contract=readJson('characters/accessibility.json');
  const states=readJson('characters/states.json').states.map((x)=>x.id);
  assert.deepEqual(Object.keys(contract.statePresentation).sort(),[...states].sort());
  for(const state of states){
    const entry=contract.statePresentation[state];
    assert.ok(entry.textLabel);
    assert.ok(entry.reducedMotion);
    assert.ok(entry.nonColorCue);
  }
  assert.equal(contract.colorOnlySemanticsAllowed,false);
  assert.equal(contract.decorativeMode.ariaHidden,true);
});

test('component contract exposes accessible visual-mode semantics without requiring hardcoded imagery',()=>{
  const source=read('characters/contracts/components.d.ts');
  assert.match(source,/CharacterVisualMode = 'semantic' \| 'decorative'/);
  assert.match(source,/visualMode\?: CharacterVisualMode/);
  assert.match(source,/ariaLabel\?: string/);
  assert.doesNotMatch(source,/image(?:Url|Path|Src)/i);
});

test('accessibility documentation makes verification and completion truth boundaries explicit',()=>{
  const source=read('characters/ACCESSIBILITY.md');
  assert.match(source,/completed.*does not.*verified/is);
  assert.match(source,/verifying.*not.*verdict/is);
  assert.match(source,/prefers-reduced-motion/i);
  assert.match(source,/color alone/i);
});
