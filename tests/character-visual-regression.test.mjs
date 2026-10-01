import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const config='characters/ci/ci-checks.yml';

test('all 66 role-state compositions pass browser bounds verification',()=>{
  execFileSync(process.execPath,['characters/ci/verify-composition-bounds.mjs','--report','characters/generated/qa/composition-bounds.json'],{cwd:root,stdio:'pipe'});
  const report=JSON.parse(fs.readFileSync(path.join(root,'characters/generated/qa/composition-bounds.json'),'utf8'));
  assert.equal(report.cases.length,66);
  assert.ok(report.cases.every((x)=>x.withinViewBox));
});

test('visual regression runner renders deterministic actuals and matches committed baselines',()=>{
  execFileSync(process.execPath,['characters/ci/render-snapshots.mjs','--config',config],{cwd:root,stdio:'pipe'});
  const output=execFileSync(process.execPath,['characters/ci/compare-snapshots.mjs','--config',config],{cwd:root,encoding:'utf8'});
  assert.match(output,/Visual regression passed/);
});
