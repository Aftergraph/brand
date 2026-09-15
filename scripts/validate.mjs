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
const characterManifest = readJson('characters/manifest.json');
const characterRoles = readJson('characters/roles.json');
const characterStates = readJson('characters/states.json');

for (const [name, value] of Object.entries(tokens.colors || {})) if (!/^#[0-9a-f]{6}$/i.test(value)) errors.push(`tokens.colors.${name}: invalid hex`);
for (const state of ['verified','stale','conflict','proposed','observed','canonical','revoked','indeterminate']) if (!tokens.semantic?.dark?.states?.[state] || !tokens.semantic?.light?.states?.[state]) errors.push(`missing semantic state token: ${state}`);
if (registry.brand_version !== manifest.version) errors.push('registry brand_version must equal manifest version');
if (registry.legal?.status !== 'provisional-not-trademark-cleared') errors.push('legal status cannot be upgraded without evidence');

const collect = (o) => Object.values(o || {}).flatMap(v => typeof v === 'string' && /\.(svg|png|webp|ico|pdf)$/i.test(v) ? [v] : v && typeof v === 'object' ? collect(v) : []);
for (const file of new Set([...collect(manifest.assets), ...collect(manifest.campaignAssets)])) if (!fs.existsSync(path.join(root,file))) errors.push(`manifest asset missing: ${file}`);

const expectedRoles = ['entity','guide','builder','verifier','observer','researcher'];
const actualRoles = (characterRoles.roles || []).map(x => x.id);
if (JSON.stringify(actualRoles) !== JSON.stringify(expectedRoles)) errors.push('character roles must match canonical archetype set');
if (JSON.stringify(characterRoles).toLowerCase().includes('sentinel')) errors.push('character roles cannot claim blocked Sentinel identity');
const resolveCharacterToken = (token) => {
  if (tokens.colors?.[token]) return tokens.colors[token];
  if (token === 'semantic.dark.danger') return tokens.semantic?.dark?.danger;
  return null;
};
for (const role of characterRoles.roles || []) {
  if (!resolveCharacterToken(role.accentToken)) errors.push(`character role ${role.id}: unknown accent token ${role.accentToken}`);
}
for (const state of characterStates.states || []) {
  if (!resolveCharacterToken(state.signalToken)) errors.push(`character state ${state.id}: unknown signal token ${state.signalToken}`);
}
const expectedCharacterStates = ['idle','thinking','planning','executing','inspecting','waiting','blocked','approval-required','verifying','completed','failed'];
const actualCharacterStates = (characterStates.states || []).map(x => x.id);
if (JSON.stringify(actualCharacterStates) !== JSON.stringify(expectedCharacterStates)) errors.push('character state vocabulary drift');
if ((characterStates.states || []).some(x => x.id === 'succeeded')) errors.push('character state must not conflate completion with verification');
if (characterManifest.status !== 'candidate-vector') errors.push('character assets must remain candidate-vector until governed brand review');
if (characterManifest.truthBoundary !== 'Characters are a view. Evidence is the truth.') errors.push('character truth boundary drift');
const spritePath = characterManifest.sprite;
if (!spritePath || !spritePath.endsWith('.svg') || !fs.existsSync(path.join(root,spritePath))) errors.push(`character sprite missing: ${spritePath}`);
const spriteContent = spritePath && fs.existsSync(path.join(root,spritePath)) ? fs.readFileSync(path.join(root,spritePath),'utf8') : '';
const seenCharacterSymbols = new Set();
for (const asset of characterManifest.assets || []) {
  if (asset.format !== 'svg-symbol') errors.push(`character asset ${asset.id}: v1 canonical delivery must be svg-symbol`);
  if (!asset.symbol || seenCharacterSymbols.has(asset.symbol)) errors.push(`character asset symbol invalid or duplicate: ${asset.symbol}`);
  seenCharacterSymbols.add(asset.symbol);
  if (asset.symbol && !spriteContent.includes(`id=\"${asset.symbol}\"`)) errors.push(`character sprite symbol missing: ${asset.symbol}`);
}
if (seenCharacterSymbols.size !== 23) errors.push(`character sprite must register 23 symbols, found ${seenCharacterSymbols.size}`);
if (/<image\b/i.test(spriteContent)) errors.push('character sprite must not embed raster images');
for (const file of Object.values(characterManifest.semanticIconBindings || {})) if (!fs.existsSync(path.join(root,file))) errors.push(`character semantic binding missing: ${file}`);

const svgFiles = [];
const walk = (dir) => { if (!fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir,{withFileTypes:true})) e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.svg')&&svgFiles.push(path.join(dir,e.name)); };
for (const d of ['svg','identity','semantics','social','editorial','product','products','technologies','research','architecture','evidence','wallpaper','characters']) walk(path.join(root,d));
for (const file of svgFiles) {
  const content=fs.readFileSync(file,'utf8'); const rel=path.relative(root,file);
  if (!/<svg\b/.test(content) || !/<\/svg>/.test(content)) errors.push(`${rel}: malformed SVG envelope`);
  if (!/viewBox="[^"]+"/.test(content)) errors.push(`${rel}: missing viewBox`);
  if (!/role="img"|aria-hidden="true"/.test(content)) warn.push(`${rel}: no standalone accessibility role (allowed for decorative patterns)`);
  if (/Provisional home of ABDE Intelligence/i.test(content)) errors.push(`${rel}: forbidden current legacy copy`);
}
for (const name of [...(semantics.concepts||[]).map(x=>x), ...(semantics.states||[]).map(x=>`state-${x}`)]) if (!fs.existsSync(path.join(root,'semantics/icons',`${name}.svg`))) errors.push(`missing generated symbol: ${name}`);
for (const product of ['work-intelligence','studio','sentinel']) {
  const p=readJson(`products/${product}/manifest.json`);
  if (p.brand_version !== manifest.version) errors.push(`${product}: brand version drift`);
  if (product==='sentinel' && (p.identity !== null || p.status !== 'blocked-naming-review')) errors.push('Sentinel identity must remain blocked until governed naming resolution');
}

if (errors.length) { console.error(`Brand OS validation failed (${errors.length})`); errors.forEach(e=>console.error(`ERROR ${e}`)); process.exit(1); }
console.log(`Brand OS validation passed: ${svgFiles.length} SVGs, ${(semantics.concepts||[]).length} concepts, ${(semantics.states||[]).length} states, ${(characterManifest.assets||[]).length} character assets.`);
if (warn.length) { console.log(`Warnings: ${warn.length}`); warn.slice(0,10).forEach(w=>console.log(`WARN ${w}`)); }
