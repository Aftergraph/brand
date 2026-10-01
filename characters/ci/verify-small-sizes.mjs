#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';
import {repoRoot,launchBrowser} from './lib.mjs';

const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const reportRel=value('--report','characters/generated/qa/small-size.json');
const sizes=[16,24,32,48,64,128,256,512];
const roles=JSON.parse(fs.readFileSync(path.join(repoRoot,'characters/roles.json'),'utf8')).roles.map((x)=>x.id);
const browser=await launchBrowser();
const page=await browser.newPage();
const cases=[];
let failed=0;

function inspectPng(bytes){
  const png=PNG.sync.read(Buffer.from(bytes));
  let nonTransparentPixels=0;
  let edgePixels=0;
  let maxEdgeAlpha=0;
  for(let y=0;y<png.height;y++) for(let x=0;x<png.width;x++){
    const alpha=png.data[(y*png.width+x)*4+3];
    if(alpha===0) continue;
    nonTransparentPixels++;
    if(x===0||y===0||x===png.width-1||y===png.height-1){ edgePixels++; maxEdgeAlpha=Math.max(maxEdgeAlpha,alpha); }
  }
  return {nonTransparentPixels,edgePixels,maxEdgeAlpha,clipped:maxEdgeAlpha>=128};
}

try{
  for(const role of roles){
    for(const kind of ['role','avatar']){
      const source=kind==='role'
        ? path.join(repoRoot,'characters/generated/roles',`${role}.svg`)
        : path.join(repoRoot,'characters/generated/avatars',`${role}.svg`);
      const svg=fs.readFileSync(source,'utf8');
      const data=Buffer.from(svg).toString('base64');
      for(const size of sizes){
        await page.setViewport({width:size,height:size,deviceScaleFactor:1});
        await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}img{width:100%;height:100%;object-fit:contain;display:block}</style></head><body><img id="asset" src="data:image/svg+xml;base64,${data}"></body></html>`,{waitUntil:'load'});
        await page.evaluate(async()=>{const img=document.getElementById('asset'); if(img?.decode) await img.decode();});
        const bytes=await page.screenshot({type:'png',omitBackground:true,captureBeyondViewport:false});
        const metrics=inspectPng(bytes);
        const row={role,kind,size,...metrics};
        cases.push(row);
        if(metrics.nonTransparentPixels===0||metrics.clipped) failed++;
      }
    }
  }
}finally{await browser.close();}
const report={schema:'aftergraph.character-small-size-qa.v1',sizes,cases};
const out=path.join(repoRoot,reportRel);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,`${JSON.stringify(report,null,2)}\n`);
if(failed){console.error(`Small-size QA failed: ${failed}/${cases.length} blank or clipped renders.`);process.exit(1);}
console.log(`Small-size QA passed: ${cases.length}/${cases.length} renders across ${sizes.join(', ')} px are nonblank and unclipped.`);
