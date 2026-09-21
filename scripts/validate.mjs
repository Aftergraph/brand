#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const warn = [];
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(path.join(root,file),'utf8')); } catch (e) { errors.push(`${file}: ${e.message}`); return {}; } };
const manifest = readJson('manifest.json');
const tokens = readJson('tokens.json');
const registry = readJson('registry.json');
const semantics = readJson('semantics/registry.json');

for (const [name, value] of Object.entries(tokens.colors || {})) if (!/^#[0-9a-f]{6}$/i.test(value)) errors.push(`tokens.colors.${name}: invalid hex`);
for (const state of ['verified','stale','conflict','proposed','observed','canonical','revoked','indeterminate']) if (!tokens.semantic?.dark?.states?.[state] || !tokens.semantic?.light?.states?.[state]) errors.push(`missing semantic state token: ${state}`);
if (registry.brand_version !== manifest.version) errors.push('registry brand_version must equal manifest version');
if (registry.legal?.status !== 'provisional-not-trademark-cleared') errors.push('legal status cannot be upgraded without evidence');

const collect = (o) => Object.values(o || {}).flatMap(v => typeof v === 'string' && /\.(svg|png|webp|ico|pdf)$/i.test(v) ? [v] : v && typeof v === 'object' ? collect(v) : []);
for (const file of new Set([...collect(manifest.assets), ...collect(manifest.campaignAssets)])) if (!fs.existsSync(path.join(root,file))) errors.push(`manifest asset missing: ${file}`);

const svgFiles = [];
const walk = (dir) => { if (!fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir,{withFileTypes:true})) e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.svg')&&svgFiles.push(path.join(dir,e.name)); };
for (const d of ['svg','identity','semantics','social','editorial','product','products','technologies','research','architecture','evidence','wallpaper']) walk(path.join(root,d));
for (const file of svgFiles) {
  const content=fs.readFileSync(file,'utf8'); const rel=path.relative(root,file);
  if (!/<svg\b/.test(content) || !/<\/svg>/.test(content)) errors.push(`${rel}: malformed SVG envelope`);
  if (!/viewBox="[^"]+"/.test(content)) errors.push(`${rel}: missing viewBox`);
  if (!/role="img"|aria-hidden="true"/.test(content)) warn.push(`${rel}: no standalone accessibility role (allowed for decorative patterns)`);
  if (/Provisional home of ABDE Intelligence/i.test(content)) errors.push(`${rel}: forbidden current legacy copy`);
}
for (const name of [...(semantics.concepts||[]).map(x=>x), ...(semantics.states||[]).map(x=>`state-${x}`)]) if (!fs.existsSync(path.join(root,'semantics/icons',`${name}.svg`))) errors.push(`missing generated symbol: ${name}`);
for (const product of ['work-intelligence','studio','sentinel','steward']) {
  const p=readJson(`products/${product}/manifest.json`);
  if (p.brand_version !== manifest.version) errors.push(`${product}: brand version drift`);
  if (product==='sentinel' && (p.identity !== null || p.status !== 'blocked-naming-review')) errors.push('Sentinel identity must remain blocked until governed naming resolution');
  if (product==='steward') {
    if (p.parent !== 'Aftergraph' || p.class !== 'product-extension') errors.push('steward: invalid parent or class');
    if (p.identity !== 'identity/bounded-node.svg') errors.push('steward: canonical identity path drift');
    const scopedTokens=readJson('products/steward/tokens.json');
    const expected={cream:'#FAF6EF',warm_ink:'#1E1B16',steward_copper:'#C2703D',pine_teal:'#23615E',moss:'#3E7C59'};
    for (const [name,value] of Object.entries(expected)) if (scopedTokens.colors?.[name] !== value) errors.push(`steward token drift: ${name}`);
    const presence=readJson('products/steward/motion/presence-contract.json');
    if (presence.id !== 'steward.presence.v1' || (presence.states||[]).length !== 12) errors.push('steward: invalid presence contract');
    const lottie=readJson('products/steward/motion/steward-presence.lottie.json');
    if (lottie.fr !== 60 || (lottie.markers||[]).length !== 12) errors.push('steward: invalid Lottie state markers');
    const rig=readJson('products/steward/3d/reference-model.evidence.json');
    const requiredClips=['idle','blink','verify'];
    if (rig.schema_version !== 2 || rig.status !== 'verified-structural-reference') errors.push('steward: invalid 3D evidence version/status');
    if (rig.rig?.armature !== 'STEWARD_Rig' || rig.rig?.bone_count !== 20) errors.push('steward: 3D rig identity/bone-count drift');
    for (const clip of requiredClips) {
      if (!(rig.rig?.actions||[]).includes(clip)) errors.push(`steward: missing rig action ${clip}`);
      if (!(rig.exports?.glb?.animation_names||[]).includes(clip)) errors.push(`steward: missing GLB clip ${clip}`);
      if (!(rig.exports?.fbx?.roundtrip?.action_names||[]).some(name=>name.toLowerCase().includes(clip))) errors.push(`steward: missing FBX roundtrip action ${clip}`);
    }
    const sha256=/^[0-9a-f]{64}$/;
    for (const [format,digest] of [['glb',rig.exports?.glb?.sha256],['fbx',rig.exports?.fbx?.sha256],['blend',rig.exports?.blend?.sha256]]) {
      if (!sha256.test(digest||'')) errors.push(`steward: invalid ${format} SHA-256 evidence`);
    }
    if (rig.exports?.glb?.skin_count !== 1) errors.push('steward: GLB must contain exactly one rig skin');
    if (rig.exports?.fbx?.roundtrip?.bone_count !== 20) errors.push('steward: FBX roundtrip bone-count drift');
  }
}

if (errors.length) { console.error(`Brand OS validation failed (${errors.length})`); errors.forEach(e=>console.error(`ERROR ${e}`)); process.exit(1); }
console.log(`Brand OS validation passed: ${svgFiles.length} SVGs, ${(semantics.concepts||[]).length} concepts, ${(semantics.states||[]).length} states.`);
if (warn.length) { console.log(`Warnings: ${warn.length}`); warn.slice(0,10).forEach(w=>console.log(`WARN ${w}`)); }
