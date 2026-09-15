#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const checkMode=process.argv.includes('--check');
const source=fs.readFileSync(path.join(root,'characters/source/icons/new-icons.svg'),'utf8');
const mapping=JSON.parse(fs.readFileSync(path.join(root,'characters/source/icons/icon-mapping.json'),'utf8'));
const concepts=mapping.filter((x)=>x.action==='new').map((x)=>x.concept);
const drift=[];

function extractSymbol(id){
  const re=new RegExp(`<symbol id="${id}"[^>]*>([\\s\\S]*?)<\\/symbol>`);
  const m=source.match(re);
  if(!m) throw new Error(`Missing icon symbol ${id}`);
  return m[1].trim();
}
function output(concept){
  const body=extractSymbol(`ag-ui-${concept}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="Aftergraph ${concept} icon"><title>${concept}</title>${body}</svg>\n`;
}
for(const concept of concepts){
  const rel=`characters/generated/icons/${concept}.svg`;
  const file=path.join(root,rel);
  const content=output(concept);
  if(checkMode){
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content) drift.push(rel);
  }else{
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,content);
  }
}
if(checkMode&&drift.length){
  console.error(`Generated character icons drifted (${drift.length})`);
  for(const rel of drift) console.error(`- ${rel}`);
  process.exit(1);
}
console.log(`${checkMode?'Verified':'Generated'} ${concepts.length} new supporting icons.`);
