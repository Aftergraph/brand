#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const readJson=(rel)=>JSON.parse(read(rel));
const tokens=readJson('tokens.json');
const anchorsDoc=readJson('characters/source/master/anchors.json');
const anchorIds=new Set(anchorsDoc.anchors.map((a)=>a.id));
const requiredGroups=['halo','head','face','torso','arm-left','arm-right','hand-left','hand-right','leg-left','leg-right','shading'];
const svgSources=[
  'characters/source/master/base-character.svg',
  'characters/source/roles/roles.svg',
  'characters/source/states/states.svg',
  'characters/source/expressions/expressions.svg',
  'characters/source/icons/new-icons.svg',
];
const leakageSources=[
  ...svgSources,
  'characters/source/master/anchors.json',
  'characters/source/icons/icon-mapping.json',
  'characters/source/expressions/expressions.json',
  'characters/source/rig/rig.json',
  'characters/contracts/components.d.ts',
  'characters/ci/ci-checks.yml',
];

function collectHex(value,out=new Set()){
  if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)) out.add(value.toUpperCase());
  else if(Array.isArray(value)) for(const item of value) collectHex(item,out);
  else if(value&&typeof value==='object') for(const item of Object.values(value)) collectHex(item,out);
  return out;
}
const palette=collectHex(tokens);
const resolveToken=(token)=>{
  if(tokens.colors?.[token]) return tokens.colors[token];
  if(token==='semantic.dark.danger') return tokens.semantic?.dark?.danger;
  return null;
};

const base=read('characters/source/master/base-character.svg');
for(const group of requiredGroups) if(!new RegExp(`<g id="${group}"(?:\\s|>)`).test(base)) errors.push(`missing requiredGroups entry: ${group}`);

for(const rel of svgSources){
  const source=read(rel);
  if(/<image\b/i.test(source)) errors.push(`${rel}: embedded raster image is forbidden`);
  const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map((m)=>m[1]);
  const seen=new Set();
  for(const id of ids){
    if(seen.has(id)) errors.push(`${rel}: duplicate id ${id}`);
    seen.add(id);
  }
  for(const hex of source.match(/#[0-9a-f]{6}/ig)||[]){
    if(!palette.has(hex.toUpperCase())) errors.push(`${rel}: unknown color ${hex}`);
  }
  for(const ref of source.matchAll(/data-(?:anchor-ref|pivot-anchor)="([^"]+)"/g)){
    if(!anchorIds.has(ref[1])) errors.push(`${rel}: invalid anchor ref ${ref[1]}`);
  }
}

const roleSource=read('characters/source/roles/roles.svg');
for(const m of roleSource.matchAll(/data-accent-token="([^"]+)" data-accent="([^"]+)"/g)){
  const expected=resolveToken(m[1]);
  if(!expected) errors.push(`role module: unknown color token ${m[1]}`);
  else if(expected.toUpperCase()!==m[2].toUpperCase()) errors.push(`role module: token/color mismatch ${m[1]} -> ${m[2]}`);
}
const stateSource=read('characters/source/states/states.svg');
for(const m of stateSource.matchAll(/data-signal-token="([^"]+)" data-signal="([^"]+)"/g)){
  const expected=resolveToken(m[1]);
  if(!expected) errors.push(`state module: unknown color token ${m[1]}`);
  else if(expected.toUpperCase()!==m[2].toUpperCase()) errors.push(`state module: token/color mismatch ${m[1]} -> ${m[2]}`);
}

const anchors=anchorsDoc.anchors;
if(anchorIds.size!==anchors.length) errors.push('anchors.json: duplicate id');
const byId=new Map(anchors.map((a)=>[a.id,a]));
for(const anchor of anchors){
  if(anchor.x<0||anchor.x>512||anchor.y<0||anchor.y>512) errors.push(`anchors.json: out-of-bounds anchor ${anchor.id}`);
  if(anchor.parentJoint&&!byId.has(anchor.parentJoint)) errors.push(`anchors.json: invalid parent ${anchor.parentJoint} for ${anchor.id}`);
  const visited=new Set([anchor.id]);
  let parent=anchor.parentJoint;
  while(parent){
    if(visited.has(parent)){ errors.push(`anchors.json: parent cycle at ${anchor.id}`); break; }
    visited.add(parent); parent=byId.get(parent)?.parentJoint||null;
  }
}

for(const rel of leakageSources){
  const source=read(rel);
  if(/\b(?:Sentinel|Forge|Atlas)\b/.test(source)) errors.push(`${rel}: product alias leakage outside governance mapping`);
}

for(const command of [['scripts/compose-characters.mjs','--check'],['scripts/generate-character-icons.mjs','--check'],['scripts/generate-character-sprites.mjs','--check']]){
  try{ execFileSync(process.execPath,command,{cwd:root,stdio:'pipe'}); }
  catch(error){ errors.push(`${command[0]}: generated-output drift detected`); }
}

const generatedRoot=path.join(root,'characters/generated');
if(fs.existsSync(generatedRoot)){
  const stack=[generatedRoot];
  while(stack.length){
    const dir=stack.pop();
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      const full=path.join(dir,entry.name);
      if(entry.isDirectory()) stack.push(full);
      else if(entry.name.endsWith('.svg')){
        const content=fs.readFileSync(full,'utf8');
        if(/<image\b/i.test(content)) errors.push(`${path.relative(root,full)}: generated embedded raster`);
      }
    }
  }
}

if(errors.length){
  console.error(`Character source validation failed (${errors.length})`);
  for(const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}
console.log(`Character source validation passed: ${requiredGroups.length} requiredGroups, ${anchors.length} anchors, ${svgSources.length} editable SVG source files; no duplicate id, embedded raster, unknown color, invalid anchor ref, product alias leakage, or generated-output drift.`);
