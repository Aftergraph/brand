import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const report='characters/generated/qa/context-visibility.json';

test('character context QA covers dark, light, transparent, and high-contrast surfaces',()=>{
  execFileSync(process.execPath,['characters/ci/verify-contexts.mjs','--report',report],{cwd:root,stdio:'pipe'});
  const data=JSON.parse(fs.readFileSync(path.join(root,report),'utf8'));
  assert.deepEqual(data.contexts.map((x)=>x.id),['dark','light','transparent','high-contrast']);
  assert.equal(data.cases.length,6*4);
  assert.ok(data.cases.every((x)=>x.visible===true));
  assert.ok(data.cases.every((x)=>x.clipped===false));
  for(const row of data.cases){
    const expected=['light','high-contrast'].includes(row.context)?'light':'dark';
    assert.equal(row.sourceTheme,expected,`${row.context}/${row.role}: wrong theme source`);
  }
});

test('context definitions are bound to Brand OS colors rather than new ad-hoc palette values',()=>{
  const contexts=JSON.parse(fs.readFileSync(path.join(root,'characters/contexts.json'),'utf8'));
  const tokens=JSON.parse(fs.readFileSync(path.join(root,'tokens.json'),'utf8'));
  const allowed=new Set([null,...Object.values(tokens.colors),...Object.values(tokens.semantic.dark).filter((x)=>typeof x==='string'),...Object.values(tokens.semantic.light).filter((x)=>typeof x==='string')]);
  for(const context of contexts.contexts) assert.ok(allowed.has(context.background),`${context.id}: ${context.background}`);
});
