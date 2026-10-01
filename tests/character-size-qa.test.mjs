import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const reportPath=path.join(root,'characters/generated/qa/small-size.json');

test('small-size QA covers canonical full roles and derived avatars at every required size',()=>{
  execFileSync(process.execPath,['characters/ci/verify-small-sizes.mjs','--report','characters/generated/qa/small-size.json'],{cwd:root,stdio:'pipe'});
  const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
  assert.deepEqual(report.sizes,[16,24,32,48,64,128,256,512]);
  assert.equal(report.cases.length,6*2*report.sizes.length);
  assert.ok(report.cases.every((x)=>x.nonTransparentPixels>0));
  assert.ok(report.cases.every((x)=>x.clipped===false));
});
