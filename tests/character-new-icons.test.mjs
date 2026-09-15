import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const mapping=JSON.parse(read('characters/source/icons/icon-mapping.json'));
const newConcepts=mapping.filter((x)=>x.action==='new').map((x)=>x.concept);
const reuseConcepts=mapping.filter((x)=>x.action==='reuse').map((x)=>x.concept);

test('new supporting icons source covers only concepts that need new artwork',()=>{
  assert.deepEqual(newConcepts,['analytics','deploy','docs','error','inspect','node','progress','success','sync','task-list','warning']);
  const source=read('characters/source/icons/new-icons.svg');
  for(const concept of newConcepts) assert.match(source,new RegExp(`id="ag-ui-${concept}"`));
  for(const concept of reuseConcepts) assert.doesNotMatch(source,new RegExp(`id="ag-ui-${concept}"`));
  assert.doesNotMatch(source,/<image\b/i);
});

test('new supporting icons match the canonical 24px currentColor stroke grammar',()=>{
  const source=read('characters/source/icons/new-icons.svg');
  assert.match(source,/viewBox="0 0 24 24"/);
  assert.match(source,/stroke="currentColor"/);
  assert.match(source,/stroke-width="1\.75"/);
});

test('icon generator emits standalone editable SVGs and detects drift',()=>{
  execFileSync(process.execPath,['scripts/generate-character-icons.mjs'],{cwd:root,stdio:'pipe'});
  for(const concept of newConcepts){
    const p=`characters/generated/icons/${concept}.svg`;
    assert.ok(fs.existsSync(path.join(root,p)));
    const svg=read(p);
    assert.match(svg,/role="img"/);
    assert.match(svg,new RegExp(`<title>${concept}<\\/title>`));
    assert.doesNotMatch(svg,/<image\b/i);
  }
  execFileSync(process.execPath,['scripts/generate-character-icons.mjs','--check'],{cwd:root,stdio:'pipe'});
});
