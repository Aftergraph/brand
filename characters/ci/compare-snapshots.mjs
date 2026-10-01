#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import {repoRoot,loadConfig} from './lib.mjs';

const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const config=loadConfig(value('--config','characters/ci/ci-checks.yml'));
const visual=config.visual_regression;
const root=path.resolve(repoRoot,visual.snapshot_root);
const baselineRoot=path.join(root,'baseline');
const actualRoot=path.join(root,'actual');
const diffRoot=path.join(root,'diff');
fs.mkdirSync(diffRoot,{recursive:true});
const report=[];
let failed=0;
for(const renderCase of visual.render_cases){
  const expectedPath=path.join(baselineRoot,`${renderCase.id}.png`);
  const actualPath=path.join(actualRoot,`${renderCase.id}.png`);
  if(!fs.existsSync(expectedPath)||!fs.existsSync(actualPath)){
    report.push({id:renderCase.id,status:'missing',diffPixels:null}); failed++; continue;
  }
  const expected=PNG.sync.read(fs.readFileSync(expectedPath));
  const actual=PNG.sync.read(fs.readFileSync(actualPath));
  if(expected.width!==actual.width||expected.height!==actual.height){
    report.push({id:renderCase.id,status:'dimension-mismatch',expected:[expected.width,expected.height],actual:[actual.width,actual.height]}); failed++; continue;
  }
  const diff=new PNG({width:expected.width,height:expected.height});
  const diffPixels=pixelmatch(expected.data,actual.data,diff.data,expected.width,expected.height,{threshold:visual.pixelmatch_threshold,includeAA:false});
  const pass=diffPixels<=visual.max_diff_pixels;
  const diffPath=path.join(diffRoot,`${renderCase.id}.png`);
  if(diffPixels>0) fs.writeFileSync(diffPath,PNG.sync.write(diff));
  else if(fs.existsSync(diffPath)) fs.unlinkSync(diffPath);
  report.push({id:renderCase.id,status:pass?'passed':'failed',diffPixels,diffRatio:diffPixels/(expected.width*expected.height)});
  if(!pass) failed++;
}
const reportPath=path.join(root,'report.json');
fs.writeFileSync(reportPath,`${JSON.stringify({schema:'aftergraph.character-visual-regression.v1',threshold:visual.pixelmatch_threshold,maxDiffPixels:visual.max_diff_pixels,cases:report},null,2)}\n`);
if(failed){
  console.error(`Visual regression failed: ${failed}/${report.length} cases exceeded policy or were missing.`);
  for(const item of report.filter((x)=>x.status!=='passed')) console.error(`- ${item.id}: ${item.status}${item.diffPixels===null?'':` (${item.diffPixels} px)`}`);
  process.exit(1);
}
console.log(`Visual regression passed: ${report.length}/${report.length} cases, max allowed diff ${visual.max_diff_pixels}px at threshold ${visual.pixelmatch_threshold}.`);
