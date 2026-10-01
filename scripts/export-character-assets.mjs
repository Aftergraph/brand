#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root=path.resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const outRel=value('--out','exports/characters');
const outRoot=path.resolve(root,outRel);
const roles=JSON.parse(fs.readFileSync(path.join(root,'characters/roles.json'),'utf8')).roles.map((x)=>x.id);
const states=JSON.parse(fs.readFileSync(path.join(root,'characters/states.json'),'utf8')).states.map((x)=>x.id);
const iconMapping=JSON.parse(fs.readFileSync(path.join(root,'characters/source/icons/icon-mapping.json'),'utf8'));
const newIcons=iconMapping.filter((x)=>x.action==='new').map((x)=>x.concept);
const sha256=(buffer)=>crypto.createHash('sha256').update(buffer).digest('hex');

const characterAssets=[];
for(const theme of ['dark','light']){
  const prefix=theme==='dark'?'characters/generated':'characters/generated/themes/light';
  for(const role of roles) characterAssets.push({id:`${theme}.role.${role}`,theme,category:'roles',name:role,source:`${prefix}/roles/${role}.svg`,size:512});
  for(const state of states) characterAssets.push({id:`${theme}.state.${state}`,theme,category:'states',name:state,source:`${prefix}/states/${state}.svg`,size:512});
  for(const role of roles) characterAssets.push({id:`${theme}.avatar.${role}`,theme,category:'avatars',name:role,source:`${prefix}/avatars/${role}.svg`,size:256});
  for(const role of roles) for(const state of states) characterAssets.push({id:`${theme}.composition.${role}.${state}`,theme,category:'compositions',name:`${role}--${state}`,source:`${prefix}/compositions/${role}--${state}.svg`,size:512});
}
const neutralAssets=newIcons.map((icon)=>({id:`icon.${icon}`,theme:null,category:'icons',name:icon,source:`characters/generated/icons/${icon}.svg`,size:128}));
const assets=[...characterAssets,...neutralAssets].sort((a,b)=>a.id.localeCompare(b.id));

fs.rmSync(outRoot,{recursive:true,force:true});

async function exportOne(asset){
  const sourcePath=path.join(root,asset.source);
  if(!fs.existsSync(sourcePath)) throw new Error(`Missing generated source: ${asset.source}`);
  const svg=fs.readFileSync(sourcePath);
  const files={};
  const write=async(format,buffer)=>{
    const rel=asset.theme?path.posix.join(format,asset.theme,asset.category,`${asset.name}.${format}`):path.posix.join(format,asset.category,`${asset.name}.${format}`);
    const abs=path.join(outRoot,rel);
    fs.mkdirSync(path.dirname(abs),{recursive:true});
    fs.writeFileSync(abs,buffer);
    files[format]={path:rel,bytes:buffer.length,sha256:sha256(buffer)};
  };
  await write('svg',svg);
  const base=sharp(svg,{density:192}).resize(asset.size,asset.size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}});
  const [png,webp,avif]=await Promise.all([
    base.clone().png({compressionLevel:9,adaptiveFiltering:false}).toBuffer(),
    base.clone().webp({lossless:true,effort:2}).toBuffer(),
    base.clone().avif({quality:90,effort:0,chromaSubsampling:'4:4:4'}).toBuffer(),
  ]);
  await Promise.all([write('png',png),write('webp',webp),write('avif',avif)]);
  return {id:asset.id,theme:asset.theme,category:asset.category,source:asset.source,rasterSize:asset.size,files};
}

const records=[];
for(let i=0;i<assets.length;i+=8){
  const batch=await Promise.all(assets.slice(i,i+8).map(exportOne));
  records.push(...batch);
}
records.sort((a,b)=>a.id.localeCompare(b.id));
const spriteFiles={};
for(const [name,source,fileName] of [
  ['darkCharacters','characters/generated/sprites/characters.svg','characters-dark.svg'],
  ['lightCharacters','characters/generated/themes/light/sprites/characters.svg','characters-light.svg'],
  ['icons','characters/generated/sprites/icons.svg','icons.svg'],
]){
  const buffer=fs.readFileSync(path.join(root,source));
  const rel=path.posix.join('sprites',fileName);
  const abs=path.join(outRoot,rel); fs.mkdirSync(path.dirname(abs),{recursive:true}); fs.writeFileSync(abs,buffer);
  spriteFiles[name]={path:rel,bytes:buffer.length,sha256:sha256(buffer)};
}
const manifest={
  $schema:'aftergraph.character-release-assets.v1',
  version:'1.0.0',
  sourceOfTruth:'characters/source',
  generatedSource:'characters/generated',
  formats:['svg','png','webp','avif'],
  themes:['dark','light'],
  themeAssetCounts:{dark:89,light:89},
  themeNeutralAssetCount:11,
  assetCount:records.length,
  sprites:spriteFiles,
  assets:records,
};
fs.writeFileSync(path.join(outRoot,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Exported ${records.length} character assets in SVG, PNG, WebP, and AVIF (${records.length*4} files).`);
