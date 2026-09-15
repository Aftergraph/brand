#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const checkMode = process.argv.includes('--check');
const generatedRoot = path.join(root, 'characters', 'generated');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const roles = readJson('characters/roles.json').roles;
const states = readJson('characters/states.json').states;
const tokens = readJson('tokens.json');
const themes = readJson('characters/themes.json').themes;
const anchors = readJson('characters/source/master/anchors.json').anchors;
const anchorMap = new Map(anchors.map((a) => [a.id, a]));
const baseSource = read('characters/source/master/base-character.svg');
const rolesSource = read('characters/source/roles/roles.svg');
const statesSource = read('characters/source/states/states.svg');
const expressionsSource = read('characters/source/expressions/expressions.svg');
const expressionRegistry = readJson('characters/source/expressions/expressions.json');
const propSlots = readJson('characters/source/rig/slots.json');
const canonicalAccent = tokens.colors.control_cyan;

const roleToken = (token) => {
  if (tokens.colors?.[token]) return tokens.colors[token];
  if (token === 'semantic.dark.danger') return tokens.semantic?.dark?.danger;
  throw new Error(`Unknown character token: ${token}`);
};
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const sha256 = (content) => crypto.createHash('sha256').update(content).digest('hex');
const tokenPath = (tokenPath) => tokenPath.split('.').reduce((value, key) => value?.[key], tokens);
function applyTheme(content, themeId) {
  const theme = themes[themeId];
  if (!theme) throw new Error(`Unknown character theme: ${themeId}`);
  let result = content;
  for (const [fromPath, toPath] of Object.entries(theme.replacements || {})) {
    const from = tokenPath(fromPath);
    const to = tokenPath(toPath);
    if (typeof from !== 'string' || typeof to !== 'string') throw new Error(`Invalid theme token mapping: ${fromPath} -> ${toPath}`);
    result = result.split(from).join(to);
  }
  for (const [roleId, override] of Object.entries(theme.roleOverrides || {})) {
    if (!result.includes(`data-role="${roleId}"`)) continue;
    if (override.faceColorToken) {
      const faceColor = tokenPath(override.faceColorToken);
      if (typeof faceColor !== 'string') throw new Error(`Invalid face color token: ${override.faceColorToken}`);
      result = result.replace(/(<g id="face"[^>]*\bcolor=")[^"]+(")/, `$1${faceColor}$2`);
    }
  }
  return result.replace('data-theme="dark"', `data-theme="${themeId}"`);
}

function extractDefs(source) {
  const match = source.match(/<defs>([\s\S]*?)<\/defs>/);
  if (!match) throw new Error('base-character.svg is missing <defs>');
  return `<defs>${match[1]}</defs>`;
}
function extractTopGroup(source, id) {
  const re = new RegExp(`<g id="${id}"[\\s\\S]*?<\\/g>`);
  const match = source.match(re);
  if (!match) throw new Error(`Missing group ${id}`);
  return match[0];
}
function extractElement(source, id) {
  const re = new RegExp(`<(?:path|circle|rect|ellipse|line|polyline|polygon) id="${id}"[^>]*\\/>`);
  const match = source.match(re);
  if (!match) throw new Error(`Missing element ${id}`);
  return match[0];
}
function extractSymbol(source, id) {
  const re = new RegExp(`<symbol id="${id}"([^>]*)>([\\s\\S]*?)<\\/symbol>`);
  const match = source.match(re);
  if (!match) throw new Error(`Missing symbol ${id}`);
  const attrs = Object.fromEntries([...match[1].matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  return {attrs, body: match[2].trim()};
}
function replaceAccent(content, accent) {
  return content.split(canonicalAccent).join(accent);
}
function rotateGroup(content, groupId, angle, pivot) {
  if (!angle) return content;
  const re = new RegExp(`<g id="${groupId}"([^>]*)>`);
  return content.replace(re, (full, attrs) => {
    if (/\stransform=/.test(attrs)) throw new Error(`${groupId} already has a transform`);
    return `<g id="${groupId}"${attrs} transform="rotate(${angle} ${pivot.x} ${pivot.y})">`;
  });
}
function poseBase(baseGroups, stateSymbol) {
  let result = baseGroups;
  const leftAngle = Number(stateSymbol.attrs['data-arm-left-angle'] || 0);
  const rightAngle = Number(stateSymbol.attrs['data-arm-right-angle'] || 0);
  const leftPivot = anchorMap.get('shoulder-left');
  const rightPivot = anchorMap.get('shoulder-right');
  for (const groupId of ['arm-left', 'hand-left']) result = rotateGroup(result, groupId, leftAngle, leftPivot);
  for (const groupId of ['arm-right', 'hand-right']) result = rotateGroup(result, groupId, rightAngle, rightPivot);
  return result;
}

function resolveRolePropPlacement(roleSymbol, stateSymbol) {
  const sourceAnchor = roleSymbol.attrs['data-anchor-ref'];
  const stateAnchor = stateSymbol.attrs['data-anchor-ref'];
  let resolvedAnchor = sourceAnchor;
  if (sourceAnchor === stateAnchor) {
    resolvedAnchor = propSlots.collisionPolicy.roleFallback[sourceAnchor] || sourceAnchor;
  }
  const from = anchorMap.get(sourceAnchor);
  const to = anchorMap.get(resolvedAnchor);
  if (!from || !to) throw new Error(`Unknown prop anchor: ${sourceAnchor} -> ${resolvedAnchor}`);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {sourceAnchor, resolvedAnchor, transform: dx || dy ? ` transform=\"translate(${dx} ${dy})\"` : ''};
}

const baseDefs = extractDefs(baseSource);
const baseGroupOrder = ['halo','leg-left','leg-right','torso','arm-left','arm-right','hand-left','hand-right','head','face','shading'];
const baseGroups = baseGroupOrder.map((id) => extractTopGroup(baseSource, id)).join('\n  ');
const avatarShading = `<g id="shading" aria-hidden="true" pointer-events="none">\n    ${extractElement(baseSource,'head-rim-light')}\n    ${extractElement(baseSource,'visor-ambient-occlusion')}\n  </g>`;
const avatarStructuralGroups = [extractTopGroup(baseSource,'halo'), extractTopGroup(baseSource,'head'), avatarShading].join('\n  ');

function expressionBody(expressionId, accent) {
  const symbol = extractSymbol(expressionsSource, `ag-expression-${expressionId}`);
  if (symbol.attrs['data-anchor-ref'] !== 'gaze-center') throw new Error(`Expression ${expressionId} must bind gaze-center`);
  return `<g id="face" data-pivot-anchor="gaze-center" data-expression="${expressionId}" color="${accent}">${symbol.body}</g>`;
}
function replaceFace(groups, expressionId, accent) {
  const face = extractTopGroup(groups, 'face');
  return groups.replace(face, expressionBody(expressionId, accent));
}

function svgDocument({title, description, role, state, accent, groups, viewBox='0 0 512 512', kind='composition'}) {
  const safeTitle = escapeXml(title);
  const safeDesc = escapeXml(description);
  const metadata = [
    `data-generated="aftergraph-character-composition-v1"`,
    `data-kind="${kind}"`,
    `data-theme="dark"`,
    role ? `data-role="${role}"` : '',
    state ? `data-state="${state}"` : '',
  ].filter(Boolean).join(' ');
  const defs = replaceAccent(baseDefs, accent);
  return `<!-- GENERATED FILE: edit characters/source/*, never this derived file. -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="generated-title generated-desc" ${metadata}>\n  <title id="generated-title">${safeTitle}</title>\n  <desc id="generated-desc">${safeDesc}</desc>\n  ${defs}\n  <g id="composition-root">\n  ${groups}\n  </g>\n</svg>\n`;
}
function composition(role, state) {
  const accent = roleToken(role.accentToken);
  const roleSymbol = extractSymbol(rolesSource, `ag-role-${role.id}-prop`);
  const stateSymbol = extractSymbol(statesSource, `ag-state-${state.id}-prop`);
  const expressionId = expressionRegistry.stateDefaults[state.id];
  if (!expressionId) throw new Error(`No default expression for state ${state.id}`);
  const posed = poseBase(replaceFace(replaceAccent(baseGroups, accent), expressionId, accent), stateSymbol);
  const rolePlacement = resolveRolePropPlacement(roleSymbol, stateSymbol);
  return svgDocument({
    title: `${role.displayName} — ${state.id}`,
    description: `Derived Aftergraph character composition for role ${role.id} in runtime state ${state.id}. Visual state is not evidence.`,
    role: role.id,
    state: state.id,
    accent,
    groups: `${posed}\n  <g id="role-prop" data-role="${role.id}" data-source-anchor="${rolePlacement.sourceAnchor}" data-resolved-anchor="${rolePlacement.resolvedAnchor}" data-anchor-ref="${rolePlacement.resolvedAnchor}"${rolePlacement.transform}>${roleSymbol.body}</g>\n  <g id="state-prop" data-state="${state.id}" data-anchor-ref="${stateSymbol.attrs['data-anchor-ref']}" data-pose="${stateSymbol.attrs['data-pose'] || 'neutral'}">${stateSymbol.body}</g>`,
  });
}
function roleStandalone(role) {
  const accent = roleToken(role.accentToken);
  const roleSymbol = extractSymbol(rolesSource, `ag-role-${role.id}-prop`);
  const neutral = replaceFace(replaceAccent(baseGroups, accent), 'neutral', accent);
  return svgDocument({title: `${role.displayName} — role source export`, description: `Standalone role composition derived from the canonical Aftergraph anatomy and ${role.id} role module.`, role: role.id, accent, kind:'role', groups: `${neutral}\n  <g id="role-prop" data-role="${role.id}" data-anchor-ref="${roleSymbol.attrs['data-anchor-ref']}">${roleSymbol.body}</g>`});
}
function stateStandalone(state) {
  const stateSymbol = extractSymbol(statesSource, `ag-state-${state.id}-prop`);
  const expressionId = expressionRegistry.stateDefaults[state.id];
  const posed = poseBase(replaceFace(baseGroups, expressionId, canonicalAccent), stateSymbol);
  return svgDocument({title: `Aftergraph actor — ${state.id}`, description: `Standalone runtime-state composition derived from canonical anatomy. ${state.meaning}`, state:state.id, accent:canonicalAccent, kind:'state', groups: `${posed}\n  <g id="state-prop" data-state="${state.id}" data-anchor-ref="${stateSymbol.attrs['data-anchor-ref']}" data-pose="${stateSymbol.attrs['data-pose'] || 'neutral'}">${stateSymbol.body}</g>`});
}
function avatar(role) {
  const accent = roleToken(role.accentToken);
  const groups = `${replaceAccent(avatarStructuralGroups, accent)}\n  ${expressionBody('neutral', accent)}`;
  return svgDocument({title:`${role.displayName} — avatar`, description:`Compact avatar derived from the same halo, head, face, and shading anatomy as the full ${role.id} character.`, role:role.id, accent, kind:'avatar', viewBox:'96 36 320 280', groups});
}

const outputs = new Map();
for (const role of roles) outputs.set(`characters/generated/roles/${role.id}.svg`, roleStandalone(role));
for (const state of states) outputs.set(`characters/generated/states/${state.id}.svg`, stateStandalone(state));
for (const role of roles) for (const state of states) outputs.set(`characters/generated/compositions/${role.id}--${state.id}.svg`, composition(role,state));
for (const role of roles) outputs.set(`characters/generated/avatars/${role.id}.svg`, avatar(role));

const darkDerived = [...outputs.entries()];
for (const [rel, content] of darkDerived) {
  const lightRel = rel.replace('characters/generated/', 'characters/generated/themes/light/');
  outputs.set(lightRel, applyTheme(content, 'light'));
}

const manifest = {
  $schema:'aftergraph.character-generated-assets.v1',
  version:'1.0.0',
  sourceOfTruth:'characters/source',
  generator:'scripts/compose-characters.mjs',
  viewBox:'0 0 512 512',
  themes:{dark:{root:'characters/generated'},light:{root:'characters/generated/themes/light'}},
  roles:roles.map((r)=>({id:r.id,path:`characters/generated/roles/${r.id}.svg`})),
  states:states.map((s)=>({id:s.id,path:`characters/generated/states/${s.id}.svg`})),
  avatars:roles.map((r)=>({id:r.id,path:`characters/generated/avatars/${r.id}.svg`})),
  compositions:roles.flatMap((r)=>states.map((s)=>({role:r.id,state:s.id,path:`characters/generated/compositions/${r.id}--${s.id}.svg`}))),
  integrity:[...outputs].map(([p,c])=>({path:p,sha256:sha256(c)})),
};
outputs.set('characters/generated/manifest.json', `${JSON.stringify(manifest,null,2)}\n`);

const drift = [];
for (const [rel, content] of outputs) {
  const file = path.join(root, rel);
  if (checkMode) {
    if (!fs.existsSync(file) || fs.readFileSync(file,'utf8') !== content) drift.push(rel);
  } else {
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.writeFileSync(file, content);
  }
}
if (checkMode && drift.length) {
  console.error(`Generated character assets drifted (${drift.length}):`);
  for (const rel of drift.slice(0,20)) console.error(`- ${rel}`);
  process.exit(1);
}
console.log(`${checkMode ? 'Verified' : 'Generated'} ${roles.length * states.length} compositions, ${roles.length} roles, ${states.length} states, and ${roles.length} avatars.`);
