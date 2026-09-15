#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {repoRoot,launchBrowser,preparePage} from './lib.mjs';

const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const reportRel=value('--report','characters/generated/qa/composition-bounds.json');
const roles=JSON.parse(fs.readFileSync(path.join(repoRoot,'characters/roles.json'),'utf8')).roles.map((x)=>x.id);
const states=JSON.parse(fs.readFileSync(path.join(repoRoot,'characters/states.json'),'utf8')).states.map((x)=>x.id);
const browser=await launchBrowser();
const page=await browser.newPage();
await preparePage(page,{width:512,height:512,deviceScaleFactor:1,background:'#080C14'});
const cases=[];
let failed=0;
try{
  for(const role of roles) for(const state of states){
    const file=path.join(repoRoot,'characters/generated/compositions',`${role}--${state}.svg`);
    const svg=fs.readFileSync(file,'utf8');
    await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`,{waitUntil:'load'});
    const result=await page.evaluate(()=>{
      const svg=document.querySelector('svg');
      const root=document.getElementById('composition-root');
      const b=root.getBBox();
      const v=svg.viewBox.baseVal;
      const epsilon=.01;
      const within=b.x>=v.x-epsilon&&b.y>=v.y-epsilon&&b.x+b.width<=v.x+v.width+epsilon&&b.y+b.height<=v.y+v.height+epsilon;
      return {bbox:{x:b.x,y:b.y,width:b.width,height:b.height},viewBox:{x:v.x,y:v.y,width:v.width,height:v.height},withinViewBox:within};
    });
    cases.push({role,state,...result});
    if(!result.withinViewBox) failed++;
  }
}finally{await browser.close();}
const report={schema:'aftergraph.character-composition-bounds.v1',cases};
const reportPath=path.join(repoRoot,reportRel);
fs.mkdirSync(path.dirname(reportPath),{recursive:true});
fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`);
if(failed){console.error(`Composition bounds failed: ${failed}/${cases.length} outside viewBox.`);process.exit(1);}
console.log(`Composition bounds passed: ${cases.length}/${cases.length} role-state combinations remain within 0 0 512 512.`);
