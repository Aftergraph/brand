#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';
import {repoRoot,launchBrowser} from './lib.mjs';

const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const reportRel=value('--report','characters/generated/qa/context-visibility.json');
const contexts=JSON.parse(fs.readFileSync(path.join(repoRoot,'characters/contexts.json'),'utf8')).contexts;
const roles=JSON.parse(fs.readFileSync(path.join(repoRoot,'characters/roles.json'),'utf8')).roles.map((x)=>x.id);
const browser=await launchBrowser();
const page=await browser.newPage();
const cases=[];
let failed=0;

const rgb=(hex)=>hex?hex.match(/[0-9a-f]{2}/ig).map((x)=>parseInt(x,16)):null;
function metrics(bytes,background){
  const png=PNG.sync.read(Buffer.from(bytes));
  const bg=rgb(background);
  let nonTransparent=0, distinct=0, maxEdgeAlpha=0;
  for(let y=0;y<png.height;y++) for(let x=0;x<png.width;x++){
    const i=(y*png.width+x)*4;
    const a=png.data[i+3];
    if(a>0) nonTransparent++;
    if(bg&&a>0){
      const delta=Math.abs(png.data[i]-bg[0])+Math.abs(png.data[i+1]-bg[1])+Math.abs(png.data[i+2]-bg[2]);
      if(delta>=36) distinct++;
    }
    if((x===0||y===0||x===png.width-1||y===png.height-1)&&a>maxEdgeAlpha) maxEdgeAlpha=a;
  }
  const total=png.width*png.height;
  const visible=background===null ? nonTransparent/total>=0.03 : distinct/total>=0.03;
  return {nonTransparentPixels:nonTransparent,distinctPixels:distinct,visibleFraction:background===null?nonTransparent/total:distinct/total,maxEdgeAlpha,visible,clipped:maxEdgeAlpha>=128&&background===null};
}
try{
  for(const context of contexts){
    for(const role of roles){
      const source=context.theme==='light'
        ? path.join(repoRoot,'characters/generated/themes/light/roles',`${role}.svg`)
        : path.join(repoRoot,'characters/generated/roles',`${role}.svg`);
      const svg=fs.readFileSync(source,'utf8');
      const data=Buffer.from(svg).toString('base64');
      const bg=context.background??'transparent';
      await page.setViewport({width:256,height:256,deviceScaleFactor:1});
      await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${bg}}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><img id="asset" src="data:image/svg+xml;base64,${data}"></body></html>`,{waitUntil:'load'});
      await page.evaluate(async()=>{const img=document.getElementById('asset');if(img?.decode)await img.decode();});
      const bytes=await page.screenshot({type:'png',omitBackground:context.background===null,captureBeyondViewport:false});
      const result=metrics(bytes,context.background);
      const row={context:context.id,sourceTheme:context.theme,role,...result}; cases.push(row);
      if(!row.visible||row.clipped) failed++;
    }
  }
}finally{await browser.close();}
const report={schema:'aftergraph.character-context-visibility.v1',contexts,cases};
const out=path.join(repoRoot,reportRel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,`${JSON.stringify(report,null,2)}\n`);
if(failed){console.error(`Context QA failed: ${failed}/${cases.length} visibility/clipping failures.`);process.exit(1);}
console.log(`Context QA passed: ${cases.length}/${cases.length} role/context renders remain visible and unclipped.`);
