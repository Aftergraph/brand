#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const checkMode=process.argv.includes('--check');
const roles=JSON.parse(fs.readFileSync(path.join(root,'characters/roles.json'),'utf8')).roles.map((x)=>x.id);
const states=JSON.parse(fs.readFileSync(path.join(root,'characters/states.json'),'utf8')).states.map((x)=>x.id);
const iconMapping=JSON.parse(fs.readFileSync(path.join(root,'characters/source/icons/icon-mapping.json'),'utf8'));
const icons=iconMapping.filter((x)=>x.action==='new').map((x)=>x.concept);

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function namespaceBody(body,prefix){
  const ids=[...body.matchAll(/\bid="([^"]+)"/g)].map((m)=>m[1]);
  const map=new Map(ids.map((id)=>[id,`${prefix}--${id}`]));
  let out=body;
  for(const [id,next] of map){
    out=out.split(`id="${id}"`).join(`id="${next}"`);
    out=out.split(`url(#${id})`).join(`url(#${next})`);
    out=out.split(`href="#${id}"`).join(`href="#${next}"`);
    out=out.split(`xlink:href="#${id}"`).join(`xlink:href="#${next}"`);
  }
  out=out.replace(/aria-labelledby="([^"]+)"/g,(_,value)=>`aria-labelledby="${value.split(/\s+/).map((id)=>map.get(id)||id).join(' ')}"`);
  return out;
}
function asSymbol(rel,symbolId){
  const svg=read(rel);
  const open=svg.match(/<svg\b([^>]*)>/);
  if(!open) throw new Error(`${rel}: missing svg root`);
  const viewBox=open[1].match(/viewBox="([^"]+)"/)?.[1];
  if(!viewBox) throw new Error(`${rel}: missing viewBox`);
  const theme=open[1].match(/data-theme="([^"]+)"/)?.[1];
  const body=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>')).trim();
  const themeAttr=theme?` data-theme="${theme}"`:'';
  return `<symbol id="${symbolId}" viewBox="${viewBox}"${themeAttr}>${namespaceBody(body,symbolId)}</symbol>`;
}

function buildCharacterSymbols(prefix='characters/generated') {
  const symbols=[];
  for(const role of roles) symbols.push(asSymbol(`${prefix}/roles/${role}.svg`,`ag-character-role-${role}`));
  for(const state of states) symbols.push(asSymbol(`${prefix}/states/${state}.svg`,`ag-character-state-${state}`));
  for(const role of roles) symbols.push(asSymbol(`${prefix}/avatars/${role}.svg`,`ag-character-avatar-${role}`));
  for(const role of roles) for(const state of states) symbols.push(asSymbol(`${prefix}/compositions/${role}--${state}.svg`,`ag-character-composition-${role}--${state}`));
  return symbols;
}

const darkCharacterSymbols=buildCharacterSymbols();
const lightCharacterSymbols=buildCharacterSymbols('characters/generated/themes/light');
const iconSymbols=icons.map((icon)=>asSymbol(`characters/generated/icons/${icon}.svg`,`ag-character-icon-${icon}`));

const files={
  'characters/generated/sprites/characters.svg':`<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-theme="dark">${darkCharacterSymbols.join('')}</svg>\n`,
  'characters/generated/themes/light/sprites/characters.svg':`<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-theme="light">${lightCharacterSymbols.join('')}</svg>\n`,
  'characters/generated/sprites/icons.svg':`<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${iconSymbols.join('')}</svg>\n`,
};
const drift=[];
for(const [rel,content] of Object.entries(files)){
  const file=path.join(root,rel);
  if(checkMode){
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content) drift.push(rel);
  }else{
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,content);
  }
}
if(checkMode&&drift.length){console.error(`Generated sprite drift (${drift.length}): ${drift.join(', ')}`);process.exit(1);}
console.log(`${checkMode?'Verified':'Generated'} compositional sprites: ${darkCharacterSymbols.length} dark + ${lightCharacterSymbols.length} light character symbols + ${iconSymbols.length} supporting icon symbols.`);
