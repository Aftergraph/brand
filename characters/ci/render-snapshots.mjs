#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {repoRoot,loadConfig,launchBrowser,renderCasePath,preparePage,loadSvgIntoPage} from './lib.mjs';

const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const configPath=value('--config','characters/ci/ci-checks.yml');
const baseline=args.includes('--baseline');
const config=loadConfig(configPath);
const visual=config.visual_regression;
const targetRoot=path.resolve(repoRoot,visual.snapshot_root,baseline?'baseline':'actual');
fs.mkdirSync(targetRoot,{recursive:true});
const browser=await launchBrowser();
const page=await browser.newPage();
const viewport=visual.viewport;
await preparePage(page,{...viewport,background:visual.background});
const results=[];
try{
  for(const renderCase of visual.render_cases){
    const sourcePath=renderCasePath(renderCase);
    if(!fs.existsSync(sourcePath)) throw new Error(`Missing render source for ${renderCase.id}: ${path.relative(repoRoot,sourcePath)}`);
    const svg=fs.readFileSync(sourcePath,'utf8');
    await loadSvgIntoPage(page,svg,visual.background);
    const out=path.join(targetRoot,`${renderCase.id}.png`);
    await page.screenshot({path:out,type:'png',captureBeyondViewport:false});
    results.push({id:renderCase.id,path:path.relative(repoRoot,out),sha256:crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex')});
  }
  const manifest={schema:'aftergraph.character-visual-snapshots.v1',mode:baseline?'baseline':'actual',viewport,browser:await browser.version(),cases:results};
  fs.writeFileSync(path.join(targetRoot,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`);
  console.log(`${baseline?'Baseline':'Actual'} render complete: ${results.length} cases at ${viewport.width}x${viewport.height} DPR${viewport.deviceScaleFactor}.`);
}finally{
  await browser.close();
}
